import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, of, timeout } from 'rxjs';

import { API_URL } from '../core/api';
import { Auth } from '../core/auth';
import { SOLICITACOES_DEMO } from './solicitacao.mock';

export interface SolicitacaoResumo {
  id: number;
  dataHoraAbertura: string;
  descricaoEquipamento: string;
  categoria: string;
  estado: string;
  valorOrcamento: number | null;
}

export interface NovaSolicitacaoPayload {
  descricaoEquipamento: string;
  categoriaId: number;
  descricaoDefeito: string;
  categoriaNome: string;
}

@Injectable({ providedIn: 'root' })
export class SolicitacaoService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(Auth);
  private readonly locais: SolicitacaoResumo[] = [];

  listarDoCliente() {
    return this.http.get<SolicitacaoResumo[]>(`${API_URL}/solicitacoes`, this.auth.headers()).pipe(
      timeout(2000),
      map((lista) => this.mesclar(lista)),
      catchError(() => of(this.mesclar(SOLICITACOES_DEMO))),
    );
  }

  criar(payload: NovaSolicitacaoPayload) {
    const corpo = {
      descricaoEquipamento: payload.descricaoEquipamento,
      categoriaId: payload.categoriaId,
      descricaoDefeito: payload.descricaoDefeito,
    };

    return this.http.post<SolicitacaoResumo>(`${API_URL}/solicitacoes`, corpo, this.auth.headers()).pipe(
      timeout(2000),
      catchError(() => of(this.criarLocal(payload))),
    );
  }

  private mesclar(lista: SolicitacaoResumo[]) {
    const ids = new Set(lista.map((item) => item.id));
    return [...lista, ...this.locais.filter((item) => !ids.has(item.id))];
  }

  private criarLocal(payload: NovaSolicitacaoPayload): SolicitacaoResumo {
    const agora = new Date();
    const iso = new Date(agora.getTime() - agora.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19);

    const nova: SolicitacaoResumo = {
      id: Date.now(),
      dataHoraAbertura: iso,
      descricaoEquipamento: payload.descricaoEquipamento.slice(0, 30),
      categoria: payload.categoriaNome,
      estado: 'ABERTA',
      valorOrcamento: null,
    };
    this.locais.push(nova);
    return nova;
  }
}
