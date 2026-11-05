import type { HistoricoPasso } from './solicitacao.util';
import type { ClienteSolicitacao, SolicitacaoFuncionario } from './solicitacao.models';

export interface SolicitacaoApi {
  id: number;
  dataHoraAbertura: string;
  descricaoEquipamento: string;
  descricaoDefeito: string;
  estadoAtual?: string;
  estado?: string;
  valorOrcamento?: number | string | null;
  motivoRejeicao?: string | null;
  descricaoManutencao?: string | null;
  orientacoesCliente?: string | null;
  cliente?: {
    id?: number;
    nome?: string;
    email?: string;
    cpf?: string;
    telefone?: string;
    endereco?: string | {
      cep?: string;
      logradouro?: string;
      numero?: string;
      complemento?: string;
      bairro?: string;
      cidade?: string;
      estado?: string;
    };
  };
  categoria?: string | { id?: number; nome?: string };
  funcionarioResponsavel?: { id?: number; nome?: string; email?: string } | null;
}

export interface HistoricoApi {
  dataHora?: string;
  estadoAlcancado?: string;
  estado?: string;
  funcionarioOrigem?: { nome?: string } | null;
  funcionarioDestino?: { nome?: string } | null;
}

export function paraSolicitacaoFuncionario(
  item: SolicitacaoApi,
  historico: HistoricoApi[] = [],
): SolicitacaoFuncionario {
  const cliente = paraCliente(item.cliente);
  return {
    id: item.id,
    dataHoraAbertura: item.dataHoraAbertura,
    descricaoEquipamento: item.descricaoEquipamento,
    descricaoDefeito: item.descricaoDefeito,
    categoria: nomeCategoria(item.categoria),
    estado: estadoDe(item),
    valorOrcamento: numeroOuNulo(item.valorOrcamento),
    cliente,
    funcionarioDestino: item.funcionarioResponsavel?.nome ?? null,
    descricaoManutencao: item.descricaoManutencao ?? null,
    orientacoesCliente: item.orientacoesCliente ?? null,
    motivoRejeicao: item.motivoRejeicao ?? null,
    historico: historico.map(paraHistorico),
  };
}

export function paraSolicitacaoCliente(
  item: SolicitacaoApi,
  historico: HistoricoApi[] = [],
) {
  const mapeada = paraSolicitacaoFuncionario(item, historico);
  return {
    id: mapeada.id,
    dataHoraAbertura: mapeada.dataHoraAbertura,
    descricaoEquipamento: mapeada.descricaoEquipamento,
    categoria: mapeada.categoria,
    estado: mapeada.estado,
    valorOrcamento: mapeada.valorOrcamento,
    descricaoDefeito: mapeada.descricaoDefeito,
    motivoRejeicao: mapeada.motivoRejeicao,
    descricaoManutencao: mapeada.descricaoManutencao,
    orientacoesCliente: mapeada.orientacoesCliente,
    nomeCliente: mapeada.cliente.nome,
    historico: mapeada.historico,
  };
}

function paraCliente(cliente?: SolicitacaoApi['cliente']): ClienteSolicitacao {
  return {
    id: cliente?.id ?? 0,
    nome: cliente?.nome ?? 'Cliente',
    email: cliente?.email ?? '',
    cpf: cliente?.cpf ?? '',
    telefone: cliente?.telefone ?? '',
    endereco: formatarEndereco(cliente?.endereco),
  };
}

function paraHistorico(passo: HistoricoApi): HistoricoPasso {
  const origem = passo.funcionarioOrigem?.nome?.trim() ?? '';
  const destino = passo.funcionarioDestino?.nome?.trim() ?? '';
  let autor = origem || 'Cliente';
  if (origem && destino) {
    autor = `${origem} → ${destino}`;
  } else if (destino) {
    autor = destino;
  }

  return {
    estado: passo.estadoAlcancado ?? passo.estado ?? '',
    dataHora: passo.dataHora ?? '',
    autor,
  };
}

function estadoDe(item: SolicitacaoApi): string {
  return item.estadoAtual ?? item.estado ?? '';
}

function nomeCategoria(categoria: SolicitacaoApi['categoria']): string {
  if (!categoria) {
    return '';
  }
  return typeof categoria === 'string' ? categoria : categoria.nome ?? '';
}

function formatarEndereco(endereco: NonNullable<SolicitacaoApi['cliente']>['endereco']): string {
  if (!endereco) {
    return '';
  }
  if (typeof endereco === 'string') {
    return endereco;
  }
  return [
    endereco.logradouro,
    endereco.numero,
    endereco.complemento,
    endereco.bairro,
    endereco.cidade,
    endereco.estado,
    endereco.cep,
  ].filter((parte) => Boolean(parte?.trim())).join(', ');
}

function numeroOuNulo(valor: number | string | null | undefined): number | null {
  if (valor == null || valor === '') {
    return null;
  }
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}
