import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

import { API_URL } from './api';

export interface LoginResponse {
  token: string;
  tipo: string;
  perfil: string;
  nome: string;
}

export interface CadastroPayload {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface CadastroResponse {
  id: number;
  nome: string;
  email: string;
  mensagem: string;
  emailEnviado: boolean;
}

export interface Sessao {
  token: string;
  perfil: string;
  nome: string;
}

const CHAVE_SESSAO = 'auth';

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly sessaoSignal = signal<Sessao | null>(this.lerSessao());

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  sessao() {
    return this.sessaoSignal();
  }

  estaLogado(): boolean {
    return this.sessaoSignal() !== null;
  }

  ativarSessaoDemo() {
    if (this.sessaoSignal()) {
      return;
    }
    this.sessaoSignal.set({
      token: '',
      perfil: 'CLIENTE',
      nome: 'Joao',
    });
  }

  login(email: string, senha: string, persistente: boolean) {
    return this.http.post<LoginResponse>(`${API_URL}/auth/login`, { email, senha }).pipe(
      tap((resposta) => this.salvarSessao(resposta, persistente)),
    );
  }

  cadastrar(payload: CadastroPayload) {
    return this.http.post<CadastroResponse>(`${API_URL}/clientes/cadastro`, payload);
  }

  rotaInicial(): string {
    return this.sessaoSignal()?.perfil === 'FUNCIONARIO' ? '/categorias' : '/cliente';
  }

  headers() {
    const token = this.sessaoSignal()?.token;
    return token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};
  }

  logout() {
    localStorage.removeItem(CHAVE_SESSAO);
    sessionStorage.removeItem(CHAVE_SESSAO);
    this.sessaoSignal.set(null);
    this.router.navigateByUrl('/login');
  }

  private salvarSessao(resposta: LoginResponse, persistente: boolean) {
    const sessao: Sessao = {
      token: resposta.token,
      perfil: resposta.perfil,
      nome: resposta.nome,
    };
    const destino = persistente ? localStorage : sessionStorage;
    const outro = persistente ? sessionStorage : localStorage;
    outro.removeItem(CHAVE_SESSAO);
    destino.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
    this.sessaoSignal.set(sessao);
  }

  private lerSessao(): Sessao | null {
    try {
      const raw = globalThis.localStorage?.getItem(CHAVE_SESSAO)
        ?? globalThis.sessionStorage?.getItem(CHAVE_SESSAO);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw) as Sessao;
    } catch {
      return null;
    }
  }
}
