import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { Auth } from '../core/auth';
import { resetarSolicitacaoStore, SolicitacaoStore } from '../core/solicitacao.store';
import { resetarFuncionariosCadastro } from '../funcionario/funcionario-gestao/funcionario-cadastro.store';
import { SOLICITACOES_FUNCIONARIO_DEMO } from './solicitacao.mock';
import { SolicitacaoService } from './solicitacao.service';

describe('SolicitacaoService (acoes do funcionario)', () => {
  let service: SolicitacaoService;
  let store: SolicitacaoStore;

  beforeEach(() => {
    resetarSolicitacaoStore();
    resetarFuncionariosCadastro();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Auth,
          useValue: { sessao: () => ({ token: '', perfil: 'FUNCIONARIO', nome: 'Maria', email: 'maria@manutencao.com' }) },
        },
      ],
    });

    service = TestBed.inject(SolicitacaoService);
    store = TestBed.inject(SolicitacaoStore);
  });

  it('lista todas as solicitacoes do store', async () => {
    const lista = await firstValueFrom(service.listar());
    expect(lista.length).toBe(SOLICITACOES_FUNCIONARIO_DEMO.length);
  });

  it('detalha uma solicitacao existente', async () => {
    const alvo = SOLICITACOES_FUNCIONARIO_DEMO[0];
    const detalhe = await firstValueFrom(service.detalhar(alvo.id));
    expect(detalhe.id).toBe(alvo.id);
  });

  it('rejeita detalhar uma solicitacao inexistente', async () => {
    await expect(firstValueFrom(service.detalhar(999999))).rejects.toMatchObject({
      error: expect.stringMatching(/nao encontrada/),
    });
  });

  it('RF012: efetua orcamento numa solicitacao ABERTA, registrando o funcionario logado', async () => {
    const aberta = SOLICITACOES_FUNCIONARIO_DEMO.find((item) => item.estado === 'ABERTA')!;
    const atualizada = await firstValueFrom(service.efetuarOrcamento(aberta.id, 350));

    expect(atualizada.estado).toBe('ORCADA');
    expect(atualizada.valorOrcamento).toBe(350);
    expect(atualizada.historico.at(-1)).toMatchObject({ estado: 'ORCADA', autor: 'Maria' });
  });

  it('efetuarOrcamento rejeita quando a solicitacao nao existe', async () => {
    await expect(firstValueFrom(service.efetuarOrcamento(999999, 100))).rejects.toMatchObject({
      error: expect.stringMatching(/nao encontrada/),
    });
  });

  it('RF014: efetua manutencao registrando descricao e orientacoes', async () => {
    const aprovada = SOLICITACOES_FUNCIONARIO_DEMO.find((item) => item.estado === 'APROVADA')!;
    const atualizada = await firstValueFrom(
      service.efetuarManutencao(aprovada.id, 'Troca de peca', 'Evitar molhar o equipamento'),
    );

    expect(atualizada.estado).toBe('ARRUMADA');
    expect(atualizada.descricaoManutencao).toBe('Troca de peca');
    expect(atualizada.orientacoesCliente).toBe('Evitar molhar o equipamento');
  });

  it('RF015: redireciona uma manutencao aprovada para outro funcionario', async () => {
    const aprovada = SOLICITACOES_FUNCIONARIO_DEMO.find((item) => item.estado === 'APROVADA')!;
    const atualizada = await firstValueFrom(service.redirecionar(aprovada.id, 'Mario'));

    expect(atualizada.estado).toBe('REDIRECIONADA');
    expect(atualizada.funcionarioOrigem).toBe('Maria');
    expect(atualizada.funcionarioDestino).toBe('Mario');
    expect(atualizada.historico.at(-1)?.autor).toBe('Maria → Mario');
  });

  it('RF015: nao permite redirecionar para si mesmo', async () => {
    const aprovada = SOLICITACOES_FUNCIONARIO_DEMO.find((item) => item.estado === 'APROVADA')!;
    await expect(firstValueFrom(service.redirecionar(aprovada.id, 'Maria'))).rejects.toMatchObject({
      error: expect.stringMatching(/si mesmo/),
    });
  });

  it('nao permite redirecionar sem escolher um destino', async () => {
    const aprovada = SOLICITACOES_FUNCIONARIO_DEMO.find((item) => item.estado === 'APROVADA')!;
    await expect(firstValueFrom(service.redirecionar(aprovada.id, '   '))).rejects.toMatchObject({
      error: expect.stringMatching(/Selecione/),
    });
  });

  it('nao permite redirecionar uma solicitacao fora do fluxo de manutencao', async () => {
    const aberta = SOLICITACOES_FUNCIONARIO_DEMO.find((item) => item.estado === 'ABERTA')!;
    await expect(firstValueFrom(service.redirecionar(aberta.id, 'Mario'))).rejects.toMatchObject({
      error: expect.stringMatching(/aprovada ou ja redirecionada/),
    });
  });

  it('RF016: finaliza uma solicitacao paga', async () => {
    const paga = SOLICITACOES_FUNCIONARIO_DEMO.find((item) => item.estado === 'PAGA')!;
    const atualizada = await firstValueFrom(service.finalizar(paga.id));

    expect(atualizada.estado).toBe('FINALIZADA');
    expect(atualizada.historico.at(-1)?.autor).toBe('Maria');
  });

  it('listarFuncionarios delega para o cadastro de funcionarios', async () => {
    const lista = await firstValueFrom(service.listarFuncionarios());
    expect(lista.some((item) => item.nome === 'Maria')).toBe(true);
    expect(lista.some((item) => item.nome === 'Mario')).toBe(true);
  });

  it('usa "Funcionario" como autor quando a sessao nao tem nome', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: Auth, useValue: { sessao: () => null } }],
    });
    const servicoSemSessao = TestBed.inject(SolicitacaoService);

    const aberta = SOLICITACOES_FUNCIONARIO_DEMO.find((item) => item.estado === 'ABERTA')!;
    const atualizada = await firstValueFrom(servicoSemSessao.efetuarOrcamento(aberta.id, 100));
    expect(atualizada.historico.at(-1)?.autor).toBe('Funcionario');
  });
});
