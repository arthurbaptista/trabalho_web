import { Injectable, inject } from '@angular/core';

import { formatarMoeda } from '../cliente/solicitacao.util';
import { SolicitacaoStore } from '../core/solicitacao.store';
import type { SolicitacaoFuncionario } from '../funcionario/funcionario.models';

export interface LinhaReceita {
  chave: string;
  rotulo: string;
  quantidade: number;
  total: number;
}

export interface RelatorioReceita {
  linhas: LinhaReceita[];
  quantidade: number;
  total: number;
}

const ESTADOS_RECEITA = new Set(['PAGA', 'FINALIZADA']);

@Injectable({ providedIn: 'root' })
export class RelatorioService {
  private readonly store = inject(SolicitacaoStore);

  porPeriodo(dataInicio = '', dataFim = ''): RelatorioReceita {
    const inicio = dataInicio.trim();
    const fim = dataFim.trim();
    const agrupado = new Map<string, LinhaReceita>();

    for (const item of this.receitas()) {
      const dia = dataLocal(this.dataReceita(item));
      if (inicio && dia < inicio) {
        continue;
      }
      if (fim && dia > fim) {
        continue;
      }
      const atual = agrupado.get(dia) ?? { chave: dia, rotulo: formatarDia(dia), quantidade: 0, total: 0 };
      atual.quantidade += 1;
      atual.total += item.valorOrcamento ?? 0;
      agrupado.set(dia, atual);
    }

    const linhas = [...agrupado.values()].sort((a, b) => a.chave.localeCompare(b.chave));
    return resumir(linhas);
  }

  porCategoria(): RelatorioReceita {
    const agrupado = new Map<string, LinhaReceita>();

    for (const item of this.receitas()) {
      const chave = item.categoria.trim() || 'Sem categoria';
      const atual = agrupado.get(chave) ?? { chave, rotulo: chave, quantidade: 0, total: 0 };
      atual.quantidade += 1;
      atual.total += item.valorOrcamento ?? 0;
      agrupado.set(chave, atual);
    }

    const linhas = [...agrupado.values()].sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR'));
    return resumir(linhas);
  }

  private receitas(): SolicitacaoFuncionario[] {
    return this.store.listarTodas().filter((item) =>
      ESTADOS_RECEITA.has(item.estado) && (item.valorOrcamento ?? 0) > 0,
    );
  }

  private dataReceita(item: SolicitacaoFuncionario): string {
    const passo = [...item.historico].reverse().find((entrada) => ESTADOS_RECEITA.has(entrada.estado));
    return passo?.dataHora ?? item.dataHoraAbertura;
  }
}

export function imprimirRelatorioPdf(opcoes: {
  titulo: string;
  subtitulo: string;
  colunas: [string, string, string];
  relatorio: RelatorioReceita;
}) {
  const linhas = opcoes.relatorio.linhas.length === 0
    ? '<tr><td colspan="3">Nenhum registro de receita no período.</td></tr>'
    : opcoes.relatorio.linhas.map((linha) => `
        <tr>
          <td>${escapar(linha.rotulo)}</td>
          <td>${linha.quantidade}</td>
          <td>${escapar(formatarMoeda(linha.total))}</td>
        </tr>
      `).join('');

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${escapar(opcoes.titulo)}</title>
  <style>
    body { font-family: Inter, Arial, sans-serif; color: #111; padding: 32px; }
    h1 { font-size: 22px; margin: 0 0 6px; }
    p { margin: 0 0 18px; color: #555; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 8px; border-bottom: 1px solid #ddd; text-align: left; }
    th { font-size: 12px; text-transform: uppercase; color: #666; }
    tfoot td { font-weight: 700; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>${escapar(opcoes.titulo)}</h1>
  <p>${escapar(opcoes.subtitulo)}</p>
  <table>
    <thead>
      <tr>
        <th>${escapar(opcoes.colunas[0])}</th>
        <th>${escapar(opcoes.colunas[1])}</th>
        <th>${escapar(opcoes.colunas[2])}</th>
      </tr>
    </thead>
    <tbody>${linhas}</tbody>
    <tfoot>
      <tr>
        <td>Total</td>
        <td>${opcoes.relatorio.quantidade}</td>
        <td>${escapar(formatarMoeda(opcoes.relatorio.total))}</td>
      </tr>
    </tfoot>
  </table>
</body>
</html>`;

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument;
  if (!doc) {
    iframe.remove();
    return;
  }
  doc.open();
  doc.write(html);
  doc.close();
  iframe.contentWindow?.focus();
  iframe.contentWindow?.print();
  setTimeout(() => iframe.remove(), 1500);
}

function resumir(linhas: LinhaReceita[]): RelatorioReceita {
  return {
    linhas,
    quantidade: linhas.reduce((soma, linha) => soma + linha.quantidade, 0),
    total: linhas.reduce((soma, linha) => soma + linha.total, 0),
  };
}

function dataLocal(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) {
    return iso.slice(0, 10);
  }
  const pad = (valor: number) => String(valor).padStart(2, '0');
  return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}`;
}

function formatarDia(isoDia: string): string {
  const [ano, mes, dia] = isoDia.split('-');
  if (!ano || !mes || !dia) {
    return isoDia;
  }
  return `${dia}/${mes}/${ano}`;
}

function escapar(valor: string): string {
  return valor.replace(/[&<>"']/g, (caractere) => {
    const mapa: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return mapa[caractere] ?? caractere;
  });
}
