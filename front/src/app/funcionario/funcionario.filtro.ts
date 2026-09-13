import { nomesIguais } from '../cliente/solicitacao.util';
import type { FiltroPeriodo, SolicitacaoFuncionario, VistaFuncionario } from './funcionario.models';

export function diaAbertura(iso: string): string {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(iso);
  if (match) {
    return match[1];
  }
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) {
    return '';
  }
  const pad = (valor: number) => String(valor).padStart(2, '0');
  return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}`;
}

export function hojeLocal(agora = new Date()): string {
  const pad = (valor: number) => String(valor).padStart(2, '0');
  return `${agora.getFullYear()}-${pad(agora.getMonth() + 1)}-${pad(agora.getDate())}`;
}

export function filtrarSolicitacoesFuncionario(
  solicitacoes: SolicitacaoFuncionario[],
  opcoes: {
    vista: VistaFuncionario;
    filtro: FiltroPeriodo;
    dataInicio: string;
    dataFim: string;
    nomeFuncionario: string;
    emailFuncionario?: string;
    hoje?: string;
  },
): SolicitacaoFuncionario[] {
  const ordenar = (lista: SolicitacaoFuncionario[]) =>
    [...lista].sort(
      (a, b) => new Date(a.dataHoraAbertura).getTime() - new Date(b.dataHoraAbertura).getTime(),
    );

  if (opcoes.vista === 'abertas') {
    return ordenar(solicitacoes.filter((item) => item.estado === 'ABERTA'));
  }

  const nome = opcoes.nomeFuncionario;
  const email = opcoes.emailFuncionario?.trim().toLowerCase() ?? '';
  let lista = solicitacoes.filter((item) => {
    if (item.estado !== 'REDIRECIONADA') {
      return true;
    }
    if (nomesIguais(item.funcionarioDestino, nome)) {
      return true;
    }
    return Boolean(email) && item.funcionarioDestino?.trim().toLowerCase() === email;
  });

  if (opcoes.filtro === 'HOJE') {
    const hoje = opcoes.hoje ?? hojeLocal();
    lista = lista.filter((item) => diaAbertura(item.dataHoraAbertura) === hoje);
  } else if (opcoes.filtro === 'PERIODO') {
    const inicio = opcoes.dataInicio.trim();
    const fim = opcoes.dataFim.trim();
    if (inicio || fim) {
      lista = lista.filter((item) => {
        const dia = diaAbertura(item.dataHoraAbertura);
        if (inicio && dia < inicio) {
          return false;
        }
        if (fim && dia > fim) {
          return false;
        }
        return Boolean(dia);
      });
    }
  }

  return ordenar(lista);
}
