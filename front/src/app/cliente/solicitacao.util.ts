export const ROTULOS_ESTADO: Record<string, string> = {
  ABERTA: 'Aberta',
  ORCADA: 'Orçada',
  APROVADA: 'Aprovada',
  REJEITADA: 'Rejeitada',
  REDIRECIONADA: 'Redirecionada',
  ARRUMADA: 'Arrumada',
  PAGA: 'Paga',
  FINALIZADA: 'Finalizada',
};

export const TEMA_ESTADO: Record<string, { fundo: string; texto: string; sub: string }> = {
  ABERTA: { fundo: 'rgba(160, 160, 168, 0.22)', texto: '#d8d8de', sub: '#9a9aa3' },
  ORCADA: { fundo: 'rgba(150, 96, 48, 0.38)', texto: '#f0c9a0', sub: '#c4a07a' },
  APROVADA: { fundo: 'rgba(214, 186, 52, 0.28)', texto: '#f5e38a', sub: '#d6ba34' },
  REJEITADA: { fundo: 'rgba(214, 72, 72, 0.3)', texto: '#ffb4b8', sub: '#ff8b8b' },
  REDIRECIONADA: { fundo: 'rgba(148, 108, 224, 0.3)', texto: '#d8c4ff', sub: '#c4a8f0' },
  ARRUMADA: { fundo: 'rgba(70, 132, 228, 0.3)', texto: '#b4d0ff', sub: '#6ea4ff' },
  PAGA: { fundo: 'rgba(232, 132, 52, 0.32)', texto: '#ffd0a8', sub: '#f0a05a' },
  FINALIZADA: { fundo: 'rgba(72, 176, 112, 0.3)', texto: '#b4ebc8', sub: '#6ecf8e' },
};

const FLUXO_ESTADO: Record<string, string[]> = {
  ABERTA: ['ABERTA'],
  ORCADA: ['ABERTA', 'ORCADA'],
  APROVADA: ['ABERTA', 'ORCADA', 'APROVADA'],
  REJEITADA: ['ABERTA', 'ORCADA', 'REJEITADA'],
  REDIRECIONADA: ['ABERTA', 'ORCADA', 'APROVADA', 'REDIRECIONADA'],
  ARRUMADA: ['ABERTA', 'ORCADA', 'APROVADA', 'ARRUMADA'],
  PAGA: ['ABERTA', 'ORCADA', 'APROVADA', 'ARRUMADA', 'PAGA'],
  FINALIZADA: ['ABERTA', 'ORCADA', 'APROVADA', 'ARRUMADA', 'PAGA', 'FINALIZADA'],
};

const AUTOR_ESTADO: Record<string, string> = {
  ABERTA: 'Cliente',
  ORCADA: 'Maria',
  APROVADA: 'Cliente',
  REJEITADA: 'Cliente',
  REDIRECIONADA: 'Maria',
  ARRUMADA: 'Mario',
  PAGA: 'Cliente',
  FINALIZADA: 'Maria',
};

export interface HistoricoPasso {
  estado: string;
  dataHora: string;
  autor: string;
  detalhe?: string;
}

export function rotuloEstado(estado: string): string {
  return ROTULOS_ESTADO[estado] ?? estado;
}

export function temaEstado(estado: string) {
  return TEMA_ESTADO[estado] ?? TEMA_ESTADO['ABERTA'];
}

export function formatarDataHora(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) {
    return iso;
  }

  const dia = new Intl.DateTimeFormat('pt-BR', { day: 'numeric' }).format(data);
  const mes = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(data);
  const hora = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(data);
  const mesCap = mes.charAt(0).toUpperCase() + mes.slice(1);

  return `${dia} de ${mesCap} ${hora.replace(':', 'h')}`;
}

export function formatarMoeda(valor: number | null | undefined): string {
  if (valor == null) {
    return '';
  }
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

export function agoraIso(): string {
  const agora = new Date();
  return formatarIsoLocal(agora);
}

export function historicoPara(estado: string, abertura: string): HistoricoPasso[] {
  const passos = FLUXO_ESTADO[estado] ?? ['ABERTA'];
  return passos.map((item, indice) => ({
    estado: item,
    dataHora: somarHoras(abertura, indice * 8),
    autor: AUTOR_ESTADO[item] ?? 'Sistema',
  }));
}

function somarHoras(iso: string, horas: number): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) {
    return iso;
  }
  data.setHours(data.getHours() + horas);
  return formatarIsoLocal(data);
}

function formatarIsoLocal(data: Date): string {
  const pad = (valor: number) => String(valor).padStart(2, '0');
  return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}T${pad(data.getHours())}:${pad(data.getMinutes())}:00`;
}
