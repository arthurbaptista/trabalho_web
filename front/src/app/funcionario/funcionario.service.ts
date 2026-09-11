import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { API_URL } from '../core/api';
import { Auth } from '../core/auth';

export interface Solicitacao {
  id: number;
  dataHoraAbertura: string;
  descricaoEquipamento: string;
  descricaoDefeito: string;
  estadoAtual: string;
  valorOrcamento: number | null;
  cliente: { id: number; nome: string; email: string };
  categoria: { id: number; nome: string };
}

@Injectable({ providedIn: 'root' })
export class FuncionarioService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(Auth);

  listarSolicitacoes() {
    return this.http.get<Solicitacao[]>(`${API_URL}/solicitacoes`, this.opcoes());
  }

  efetuarOrcamento(id: number, valor: number) {
    return this.http.post<Solicitacao>(
      `${API_URL}/api/solicitacoes/${id}/efetuar-orcamento`,
      { solicitacaoId: id, valor },
      this.opcoes(),
    );
  }

  private opcoes() {
    const token = this.auth.sessao()?.token;
    return token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};
  }
}
