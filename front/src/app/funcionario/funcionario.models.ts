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
export type ModoDetalheFuncionario = 'visualizar' | 'orcamento' | 'manutencao' | 'redirecionar' | 'finalizar';
