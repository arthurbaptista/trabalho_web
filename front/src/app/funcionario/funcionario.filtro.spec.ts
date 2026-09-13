import { SOLICITACOES_FUNCIONARIO_DEMO } from './funcionario.mock';
import { filtrarSolicitacoesFuncionario } from './funcionario.filtro';

describe('filtrarSolicitacoesFuncionario', () => {
  const lista = SOLICITACOES_FUNCIONARIO_DEMO;

  it('filtra por hoje usando a data de abertura', () => {
    const visiveis = filtrarSolicitacoesFuncionario(lista, {
      vista: 'todas',
      filtro: 'HOJE',
      dataInicio: '',
      dataFim: '',
      nomeFuncionario: 'Maria',
      hoje: '2026-02-10',
    });
    expect(visiveis.length).toBeGreaterThan(0);
    expect(visiveis.every((item) => item.dataHoraAbertura.startsWith('2026-02-10'))).toBe(true);
  });

  it('filtra o periodo mesmo com uma data so', () => {
    const visiveis = filtrarSolicitacoesFuncionario(lista, {
      vista: 'todas',
      filtro: 'PERIODO',
      dataInicio: '2026-03-01',
      dataFim: '',
      nomeFuncionario: 'Maria',
    });
    expect(visiveis.every((item) => item.dataHoraAbertura.slice(0, 10) >= '2026-03-01')).toBe(true);
    expect(visiveis.length).toBeGreaterThan(0);
  });

  it('filtra o periodo entre inicio e fim', () => {
    const visiveis = filtrarSolicitacoesFuncionario(lista, {
      vista: 'todas',
      filtro: 'PERIODO',
      dataInicio: '2026-02-01',
      dataFim: '2026-02-28',
      nomeFuncionario: 'Maria',
    });
    expect(visiveis.every((item) => {
      const dia = item.dataHoraAbertura.slice(0, 10);
      return dia >= '2026-02-01' && dia <= '2026-02-28';
    })).toBe(true);
    expect(visiveis.length).toBeGreaterThan(0);
  });

  it('mantem todas quando o periodo ainda nao tem datas', () => {
    const todas = filtrarSolicitacoesFuncionario(lista, {
      vista: 'todas',
      filtro: 'TODAS',
      dataInicio: '',
      dataFim: '',
      nomeFuncionario: 'Maria',
    });
    const periodoVazio = filtrarSolicitacoesFuncionario(lista, {
      vista: 'todas',
      filtro: 'PERIODO',
      dataInicio: '',
      dataFim: '',
      nomeFuncionario: 'Maria',
    });
    expect(periodoVazio.map((item) => item.id)).toEqual(todas.map((item) => item.id));
  });
});
