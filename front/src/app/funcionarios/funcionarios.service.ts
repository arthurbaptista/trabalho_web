import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { TimeoutError, catchError, map, of, throwError, timeout } from 'rxjs';

import { API_URL, backendForaDoAr } from '../core/api';
import { Auth } from '../core/auth';
import {
  FuncionarioRegistro,
  atualizarFuncionarioDemo,
  criarFuncionarioDemo,
  desativarFuncionarioDemo,
  listarFuncionariosDemo,
} from '../core/funcionarios.mock';

export interface FuncionarioPayload {
  nome: string;
  email: string;
  dataNascimento: string;
}

@Injectable({ providedIn: 'root' })
export class FuncionariosService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(Auth);

  listar() {
    return this.http.get<FuncionarioRegistro[]>(`${API_URL}/funcionarios`, this.auth.headers()).pipe(
      timeout(2000),
      catchError(() => of(listarFuncionariosDemo())),
    );
  }

  criar(payload: FuncionarioPayload) {
    return this.http.post<FuncionarioRegistro>(`${API_URL}/funcionarios`, payload, this.auth.headers()).pipe(
      timeout(2000),
      catchError((erro) => this.tentarLocal(erro, () => criarFuncionarioDemo(payload))),
    );
  }

  atualizar(id: number, payload: FuncionarioPayload) {
    return this.http.put<FuncionarioRegistro>(`${API_URL}/funcionarios/${id}`, payload, this.auth.headers()).pipe(
      timeout(2000),
      catchError((erro) => this.tentarLocal(erro, () => atualizarFuncionarioDemo(id, payload))),
    );
  }

  remover(id: number) {
    const nomeLogado = this.auth.sessao()?.nome ?? '';
    return this.http.delete<void>(`${API_URL}/funcionarios/${id}`, this.auth.headers()).pipe(
      timeout(2000),
      map(() => undefined),
      catchError((erro) => this.tentarLocal(erro, () => {
        desativarFuncionarioDemo(id, nomeLogado);
        return undefined;
      })),
    );
  }

  private tentarLocal<T>(erroHttp: unknown, acaoLocal: () => T) {
    const indisponivel = backendForaDoAr(erroHttp) || erroHttp instanceof TimeoutError;
    if (!indisponivel) {
      return throwError(() => erroHttp);
    }

    try {
      return of(acaoLocal());
    } catch (erroLocal) {
      const mensagem = erroLocal instanceof Error ? erroLocal.message : 'Nao foi possivel concluir a operacao.';
      return throwError(() => ({ error: mensagem }));
    }
  }
}
