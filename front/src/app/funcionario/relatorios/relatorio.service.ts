import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';

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

