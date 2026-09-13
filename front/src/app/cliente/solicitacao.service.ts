import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

import { Auth } from '../core/auth';
import { SolicitacaoStore } from '../core/solicitacao.store';
import { agoraIso, HistoricoPasso, historicoPara, rotuloAutor } from './solicitacao.util';
import type { SolicitacaoFuncionario } from '../funcionario/funcionario.models';

export interface SolicitacaoResumo {
  id: number;
  dataHoraAbertura: string;
  descricaoEquipamento: string;
  categoria: string;
  estado: string;
  valorOrcamento: number | null;
}

export interface SolicitacaoDetalhe extends SolicitacaoResumo {
  descricaoDefeito: string;
  motivoRejeicao?: string | null;
  descricaoManutencao?: string | null;
  orientacoesCliente?: string | null;
  nomeCliente?: string;
  historico: HistoricoPasso[];
}

export interface NovaSolicitacaoPayload {
  descricaoEquipamento: string;
  categoriaId: number;
  descricaoDefeito: string;
  categoriaNome: string;
}

@Injectable({ providedIn: 'root' })
export class SolicitacaoService {
  private readonly auth = inject(Auth);
  private readonly store = inject(SolicitacaoStore);

  listarDoCliente() {
    return of(this.store.listarDoCliente(this.nomeCliente(), this.emailCliente()).map((item) => this.paraCliente(item)));
  }

  detalhar(id: number) {
    const local = this.store.obter(id);
    return local
      ? of(this.paraCliente(local))
      : throwError(() => ({ error: 'Solicitacao nao encontrada.' }));
  }

  criar(payload: NovaSolicitacaoPayload) {
    const dataHoraAbertura = agoraIso();
    const criada = this.store.guardar({
      id: Date.now(),
      dataHoraAbertura,
      descricaoEquipamento: payload.descricaoEquipamento.slice(0, 30),
      descricaoDefeito: payload.descricaoDefeito,
      categoria: payload.categoriaNome,
      estado: 'ABERTA',
      valorOrcamento: null,
      cliente: this.store.clienteDaSessao(this.nomeCliente(), this.emailCliente()),
      funcionarioDestino: null,
      historico: historicoPara('ABERTA', dataHoraAbertura, this.nomeCliente()),
    });
    return of(this.paraCliente(criada));
  }

  aprovar(id: number) {
    return this.aplicarEstado(id, 'APROVADA');
  }

  rejeitar(id: number, motivoRejeicao: string) {
    return this.aplicarEstado(id, 'REJEITADA', { motivoRejeicao });
  }

  resgatar(id: number) {
    return this.aplicarEstado(id, 'APROVADA');
  }

  pagar(id: number) {
    return this.aplicarEstado(id, 'PAGA');
  }

  private aplicarEstado(
    id: number,
    estado: string,
    extra: Partial<SolicitacaoFuncionario> = {},
  ): Observable<SolicitacaoDetalhe> {
    const atual = this.store.obter(id);
    if (!atual) {
      return throwError(() => ({ error: 'Solicitacao nao encontrada.' }));
    }

    return of(this.paraCliente(this.store.guardar({
      ...atual,
      ...extra,
      estado,
      historico: [
        ...atual.historico,
        { estado, dataHora: agoraIso(), autor: rotuloAutor('Cliente', this.nomeCliente()) },
      ],
    })));
  }

  private paraCliente(item: SolicitacaoFuncionario): SolicitacaoDetalhe {
    return {
      id: item.id,
      dataHoraAbertura: item.dataHoraAbertura,
      descricaoEquipamento: item.descricaoEquipamento,
      categoria: item.categoria,
      estado: item.estado,
      valorOrcamento: item.valorOrcamento,
      descricaoDefeito: item.descricaoDefeito,
      motivoRejeicao: item.motivoRejeicao ?? null,
      descricaoManutencao: item.descricaoManutencao ?? null,
      orientacoesCliente: item.orientacoesCliente ?? null,
      nomeCliente: item.cliente.nome,
      historico: item.historico,
    };
  }

  private nomeCliente() {
    return this.auth.sessao()?.nome ?? '';
  }

  private emailCliente() {
    return this.auth.sessao()?.email ?? '';
  }
}
