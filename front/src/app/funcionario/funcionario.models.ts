import type { HistoricoPasso } from '../cliente/solicitacao.util';

/**
 * Dados resumidos do cliente vinculado a uma solicitação,
 * exibidos na tela de detalhe do funcionário.
 */
export interface ClienteSolicitacao {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  endereco: string;
}

/**
 * Representação enxuta de um funcionário, usada em listas de
 * seleção (ex: redirecionamento de solicitação para outro funcionário).
 */
export interface FuncionarioResumo {
  id: number;
  nome: string;
  email: string;
}

/**
 * Solicitação de manutenção conforme visualizada pelo funcionário.
 * Contém tanto os dados originais do pedido quanto o histórico
 * de passos já executados (abertura, orçamento, manutenção etc).
 */
export interface SolicitacaoFuncionario {
  id: number;
  dataHoraAbertura: string;
  descricaoEquipamento: string;
  descricaoDefeito: string;
  categoria: string;
  estado: string;
  valorOrcamento: number | null;
  cliente: ClienteSolicitacao;
  /** Funcionário atualmente responsável pela solicitação. */
  funcionarioDestino: string | null;
  /** Funcionário que originou/redirecionou a solicitação, se houver. */
  funcionarioOrigem?: string | null;
  descricaoManutencao?: string | null;
  orientacoesCliente?: string | null;
  motivoRejeicao?: string | null;
  historico: HistoricoPasso[];
}

/** Define se a lista mostra apenas solicitações abertas ou todas. */
export type VistaFuncionario = 'abertas' | 'todas';

/** Filtro de período aplicado à listagem de solicitações. */
export type FiltroPeriodo = 'TODAS' | 'HOJE' | 'PERIODO';

/**
 * Modo de detalhe ativo na tela do funcionário:
 * - visualizar: apenas leitura dos dados da solicitação
 * - orcamento: funcionário está lançando/editando o valor do orçamento
 * - manutencao: funcionário está registrando a manutenção realizada
 * - redirecionar: solicitação está sendo transferida para outro funcionário
 * - finalizar: solicitação está sendo encerrada
 */
export type ModoDetalheFuncionario =
  | 'visualizar'
  | 'orcamento'
  | 'manutencao'
  | 'redirecionar'
  | 'finalizar';

/**
 * Rótulos amigáveis para os modos de detalhe, usados em títulos
 * de modal/cabeçalho da tela de funcionário.
 */
export const LABEL_MODO_DETALHE: Record<ModoDetalheFuncionario, string> = {
  visualizar: 'Visualizar solicitação',
  orcamento: 'Lançar orçamento',
  manutencao: 'Registrar manutenção',
  redirecionar: 'Redirecionar solicitação',
  finalizar: 'Finalizar solicitação',
};

/**
 * Rótulos amigáveis para os valores de FiltroPeriodo,
 * usados nos botões/select de filtro da listagem.
 */
export const LABEL_FILTRO_PERIODO: Record<FiltroPeriodo, string> = {
  TODAS: 'Todas as datas',
  HOJE: 'Somente hoje',
  PERIODO: 'Período personalizado',
};

/**
 * Estados possíveis de uma solicitação, do ponto de vista do
 * funcionário. Mantido como string livre na API, mas os valores
 * abaixo documentam o contrato esperado pelo backend.
 */
export const ESTADOS_SOLICITACAO = [
  'ABERTA',
  'EM_ORCAMENTO',
  'AGUARDANDO_APROVACAO',
  'EM_MANUTENCAO',
  'FINALIZADA',
  'REJEITADA',
] as const;

export type EstadoSolicitacao = (typeof ESTADOS_SOLICITACAO)[number];

/** Verifica se uma solicitação já está em algum estado terminal. */
export function isEstadoFinal(estado: string): boolean {
  return estado === 'FINALIZADA' || estado === 'REJEITADA';
}