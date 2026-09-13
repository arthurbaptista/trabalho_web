import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { SolicitacaoService } from '../cliente/solicitacao.service';
import { FuncionarioService } from '../funcionario/funcionario.service';
import { Auth } from './auth';
import { SolicitacaoStore, resetarSolicitacaoStore } from './solicitacao.store';

describe('Integracao das acoes cliente/funcionario', () => {
  let sessao: { nome: string; email: string; perfil: string };
  let cliente: SolicitacaoService;
  let funcionario: FuncionarioService;
  let store: SolicitacaoStore;

  beforeEach(() => {
    resetarSolicitacaoStore();
    sessao = { nome: 'Maria', email: 'maria@manutencao.com', perfil: 'FUNCIONARIO' };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: Auth, useValue: { sessao: () => sessao } }],
    });
    cliente = TestBed.inject(SolicitacaoService);
    funcionario = TestBed.inject(FuncionarioService);
    store = TestBed.inject(SolicitacaoStore);
  });

  it('propaga orcamento, aprovacao, manutencao, pagamento e finalizacao entre logins', async () => {
    const thinkPad = store.listarTodas().find((item) => item.id === 1);
    expect(thinkPad?.estado).toBe('ABERTA');
    expect(thinkPad?.cliente.email).toBe('joaquina@manutencao.com');

    entrarComo('Maria', 'maria@manutencao.com', 'FUNCIONARIO');
    await firstValueFrom(funcionario.efetuarOrcamento(1, 420));

    entrarComo('Joaquina', 'joaquina@manutencao.com', 'CLIENTE');
    const daJoaquina = await firstValueFrom(cliente.listarDoCliente());
    const orcada = daJoaquina.find((item) => item.id === 1);
    expect(orcada?.estado).toBe('ORCADA');
    expect(orcada?.valorOrcamento).toBe(420);

    await firstValueFrom(cliente.aprovar(1));

    entrarComo('Maria', 'maria@manutencao.com', 'FUNCIONARIO');
    const aposAprovacao = (await firstValueFrom(funcionario.listar())).find((item) => item.id === 1);
    expect(aposAprovacao?.estado).toBe('APROVADA');

    await firstValueFrom(funcionario.efetuarManutencao(1, 'Troca da fonte', 'Evite puxar o cabo.'));

    entrarComo('Joaquina', 'joaquina@manutencao.com', 'CLIENTE');
    const arrumada = (await firstValueFrom(cliente.listarDoCliente())).find((item) => item.id === 1);
    expect(arrumada?.estado).toBe('ARRUMADA');

    await firstValueFrom(cliente.pagar(1));

    entrarComo('Maria', 'maria@manutencao.com', 'FUNCIONARIO');
    await firstValueFrom(funcionario.finalizar(1));

    entrarComo('Joaquina', 'joaquina@manutencao.com', 'CLIENTE');
    const finalizada = (await firstValueFrom(cliente.listarDoCliente())).find((item) => item.id === 1);
    expect(finalizada?.estado).toBe('FINALIZADA');
  });

  it('propaga rejeicao e resgate do cliente para o funcionario', async () => {
    entrarComo('Maria', 'maria@manutencao.com', 'FUNCIONARIO');
    const abertaJoao = store.listarTodas().find((item) => item.estado === 'ABERTA' && item.cliente.email === 'joao@manutencao.com')!;
    await firstValueFrom(funcionario.efetuarOrcamento(abertaJoao.id, 200));

    entrarComo('Joao', 'joao@manutencao.com', 'CLIENTE');
    await firstValueFrom(cliente.rejeitar(abertaJoao.id, 'Acima do orcamento'));
    await firstValueFrom(cliente.resgatar(abertaJoao.id));

    entrarComo('Maria', 'maria@manutencao.com', 'FUNCIONARIO');
    const atual = (await firstValueFrom(funcionario.listar())).find((item) => item.id === abertaJoao.id);
    expect(atual?.estado).toBe('APROVADA');
    expect(atual?.motivoRejeicao).toBe('Acima do orcamento');
  });

  it('mostra nova solicitacao do cliente na tela do funcionario', async () => {
    entrarComo('Jose', 'jose@manutencao.com', 'CLIENTE');
    const criada = await firstValueFrom(cliente.criar({
      descricaoEquipamento: 'Monitor LG',
      categoriaId: 1,
      descricaoDefeito: 'Nao liga',
      categoriaNome: 'Desktop',
    }));

    entrarComo('Mario', 'mario@manutencao.com', 'FUNCIONARIO');
    const todas = await firstValueFrom(funcionario.listar());
    const encontrada = todas.find((item) => item.id === criada.id);
    expect(encontrada?.estado).toBe('ABERTA');
    expect(encontrada?.cliente.email).toBe('jose@manutencao.com');
    expect(encontrada?.descricaoEquipamento).toBe('Monitor LG');
  });

  it('reconhece o cliente mesmo com acento no nome da sessao', async () => {
    entrarComo('Maria', 'maria@manutencao.com', 'FUNCIONARIO');
    const abertaJoao = store.listarTodas().find((item) => item.estado === 'ABERTA' && item.cliente.email === 'joao@manutencao.com')!;
    await firstValueFrom(funcionario.efetuarOrcamento(abertaJoao.id, 150));

    entrarComo('João', 'joao@manutencao.com', 'CLIENTE');
    const lista = await firstValueFrom(cliente.listarDoCliente());
    expect(lista.find((item) => item.id === abertaJoao.id)?.estado).toBe('ORCADA');
  });

  function entrarComo(nome: string, email: string, perfil: string) {
    sessao = { nome, email, perfil };
  }

  it('redireciona a manutencao para outro funcionario e permite redirecionar de novo', async () => {
    const aprovada = store.listarTodas().find((item) => item.estado === 'APROVADA')!;

    entrarComo('Maria', 'maria@manutencao.com', 'FUNCIONARIO');
    const enviada = await firstValueFrom(funcionario.redirecionar(aprovada.id, 'Mario'));
    expect(enviada.estado).toBe('REDIRECIONADA');
    expect(enviada.funcionarioOrigem).toBe('Maria');
    expect(enviada.funcionarioDestino).toBe('Mario');
    expect(enviada.historico.at(-1)?.autor).toBe('Maria → Mario');

    entrarComo('Mario', 'mario@manutencao.com', 'FUNCIONARIO');
    const deVolta = await firstValueFrom(funcionario.redirecionar(aprovada.id, 'Maria'));
    expect(deVolta.funcionarioDestino).toBe('Maria');
    expect(deVolta.historico.filter((passo) => passo.estado === 'REDIRECIONADA')).toHaveLength(2);

    await expect(firstValueFrom(funcionario.redirecionar(aprovada.id, 'Mario'))).rejects.toBeTruthy();

    entrarComo('Maria', 'maria@manutencao.com', 'FUNCIONARIO');
    await expect(firstValueFrom(funcionario.redirecionar(aprovada.id, 'Maria'))).rejects.toBeTruthy();
    await expect(firstValueFrom(funcionario.redirecionar(aprovada.id, 'Mario'))).resolves.toBeTruthy();
  });
});
