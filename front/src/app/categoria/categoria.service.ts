import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { API_URL } from '../core/api';
import { Auth } from '../core/auth';

export interface Categoria {
  id: number;
  nome: string;
  status: boolean;
}

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(Auth);

  listar() {
    return this.http.get<Categoria[]>(`${API_URL}/categorias`, this.opcoes());
  }

  criar(nome: string) {
    return this.http.post<Categoria>(`${API_URL}/categorias`, { nome }, this.opcoes());
  }

  atualizar(id: number, nome: string) {
    return this.http.put<Categoria>(`${API_URL}/categorias/${id}`, { nome }, this.opcoes());
  }

  remover(id: number) {
    return this.http.delete<void>(`${API_URL}/categorias/${id}`, this.opcoes());
  }

  private opcoes() {
    const token = this.auth.sessao()?.token;
    return token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};
  }
}
