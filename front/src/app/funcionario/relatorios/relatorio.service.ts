import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';

import { API_URL, mensagemHttpErro } from '../../core/api';
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
    return this.http.get<RelatorioReceita>(`${API_URL}/relatorios/receitas`, {
      ...this.auth.headers(),
      params: this.paramsPeriodo(dataInicio, dataFim),
    }).pipe(
      map(normalizarRelatorio),
    );
  }

  porCategoria() {
    return this.http.get<RelatorioReceita>(`${API_URL}/relatorios/receitas-categoria`, this.auth.headers()).pipe(
      map(normalizarRelatorio),
    );
  }

  baixarPdfPeriodo(dataInicio = '', dataFim = '') {
    return this.http.get(`${API_URL}/relatorios/receitas/pdf`, {
      ...this.auth.headers(),
      params: this.paramsPeriodo(dataInicio, dataFim),
      responseType: 'blob',
    });
  }

  baixarPdfCategoria() {
    return this.http.get(`${API_URL}/relatorios/receitas-categoria/pdf`, {
      ...this.auth.headers(),
      responseType: 'blob',
    });
  }

  private paramsPeriodo(dataInicio: string, dataFim: string): HttpParams {
    let params = new HttpParams();
    if (dataInicio.trim()) {
      params = params.set('dataInicio', dataInicio.trim());
    }
    if (dataFim.trim()) {
      params = params.set('dataFim', dataFim.trim());
    }
    return params;
  }
}

export function mensagemRelatorio(erro: unknown, acao: string): string {
  const status = statusHttp(erro);
  if (status === 0) {
    return `Nao foi possivel ${acao}. Verifique se a API esta no ar.`;
  }
  if (status === 401) {
    return 'Sessao invalida ou token expirado. Entre novamente.';
  }
  if (status === 403) {
    return 'Acesso negado. Apenas o funcionario pode ver este relatorio.';
  }
  return mensagemHttpErro(erro, `Nao foi possivel ${acao}.`);
}

export function baixarArquivo(blob: Blob, nome: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
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

function statusHttp(erro: unknown): number | null {
  if (!erro || typeof erro !== 'object' || !('status' in erro)) {
    return null;
  }
  const status = (erro as { status: unknown }).status;
  return typeof status === 'number' ? status : null;
}
