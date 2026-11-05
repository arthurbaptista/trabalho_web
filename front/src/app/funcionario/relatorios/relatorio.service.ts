import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';

import { formatarMoeda } from '../../shared/solicitacao/solicitacao.util';
import { API_URL } from '../../core/api';
import { Auth } from '../../core/auth';

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

@Injectable({ providedIn: 'root' })
export class RelatorioService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(Auth);

  porPeriodo(dataInicio = '', dataFim = '') {
    let params = new HttpParams();
    if (dataInicio.trim()) {
      params = params.set('dataInicio', dataInicio.trim());
    }
    if (dataFim.trim()) {
      params = params.set('dataFim', dataFim.trim());
    }
    return this.http.get<RelatorioReceita>(`${API_URL}/relatorios/receitas`, {
      ...this.auth.headers(),
      params,
    }).pipe(
      map(normalizarRelatorio),
    );
  }

  porCategoria() {
    return this.http.get<RelatorioReceita>(`${API_URL}/relatorios/receitas-categoria`, this.auth.headers()).pipe(
      map(normalizarRelatorio),
    );
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

function normalizarRelatorio(relatorio: RelatorioReceita): RelatorioReceita {
  const linhas = (relatorio.linhas ?? []).map((linha) => ({
    chave: linha.chave,
    rotulo: linha.rotulo,
    quantidade: Number(linha.quantidade) || 0,
    total: Number(linha.total) || 0,
  }));
  return {
    linhas,
    quantidade: Number(relatorio.quantidade) || linhas.reduce((soma, linha) => soma + linha.quantidade, 0),
    total: Number(relatorio.total) || linhas.reduce((soma, linha) => soma + linha.total, 0),
  };
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
