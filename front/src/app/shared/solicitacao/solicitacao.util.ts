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
  ABERTA: { fundo: 'rgba(160, 160, 168, 0.22)', texto: '#3a3a42', sub: '#5c5c66' },
  ORCADA: { fundo: 'rgba(150, 96, 48, 0.38)', texto: '#6b3a12', sub: '#8a4e22' },
  APROVADA: { fundo: 'rgba(214, 186, 52, 0.28)', texto: '#6a5608', sub: '#8a7010' },
  REJEITADA: { fundo: 'rgba(214, 72, 72, 0.3)', texto: '#8f1d24', sub: '#a33a3a' },
  REDIRECIONADA: { fundo: 'rgba(148, 108, 224, 0.3)', texto: '#4a2a8a', sub: '#5c3a9a' },
  ARRUMADA: { fundo: 'rgba(70, 132, 228, 0.3)', texto: '#1a3f8a', sub: '#1f4e8c' },
  PAGA: { fundo: 'rgba(232, 132, 52, 0.32)', texto: '#8a4200', sub: '#a35210' },
  FINALIZADA: { fundo: 'rgba(72, 176, 112, 0.3)', texto: '#0d6b3a', sub: '#146b40' },
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

export interface HistoricoPasso {
  estado: string;
  dataHora: string;
  autor: string;
}

export function rotuloEstado(estado: string): string {
  return ROTULOS_ESTADO[estado] ?? estado;
}

export function normalizarTexto(valor: string): string {
  return valor
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function nomesIguais(a: string | null | undefined, b: string | null | undefined): boolean {
  const esquerda = normalizarTexto(a ?? '');
  const direita = normalizarTexto(b ?? '');
  return Boolean(esquerda) && esquerda === direita;
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

export function rotuloAutor(autor: string, nomeCliente?: string | null): string {
  const nome = nomeCliente?.trim() ?? '';
  const autorNorm = autor.trim() || 'Cliente';
  if (!nome) {
    return autorNorm;
  }

  const semPrefixo = autorNorm.replace(/^cliente\s+/i, '').trim();
  const ehCliente =
    autorNorm.toLowerCase() === 'cliente'
    || nomesIguais(autorNorm, nome)
    || nomesIguais(semPrefixo, nome);

  return ehCliente ? `Cliente ${nome}` : autorNorm;
}

export function historicoPara(
  estado: string,
  abertura: string,
  nomeCliente?: string,
  opcoes?: { funcionario?: string; funcionarioDestino?: string | null },
): HistoricoPasso[] {
  const funcionario = opcoes?.funcionario?.trim() || 'Maria';
  const destino = opcoes?.funcionarioDestino?.trim() || '';
  const passos = FLUXO_ESTADO[estado] ?? ['ABERTA'];
  return passos.map((item, indice) => ({
    estado: item,
    dataHora: somarHoras(abertura, indice * 8),
    autor: autorDoEstado(item, nomeCliente, funcionario, destino),
  }));
}

function autorDoEstado(
  estado: string,
  nomeCliente: string | undefined,
  funcionario: string,
  destino: string,
): string {
  if (estado === 'ABERTA' || estado === 'APROVADA' || estado === 'REJEITADA' || estado === 'PAGA') {
    return rotuloAutor('Cliente', nomeCliente);
  }
  if (estado === 'REDIRECIONADA') {
    return destino ? `${funcionario} → ${destino}` : funcionario;
  }
  if ((estado === 'ARRUMADA' || estado === 'FINALIZADA') && destino) {
    return destino;
  }
  return funcionario;
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
