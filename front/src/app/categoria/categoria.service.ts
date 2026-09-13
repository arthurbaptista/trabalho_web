import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, of, throwError, timeout } from 'rxjs';

import { API_URL } from '../core/api';
import { Auth } from '../core/auth';
import { CATEGORIAS_INICIAIS } from './categoria.mock';

export interface Categoria {
  id: number;
  nome: string;
  status: boolean;
}

const CHAVE = 'categorias_demo';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(Auth);
  private itens: Categoria[] = this.ler();

  listar() {
    return this.http.get<Categoria[]>(`${API_URL}/categorias`, this.opcoes()).pipe(
      timeout(2000),
      map((lista) => lista.filter((item) => item.status !== false)),
      catchError(() => of(this.ativas())),
    );
  }

  criar(nome: string) {
    const corpo = { nome: nome.trim() };
    return this.http.post<Categoria>(`${API_URL}/categorias`, corpo, this.opcoes()).pipe(
      timeout(2000),
      catchError(() => this.resultadoLocal(() => this.criarLocal(corpo.nome))),
    );
  }

  atualizar(id: number, nome: string) {
    const corpo = { nome: nome.trim() };
    return this.http.put<Categoria>(`${API_URL}/categorias/${id}`, corpo, this.opcoes()).pipe(
      timeout(2000),
      catchError(() => this.resultadoLocal(() => this.atualizarLocal(id, corpo.nome))),
    );
  }

  remover(id: number) {
    return this.http.delete<void>(`${API_URL}/categorias/${id}`, this.opcoes()).pipe(
      timeout(2000),
      catchError(() => this.resultadoLocal(() => this.removerLocal(id))),
    );
  }

  private criarLocal(nome: string): Categoria {
    const existente = this.itens.find((item) => this.mesmoNome(item.nome, nome));
    if (existente) {
      if (existente.status) {
        throw new Error('Erro: A categoria informada ja esta cadastrada.');
      }
      existente.nome = nome;
      existente.status = true;
      this.gravar();
      return { ...existente };
    }

    const nova: Categoria = {
      id: Math.max(0, ...this.itens.map((item) => item.id)) + 1,
      nome,
      status: true,
    };
    this.itens.push(nova);
    this.gravar();
    return { ...nova };
  }

  private atualizarLocal(id: number, nome: string): Categoria {
    const categoria = this.itens.find((item) => item.id === id);
    if (!categoria || !categoria.status) {
      throw new Error('Erro: Categoria nao encontrada.');
    }
    if (this.itens.some((item) => item.id !== id && item.status && this.mesmoNome(item.nome, nome))) {
      throw new Error('Erro: A categoria informada ja esta cadastrada.');
    }
    categoria.nome = nome;
    this.gravar();
    return { ...categoria };
  }

  private removerLocal(id: number): void {
    const categoria = this.itens.find((item) => item.id === id);
    if (!categoria || !categoria.status) {
      throw new Error('Erro: Categoria nao encontrada.');
    }
    categoria.status = false;
    this.gravar();
  }

  private resultadoLocal<T>(acao: () => T) {
    try {
      return of(acao());
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : 'Nao foi possivel concluir a operacao.';
      return throwError(() => ({ error: mensagem }));
    }
  }

  private ativas() {
    return this.itens.filter((item) => item.status).map((item) => ({ ...item }));
  }

  private mesmoNome(a: string, b: string) {
    return a.trim().toLowerCase() === b.trim().toLowerCase();
  }

  private ler(): Categoria[] {
    try {
      const raw = globalThis.localStorage?.getItem(CHAVE);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as Categoria[];
        }
      }
    } catch {
      // usa a massa inicial
    }
    return CATEGORIAS_INICIAIS.map((item) => ({ ...item }));
  }

  private gravar() {
    globalThis.localStorage?.setItem(CHAVE, JSON.stringify(this.itens));
  }

  private opcoes() {
    const token = this.auth.sessao()?.token;
    return token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};
  }
}
