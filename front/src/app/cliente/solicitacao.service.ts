import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, of, throwError, timeout } from 'rxjs';

import { API_URL } from '../core/api';
import { Auth } from '../core/auth';
import { SOLICITACOES_DEMO } from './solicitacao.mock';
import { HistoricoPasso, agoraIso, historicoPara } from './solicitacao.util';

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
  private readonly http = inject(HttpClient);
  private readonly auth = inject(Auth);
  private readonly criadas: SolicitacaoDetalhe[] = [];
  private readonly mutacoes = new Map<number, SolicitacaoDetalhe>();
  private readonly vistas = new Map<number, SolicitacaoDetalhe>();

  listarDoCliente() {
    return this.http.get<SolicitacaoResumo[]>(`${API_URL}/solicitacoes`, this.auth.headers()).pipe(
      timeout(2000),
      map((lista) => this.mesclar(lista)),
      catchError(() => of(this.mesclar(SOLICITACOES_DEMO))),
    );
  }

  detalhar(id: number) {
    return this.http.get<SolicitacaoDetalhe>(`${API_URL}/solicitacoes/${id}`, this.auth.headers()).pipe(
      timeout(2000),
      map((detalhe) => this.completar(this.mutacoes.get(id) ?? detalhe)),
      catchError(() => {
        const local = this.obterLocal(id);
        return local
          ? of(local)
          : throwError(() => ({ error: 'Solicitacao nao encontrada.' }));
      }),
    );
  }

  criar(payload: NovaSolicitacaoPayload) {
    const corpo = {
      descricaoEquipamento: payload.descricaoEquipamento,
      categoriaId: payload.categoriaId,
      descricaoDefeito: payload.descricaoDefeito,
    };

    return this.http.post<SolicitacaoResumo>(`${API_URL}/solicitacoes`, corpo, this.auth.headers()).pipe(
      timeout(2000),
      map((resumo) => {
        const detalhe = this.completar({
          ...resumo,
          descricaoDefeito: payload.descricaoDefeito,
          historico: historicoPara('ABERTA', resumo.dataHoraAbertura),
        });
        this.guardarCriada(detalhe);
        return detalhe;
      }),
      catchError(() => of(this.criarLocal(payload))),
    );
  }

  aprovar(id: number) {
    return this.postAcao(id, 'aprovar', {}, () =>
      this.aplicarEstado(id, 'APROVADA'),
    );
  }

  rejeitar(id: number, motivoRejeicao: string) {
    return this.postAcao(id, 'rejeitar', { motivoRejeicao }, () =>
      this.aplicarEstado(id, 'REJEITADA', { motivoRejeicao }),
    );
  }

  resgatar(id: number) {
    return this.postAcao(id, 'resgatar', {}, () =>
      this.aplicarEstado(id, 'APROVADA'),
    );
  }

  pagar(id: number) {
    return this.postAcao(id, 'pagar', {}, () =>
      this.aplicarEstado(id, 'PAGA'),
    );
  }

  private postAcao(
    id: number,
    caminho: string,
    corpo: object,
    local: () => SolicitacaoDetalhe,
  ) {
    return this.http
      .post<SolicitacaoDetalhe>(`${API_URL}/solicitacoes/${id}/${caminho}`, corpo, this.auth.headers())
      .pipe(
        timeout(2000),
        map((detalhe) => {
          const completo = this.completar(detalhe);
          this.guardar(completo);
          return completo;
        }),
        catchError(() => of(local())),
      );
  }

  private mesclar(lista: SolicitacaoResumo[]) {
    const enriquecidas = lista.map((item) => {
      const atual = this.mutacoes.get(item.id) ?? this.completar(item);
      this.vistas.set(item.id, atual);
      return atual;
    });
    const ids = new Set(enriquecidas.map((item) => item.id));
    return [...enriquecidas, ...this.criadas.filter((item) => !ids.has(item.id))];
  }

  private criarLocal(payload: NovaSolicitacaoPayload): SolicitacaoDetalhe {
    const iso = agoraIso();
    const nova: SolicitacaoDetalhe = {
      id: Date.now(),
      dataHoraAbertura: iso,
      descricaoEquipamento: payload.descricaoEquipamento.slice(0, 30),
      categoria: payload.categoriaNome,
      estado: 'ABERTA',
      valorOrcamento: null,
      descricaoDefeito: payload.descricaoDefeito,
      historico: historicoPara('ABERTA', iso),
    };
    this.guardarCriada(nova);
    return nova;
  }

  private aplicarEstado(
    id: number,
    estado: string,
    extra: Partial<SolicitacaoDetalhe> = {},
  ): SolicitacaoDetalhe {
    const atual = this.obterLocal(id);
    if (!atual) {
      throw new Error('Solicitacao nao encontrada.');
    }

    const atualizada: SolicitacaoDetalhe = {
      ...atual,
      ...extra,
      estado,
      historico: [
        ...atual.historico,
        { estado, dataHora: agoraIso(), autor: 'Cliente' },
      ],
    };
    this.guardar(atualizada);
    return atualizada;
  }

  private obterLocal(id: number): SolicitacaoDetalhe | null {
    const item = this.mutacoes.get(id)
      ?? this.criadas.find((criada) => criada.id === id)
      ?? this.vistas.get(id)
      ?? SOLICITACOES_DEMO.find((demo) => demo.id === id);
    return item ? this.completar(item) : null;
  }

  private completar(item: SolicitacaoResumo & Partial<SolicitacaoDetalhe>): SolicitacaoDetalhe {
    const mock = SOLICITACOES_DEMO.find((demo) => demo.id === item.id);
    return {
      id: item.id,
      dataHoraAbertura: item.dataHoraAbertura,
      descricaoEquipamento: item.descricaoEquipamento,
      categoria: item.categoria,
      estado: item.estado,
      valorOrcamento: item.valorOrcamento,
      descricaoDefeito: item.descricaoDefeito ?? mock?.descricaoDefeito ?? 'Defeito nao informado.',
      motivoRejeicao: item.motivoRejeicao ?? mock?.motivoRejeicao ?? null,
      descricaoManutencao: item.descricaoManutencao ?? mock?.descricaoManutencao ?? null,
      orientacoesCliente: item.orientacoesCliente ?? mock?.orientacoesCliente ?? null,
      historico: item.historico ?? mock?.historico ?? historicoPara(item.estado, item.dataHoraAbertura),
    };
  }

  private guardar(detalhe: SolicitacaoDetalhe) {
    this.mutacoes.set(detalhe.id, detalhe);
    this.vistas.set(detalhe.id, detalhe);
    const indice = this.criadas.findIndex((item) => item.id === detalhe.id);
    if (indice >= 0) {
      this.criadas[indice] = detalhe;
    }
  }

  private guardarCriada(detalhe: SolicitacaoDetalhe) {
    this.criadas.push(detalhe);
    this.vistas.set(detalhe.id, detalhe);
  }
}
