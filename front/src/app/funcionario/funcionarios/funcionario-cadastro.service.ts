import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';

import { API_URL } from '../../core/api';
import { Auth } from '../../core/auth';
import type { FuncionarioResumo } from '../../shared/solicitacao/solicitacao.models';

export interface FuncionarioCadastro {
  id: number;
  nome: string;
  email: string;
  dataNascimento: string;
  senha?: string;
}

export interface FuncionarioPayload {
  nome: string;
  email: string;
  dataNascimento: string;
  senha?: string;
}

@Injectable({ providedIn: 'root' })
export class FuncionarioCadastroService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(Auth);

  listar() {
    return this.http.get<FuncionarioCadastro[]>(`${API_URL}/funcionarios`, this.auth.headers());
  }

  listarResumo() {
    return this.listar().pipe(
      map((lista): FuncionarioResumo[] => lista.map((item) => ({
        id: item.id,
        nome: item.nome,
        email: item.email,
      }))),
    );
  }

  criar(payload: FuncionarioPayload) {
    return this.http.post<FuncionarioCadastro>(`${API_URL}/funcionarios`, payload, this.auth.headers());
  }

  atualizar(id: number, payload: FuncionarioPayload) {
    return this.http.put<FuncionarioCadastro>(`${API_URL}/funcionarios/${id}`, payload, this.auth.headers());
  }

  remover(id: number, _emailLogado?: string) {
    return this.http.delete<void>(`${API_URL}/funcionarios/${id}`, this.auth.headers());
  }
}
