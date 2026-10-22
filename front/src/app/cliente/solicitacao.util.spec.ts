import {
  ROTULOS_ESTADO,
  TEMA_ESTADO,
  agoraIso,
  formatarDataHora,
  formatarMoeda,
  historicoPara,
  nomesIguais,
  normalizarTexto,
  rotuloAutor,
  rotuloEstado,
  temaEstado,
} from './solicitacao.util';

const ESTADOS = ['ABERTA', 'ORCADA', 'APROVADA', 'REJEITADA', 'REDIRECIONADA', 'ARRUMADA', 'PAGA', 'FINALIZADA'];

describe('normalizarTexto / nomesIguais', () => {
  it('ignora acentos, caixa e espacos nas pontas', () => {
    expect(normalizarTexto('  João  ')).toBe('joao');
    expect(nomesIguais('João', 'joao')).toBe(true);
    expect(nomesIguais(' JOANA ', 'joana')).toBe(true);
  });

  it('considera nomes diferentes como diferentes', () => {
    expect(nomesIguais('Joao', 'Joana')).toBe(false);
  });

  it('nunca considera iguais nomes vazios ou nulos', () => {
    expect(nomesIguais('', '')).toBe(false);
    expect(nomesIguais(null, 'Joao')).toBe(false);
    expect(nomesIguais(undefined, undefined)).toBe(false);
  });
});

describe('rotuloEstado / temaEstado', () => {
  it('tem rotulo e tema para todos os estados do fluxo', () => {
    for (const estado of ESTADOS) {
      expect(ROTULOS_ESTADO[estado]).toBeTruthy();
      expect(TEMA_ESTADO[estado].fundo).toBeTruthy();
      expect(TEMA_ESTADO[estado].texto).toBeTruthy();
      expect(TEMA_ESTADO[estado].sub).toBeTruthy();
    }
  });

  it('traduz estados conhecidos e devolve o proprio valor para desconhecidos', () => {
    expect(rotuloEstado('ORCADA')).toBe('Orçada');
    expect(rotuloEstado('XYZ')).toBe('XYZ');
  });

  it('cai para o tema de ABERTA quando o estado e desconhecido', () => {
    expect(temaEstado('XYZ')).toEqual(TEMA_ESTADO['ABERTA']);
    expect(temaEstado('PAGA')).toEqual(TEMA_ESTADO['PAGA']);
  });
});

describe('formatarMoeda', () => {
  it('formata valores no padrao BRL', () => {
    expect(formatarMoeda(1234.5)).toContain('1.234,50');
    expect(formatarMoeda(1234.5)).toContain('R$');
  });

  it('devolve vazio para nulo ou indefinido, mas formata o zero', () => {
    expect(formatarMoeda(null)).toBe('');
    expect(formatarMoeda(undefined)).toBe('');
    expect(formatarMoeda(0)).toContain('0,00');
  });
});

describe('formatarDataHora / agoraIso', () => {
  it('formata uma data ISO no estilo "15 de Março 14h30"', () => {
    expect(formatarDataHora('2026-03-15T14:30:00')).toBe('15 de Março 14h30');
  });

  it('devolve o proprio texto quando a data e invalida', () => {
    expect(formatarDataHora('nao-e-data')).toBe('nao-e-data');
  });

  it('agoraIso gera um ISO local sem milissegundos nem fuso', () => {
    expect(agoraIso()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00$/);
  });
});

describe('rotuloAutor', () => {
  it('troca "Cliente" generico pelo nome do cliente', () => {
    expect(rotuloAutor('Cliente', 'Joana')).toBe('Cliente Joana');
  });

  it('nao duplica o prefixo quando ja vem "Cliente <nome>"', () => {
    expect(rotuloAutor('Cliente Joana', 'Joana')).toBe('Cliente Joana');
  });

  it('mantem funcionarios inalterados e trata autor vazio como Cliente', () => {
    expect(rotuloAutor('Maria', 'Joana')).toBe('Maria');
    expect(rotuloAutor('   ')).toBe('Cliente');
  });

  it('sem nome de cliente devolve o autor como veio', () => {
    expect(rotuloAutor('Mario')).toBe('Mario');
  });
});

describe('historicoPara', () => {
  const ABERTURA = '2026-01-01T10:00:00';

  it('gera um passo por estado do fluxo ate o estado pedido', () => {
    const estados = historicoPara('PAGA', ABERTURA, 'Joao').map((passo) => passo.estado);
    expect(estados).toEqual(['ABERTA', 'ORCADA', 'APROVADA', 'ARRUMADA', 'PAGA']);
  });

  it('espaca os passos em 8 horas', () => {
    const datas = historicoPara('APROVADA', ABERTURA, 'Joao').map((passo) => passo.dataHora);
    expect(datas).toEqual(['2026-01-01T10:00:00', '2026-01-01T18:00:00', '2026-01-02T02:00:00']);
  });

  it('atribui cada passo ao autor certo (cliente x funcionario)', () => {
    const autores = Object.fromEntries(
      historicoPara('PAGA', ABERTURA, 'Joao', { funcionario: 'Mario' }).map((p) => [p.estado, p.autor]),
    );
    expect(autores['ABERTA']).toBe('Cliente Joao');
    expect(autores['ORCADA']).toBe('Mario');
    expect(autores['APROVADA']).toBe('Cliente Joao');
    expect(autores['ARRUMADA']).toBe('Mario');
    expect(autores['PAGA']).toBe('Cliente Joao');
  });

  it('usa Maria como funcionario padrao', () => {
    const orcada = historicoPara('ORCADA', ABERTURA, 'Joao').find((p) => p.estado === 'ORCADA');
    expect(orcada?.autor).toBe('Maria');
  });

  it('mostra origem e destino no passo de redirecionamento', () => {
    const passos = historicoPara('REDIRECIONADA', ABERTURA, 'Joao', {
      funcionario: 'Maria',
      funcionarioDestino: 'Mario',
    });
    expect(passos.at(-1)?.autor).toBe('Maria → Mario');
  });

  it('atribui manutencao e finalizacao ao destino do redirecionamento', () => {
    const passos = historicoPara('FINALIZADA', ABERTURA, 'Joao', { funcionarioDestino: 'Mario' });
    const autores = Object.fromEntries(passos.map((p) => [p.estado, p.autor]));
    expect(autores['ARRUMADA']).toBe('Mario');
    expect(autores['FINALIZADA']).toBe('Mario');
  });

  it('cai para um unico passo ABERTA com estado desconhecido', () => {
    expect(historicoPara('XYZ', ABERTURA, 'Joao').map((p) => p.estado)).toEqual(['ABERTA']);
  });
});
