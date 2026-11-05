import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, switchMap } from 'rxjs';

import { API_URL } from '../../core/api';
import { Auth } from '../../core/auth';
import { FuncionarioCadastroService } from '../funcionarios/funcionario-cadastro.service';
import {
  type HistoricoApi,
  type SolicitacaoApi,
  paraSolicitacaoFuncionario,
} from '../../shared/solicitacao/solicitacao.mapper';
import type { SolicitacaoFuncionario } from '../../shared/solicitacao/solicitacao.models';

@Injectable({ providedIn: 'root' })
export class SolicitacaoService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(Auth);
  private readonly funcionarios = inject(FuncionarioCadastroService);

  listar() {
    return this.http.get<SolicitacaoApi[]>(`${API_URL}/api/solicitacoes`, this.auth.headers()).pipe(
      map((lista) => lista.map((item) => paraSolicitacaoFuncionario(item))),
    );
  }

  detalhar(id: number) {
    return this.http.get<SolicitacaoApi>(`${API_URL}/api/solicitacoes/${id}`, this.auth.headers()).pipe(
      switchMap((item) => this.comHistorico(item)),
    );
  }

  listarFuncionarios() {
    return this.funcionarios.listarResumo();
  }

  efetuarOrcamento(id: number, valor: number) {
    return this.http.patch<SolicitacaoApi>(
      `${API_URL}/api/solicitacoes/${id}/orcar`,
      valor,
      this.auth.headers(),
    ).pipe(
      switchMap((item) => this.comHistorico(item)),
    );
  }

  efetuarManutencao(id: number, descricaoManutencao: string, orientacoesCliente: string) {
    return this.http.patch<SolicitacaoApi>(
      `${API_URL}/api/solicitacoes/${id}/manutencao`,
      { descricaoManutencao, orientacoesCliente },
      this.auth.headers(),
    ).pipe(
      switchMap((item) => this.comHistorico(item)),
    );
  }

  redirecionar(id: number, funcionarioDestinoId: number) {
    return this.http.patch<SolicitacaoApi>(
      `${API_URL}/api/solicitacoes/${id}/redirecionar`,
      { id: funcionarioDestinoId },
      this.auth.headers(),
    ).pipe(
      switchMap((item) => this.comHistorico(item)),
    );
  }

  finalizar(id: number) {
    return this.http.patch<SolicitacaoApi>(
      `${API_URL}/api/solicitacoes/${id}/finalizar`,
      {},
      this.auth.headers(),
    ).pipe(
      switchMap((item) => this.comHistorico(item)),
    );
  }

  private comHistorico(item: SolicitacaoApi): Observable<SolicitacaoFuncionario> {
    return this.http.get<HistoricoApi[]>(
      `${API_URL}/api/solicitacoes/${item.id}/historico`,
      this.auth.headers(),
    ).pipe(
      map((historico) => paraSolicitacaoFuncionario(item, historico)),
      catchError(() => of(paraSolicitacaoFuncionario(item))),
    );
  }
}
