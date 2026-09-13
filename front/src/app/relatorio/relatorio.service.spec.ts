import { TestBed } from '@angular/core/testing';

import { RelatorioService } from './relatorio.service';
import { SolicitacaoStore, resetarSolicitacaoStore } from '../core/solicitacao.store';

describe('RelatorioService', () => {
  let service: RelatorioService;
  let store: SolicitacaoStore;

  beforeEach(() => {
    resetarSolicitacaoStore();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(RelatorioService);
    store = TestBed.inject(SolicitacaoStore);
  });

  it('agrupa receitas pagas e finalizadas por categoria', () => {
    const relatorio = service.porCategoria();
    expect(relatorio.linhas.length).toBeGreaterThan(0);
    expect(relatorio.total).toBeGreaterThan(0);
    expect(relatorio.linhas.every((linha) => linha.quantidade > 0)).toBe(true);
  });

  it('filtra receitas por periodo quando as datas sao informadas', () => {
    const todas = service.porPeriodo();
    const nenhuma = service.porPeriodo('1990-01-01', '1990-01-02');
    expect(todas.quantidade).toBeGreaterThan(0);
    expect(nenhuma.quantidade).toBe(0);
    expect(nenhuma.total).toBe(0);
  });

  it('inclui pagamento feito pelo cliente no relatorio', () => {
    const original = store.listarTodas().find((item) => item.estado === 'ARRUMADA' && item.valorOrcamento)!;
    store.guardar({
      ...original,
      estado: 'PAGA',
      historico: [
        ...original.historico,
        { estado: 'PAGA', dataHora: '2026-12-01T10:00:00', autor: 'Cliente Joao' },
      ],
    });

    const dia = service.porPeriodo('2026-12-01', '2026-12-01');
    expect(dia.quantidade).toBeGreaterThan(0);
    expect(dia.linhas[0]?.chave).toBe('2026-12-01');
  });
});
