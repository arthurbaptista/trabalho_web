import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

import { agoraIso, nomesIguais } from '../cliente/solicitacao.util';
import { Auth } from '../core/auth';
import { SolicitacaoStore } from '../core/solicitacao.store';
import { FuncionarioCadastroService } from '../funcionarios/funcionario-cadastro.service';
import type { SolicitacaoFuncionario } from './funcionario.models';

@Injectable({ providedIn: 'root' })
export class FuncionarioService {
  private readonly auth = inject(Auth);
  private readonly store = inject(SolicitacaoStore);
  private readonly funcionarios = inject(FuncionarioCadastroService);

  listar() {
    return of(this.store.listarTodas());
  }

  detalhar(id: number) {
    const local = this.store.obter(id);
    return local
      ? of(local)
      : throwError(() => ({ error: 'Solicitacao nao encontrada.' }));
  }

  listarFuncionarios() {
    return this.funcionarios.listarResumo();
  }

  efetuarOrcamento(id: number, valor: number) {
    return this.aplicarEstado(id, 'ORCADA', { valorOrcamento: valor });
  }

  efetuarManutencao(id: number, descricaoManutencao: string, orientacoesCliente: string) {
    return this.aplicarEstado(id, 'ARRUMADA', { descricaoManutencao, orientacoesCliente });
  }

  redirecionar(id: number, funcionarioDestino: string) {
    const atual = this.store.obter(id);
    if (!atual) {
      return throwError(() => ({ error: 'Solicitacao nao encontrada.' }));
    }

    const origem = this.nomeLogado();
    const destino = funcionarioDestino.trim();
    if (!destino) {
      return throwError(() => ({ error: 'Selecione um funcionario de destino.' }));
    }
    if (nomesIguais(destino, origem)) {
      return throwError(() => ({ error: 'Nao e permitido redirecionar para si mesmo.' }));
    }
    if (atual.estado !== 'APROVADA' && atual.estado !== 'REDIRECIONADA') {
      return throwError(() => ({ error: 'So e possivel redirecionar uma manutencao aprovada ou ja redirecionada.' }));
    }

    return of(this.store.guardar({
      ...atual,
      estado: 'REDIRECIONADA',
      funcionarioOrigem: origem,
      funcionarioDestino: destino,
      historico: [
        ...atual.historico,
        { estado: 'REDIRECIONADA', dataHora: agoraIso(), autor: `${origem} → ${destino}` },
      ],
    }));
  }

  finalizar(id: number) {
    return this.aplicarEstado(id, 'FINALIZADA');
  }

  private aplicarEstado(
    id: number,
    estado: string,
    extra: Partial<SolicitacaoFuncionario> = {},
  ): Observable<SolicitacaoFuncionario> {
    const atual = this.store.obter(id);
    if (!atual) {
      return throwError(() => ({ error: 'Solicitacao nao encontrada.' }));
    }

    return of(this.store.guardar({
      ...atual,
      ...extra,
      estado,
      historico: [
        ...atual.historico,
        { estado, dataHora: agoraIso(), autor: this.nomeLogado() },
      ],
    }));
  }

  private nomeLogado() {
    return this.auth.sessao()?.nome || 'Funcionario';
  }
}
