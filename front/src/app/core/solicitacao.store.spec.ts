import { TestBed } from '@angular/core/testing';

import { SolicitacaoStore, resetarSolicitacaoStore } from './solicitacao.store';

describe('SolicitacaoStore', () => {
  let store: SolicitacaoStore;

  beforeEach(() => {
    resetarSolicitacaoStore();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    store = TestBed.inject(SolicitacaoStore);
  });

  it('propaga o orcamento do funcionario para o cliente dono da solicitacao', () => {
    const original = store.listarTodas().find((item) => item.estado === 'ABERTA' && item.cliente.nome === 'Joao');
    expect(original).toBeTruthy();

    store.guardar({
      ...original!,
      estado: 'ORCADA',
      valorOrcamento: 350,
    });

    const doCliente = store.listarDoCliente('Joao', 'joao@manutencao.com').find((item) => item.id === original!.id);
    expect(doCliente?.estado).toBe('ORCADA');
    expect(doCliente?.valorOrcamento).toBe(350);
  });

  it('mantem a acao do funcionario depois de recarregar o armazenamento', () => {
    const original = store.listarTodas().find((item) => item.estado === 'ABERTA' && item.cliente.nome === 'Joaquina')!;
    store.guardar({ ...original, estado: 'ORCADA', valorOrcamento: 99 });

    const deNovo = TestBed.inject(SolicitacaoStore);
    const daJoaquina = deNovo.listarDoCliente('Joaquina', 'joaquina@manutencao.com').find((item) => item.id === original.id);
    expect(daJoaquina?.estado).toBe('ORCADA');
    expect(daJoaquina?.valorOrcamento).toBe(99);
  });
});
