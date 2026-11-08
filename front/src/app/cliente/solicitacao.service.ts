import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, switchMap } from 'rxjs';

import { API_URL } from '../core/api';
import { Auth } from '../core/auth';
import type { HistoricoPasso } from '../shared/solicitacao/solicitacao.util';
import {
  type HistoricoApi,
  type SolicitacaoApi,
  paraSolicitacaoCliente,
} from '../shared/solicitacao/solicitacao.mapper';

export interface SolicitacaoResumo {
  id: number;
  dataHoraAbertura: string;
  descricaoEquipamento: string;
  categoria: string;
  estado: string;
  valorOrcamento: number | null;
}

export interface SolicitacaoDetalhe extends SolicitacaoResumo {
  descricaoDefeito: string;
  motivoRejeicao?: string | null;
  descricaoManutencao?: string | null;
  orientacoesCliente?: string | null;
  nomeCliente?: string;
  historico: HistoricoPasso[];
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

  listarDoCliente() {
    return this.http.get<SolicitacaoApi[]>(`${API_URL}/api/solicitacoes/cliente`, this.auth.headers()).pipe(
      map((lista) => lista.map((item) => paraSolicitacaoCliente(item))),
    );
  }

  detalhar(id: number) {
    return this.http.get<SolicitacaoApi>(`${API_URL}/api/solicitacoes/${id}`, this.auth.headers()).pipe(
      switchMap((item) => this.comHistorico(item)),
    );
  }

  criar(payload: NovaSolicitacaoPayload) {
    return this.http.post<SolicitacaoApi>(`${API_URL}/api/solicitacoes/cliente`, {
      descricaoEquipamento: payload.descricaoEquipamento.slice(0, 30),
      categoriaId: payload.categoriaId,
      descricaoDefeito: payload.descricaoDefeito,
    }, this.auth.headers()).pipe(
      switchMap((item) => this.comHistorico(item)),
    );
  }

  aprovar(id: number) {
    return this.http.patch<SolicitacaoApi>(
      `${API_URL}/api/solicitacoes/${id}/aprovar`,
      {},
      this.auth.headers(),
    ).pipe(
      switchMap((item) => this.comHistorico(item)),
    );
  }

  rejeitar(id: number, motivoRejeicao: string) {
    return this.http.patch<SolicitacaoApi>(
      `${API_URL}/api/solicitacoes/${id}/rejeitar`,
      JSON.stringify(motivoRejeicao),
      this.opcoesJson(),
    ).pipe(
      switchMap((item) => this.comHistorico(item)),
    );
  }

  resgatar(id: number) {
    return this.http.patch<SolicitacaoApi>(
      `${API_URL}/api/solicitacoes/${id}/resgatar`,
      {},
      this.auth.headers(),
    ).pipe(
      switchMap((item) => this.comHistorico(item)),
    );
  }

  pagar(id: number) {
    return this.http.patch<SolicitacaoApi>(
      `${API_URL}/api/solicitacoes/${id}/pagar`,
      {},
      this.auth.headers(),
    ).pipe(
      switchMap((item) => this.comHistorico(item)),
    );
  }

  private comHistorico(item: SolicitacaoApi): Observable<SolicitacaoDetalhe> {
    return this.http.get<HistoricoApi[]>(
      `${API_URL}/api/solicitacoes/${item.id}/historico`,
      this.auth.headers(),
    ).pipe(
      map((historico) => paraSolicitacaoCliente(item, historico)),
      catchError(() => of(paraSolicitacaoCliente(item))),
    );
  }

  private opcoesJson() {
    const token = this.auth.sessao()?.token;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return { headers };
  }
}
