import type { HistoricoPasso } from '../cliente/solicitacao.util';

export interface ClienteSolicitacao {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  endereco: string;
}

export interface FuncionarioResumo {
  id: number;
  nome: string;
  email: string;
}

export interface SolicitacaoFuncionario {
  id: number;
  dataHoraAbertura: string;
  descricaoEquipamento: string;
  descricaoDefeito: string;
  categoria: string;
  estado: string;
  valorOrcamento: number | null;
  cliente: ClienteSolicitacao;
  funcionarioDestino: string | null;
  funcionarioOrigem?: string | null;
  descricaoManutencao?: string | null;
  orientacoesCliente?: string | null;
  motivoRejeicao?: string | null;
  historico: HistoricoPasso[];
}

export type VistaFuncionario = 'abertas' | 'todas';

export type FiltroPeriodo = 'TODAS' | 'HOJE' | 'PERIODO';

export type ModoDetalheFuncionario =
  | 'visualizar'
  | 'orcamento'
  | 'manutencao'
  | 'redirecionar'
  | 'finalizar';

export const LABEL_MODO_DETALHE: Record<ModoDetalheFuncionario, string> = {
  visualizar: 'Visualizar solicitação',
  orcamento: 'Lançar orçamento',
  manutencao: 'Registrar manutenção',
  redirecionar: 'Redirecionar solicitação',
  finalizar: 'Finalizar solicitação',
};

export const LABEL_FILTRO_PERIODO: Record<FiltroPeriodo, string> = {
  TODAS: 'Todas as datas',
  HOJE: 'Somente hoje',
  PERIODO: 'Período personalizado',
};

export const ESTADOS_SOLICITACAO = [
  'ABERTA',
  'EM_ORCAMENTO',
  'AGUARDANDO_APROVACAO',
  'EM_MANUTENCAO',
  'FINALIZADA',
  'REJEITADA',
] as const;

export type EstadoSolicitacao = (typeof ESTADOS_SOLICITACAO)[number];

export function isEstadoFinal(estado: string): boolean {
  return estado === 'FINALIZADA' || estado === 'REJEITADA';
}