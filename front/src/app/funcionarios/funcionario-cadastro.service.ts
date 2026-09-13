import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

import { emailClienteDemoExiste } from '../core/usuarios.mock';
import type { FuncionarioResumo } from '../funcionario/funcionario.models';
import {
  atualizarFuncionarioCadastro,
  criarFuncionarioCadastro,
  emailFuncionarioExiste,
  listarFuncionariosCadastro,
  removerFuncionarioCadastro,
  type FuncionarioCadastro,
  type FuncionarioPayload,
} from './funcionario-cadastro.store';

@Injectable({ providedIn: 'root' })
export class FuncionarioCadastroService {
  listar(): Observable<FuncionarioCadastro[]> {
    return of(listarFuncionariosCadastro());
  }

  listarResumo(): Observable<FuncionarioResumo[]> {
    return of(listarFuncionariosCadastro().map((item) => ({
      id: item.id,
      nome: item.nome,
      email: item.email,
    })));
  }

  criar(payload: FuncionarioPayload) {
    return this.executar(() => {
      this.garantirEmailLivre(payload.email);
      return criarFuncionarioCadastro(payload);
    });
  }

  atualizar(id: number, payload: FuncionarioPayload) {
    return this.executar(() => {
      this.garantirEmailLivre(payload.email, id);
      return atualizarFuncionarioCadastro(id, payload);
    });
  }

  remover(id: number, emailLogado?: string) {
    return this.executar(() => {
      removerFuncionarioCadastro(id, emailLogado);
      return undefined;
    });
  }

  private garantirEmailLivre(email: string, ignorarId?: number) {
    if (emailFuncionarioExiste(email, ignorarId) || emailClienteDemoExiste(email)) {
      throw new Error('Erro: O e-mail informado ja esta cadastrado.');
    }
  }

  private executar<T>(acao: () => T) {
    try {
      return of(acao());
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : 'Nao foi possivel concluir a operacao.';
      return throwError(() => ({ error: mensagem }));
    }
  }
}
