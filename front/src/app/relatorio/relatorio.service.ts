import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL, mensagemHttpErro } from '../core/api';
import { Auth } from '../core/auth';

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

  porPeriodo(dataInicio = '', dataFim = ''): Observable<RelatorioReceita> {
    return this.http.get<RelatorioReceita>(`${API_URL}/relatorios/receitas`, {
      headers: this.cabecalho(),
      params: this.paramsPeriodo(dataInicio, dataFim),
    });
  }

  porCategoria(): Observable<RelatorioReceita> {
    return this.http.get<RelatorioReceita>(`${API_URL}/relatorios/receitas-categoria`, {
      headers: this.cabecalho(),
    });
  }

  baixarPdfPeriodo(dataInicio = '', dataFim = ''): Observable<Blob> {
    return this.http.get(`${API_URL}/relatorios/receitas/pdf`, {
      headers: this.cabecalho(),
      params: this.paramsPeriodo(dataInicio, dataFim),
      responseType: 'blob',
    });
  }

  baixarPdfCategoria(): Observable<Blob> {
    return this.http.get(`${API_URL}/relatorios/receitas-categoria/pdf`, {
      headers: this.cabecalho(),
      responseType: 'blob',
    });
  }

  private cabecalho(): HttpHeaders {
    const token = this.auth.sessao()?.token;
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  private paramsPeriodo(dataInicio: string, dataFim: string): HttpParams {
    let params = new HttpParams();
    const inicio = dataInicio.trim();
    const fim = dataFim.trim();
    if (inicio) {
      params = params.set('dataInicio', inicio);
    }
    if (fim) {
      params = params.set('dataFim', fim);
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

function statusHttp(erro: unknown): number | null {
  if (!erro || typeof erro !== 'object' || !('status' in erro)) {
    return null;
  }
  const status = (erro as { status: unknown }).status;
  return typeof status === 'number' ? status : null;
}
