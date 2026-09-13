import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TimeoutError, catchError, of, tap, throwError, timeout } from 'rxjs';

import { API_URL, backendForaDoAr } from './api';
import { USUARIOS_DEMO, buscarUsuarioDemo, cadastrarClienteDemo } from './usuarios.mock';

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
    const joao = USUARIOS_DEMO.find((usuario) => usuario.email === 'joao@manutencao.com');
    this.sessaoSignal.set({
      token: '',
      perfil: joao?.perfil ?? 'CLIENTE',
      nome: joao?.nome ?? 'Joao',
    });
  }

  login(email: string, senha: string, persistente: boolean) {
    return this.http.post<LoginResponse>(`${API_URL}/auth/login`, { email, senha }).pipe(
      timeout(2000),
      tap((resposta) => this.salvarSessao(resposta, persistente)),
      catchError((erro) => {
        if (!this.backendIndisponivel(erro)) {
          return throwError(() => erro);
        }

        const demo = buscarUsuarioDemo(email, senha);
        if (!demo) {
          return throwError(() => ({ error: 'E-mail ou senha invalidos.' }));
        }

        const resposta: LoginResponse = {
          token: '',
          tipo: 'Bearer',
          perfil: demo.perfil,
          nome: demo.nome,
        };
        this.salvarSessao(resposta, persistente);
        return of(resposta);
      }),
    );
  }

  cadastrar(payload: CadastroPayload) {
    return this.http.post<CadastroResponse>(`${API_URL}/clientes/cadastro`, payload).pipe(
      timeout(2000),
      catchError((erro) => {
        if (!this.backendIndisponivel(erro)) {
          return throwError(() => erro);
        }

        try {
          const demo = cadastrarClienteDemo({
            nome: payload.nome,
            email: payload.email,
            cpf: payload.cpf,
          });
          const resposta: CadastroResponse = {
            id: demo.id,
            nome: payload.nome.trim(),
            email: payload.email.trim().toLowerCase(),
            mensagem: `Cadastro realizado. Sua senha de acesso e ${demo.senha}. Use este e-mail e a senha para entrar.`,
            emailEnviado: false,
          };
          return of(resposta);
        } catch (cadastroErro) {
          const mensagem = cadastroErro instanceof Error
            ? cadastroErro.message
            : 'Nao foi possivel concluir o cadastro.';
          return throwError(() => ({ error: mensagem }));
        }
      }),
    );
  }

  rotaInicial(): string {
    return this.sessaoSignal()?.perfil === 'FUNCIONARIO' ? '/funcionario' : '/cliente';
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

  private backendIndisponivel(erro: unknown): boolean {
    return backendForaDoAr(erro) || erro instanceof TimeoutError;
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
