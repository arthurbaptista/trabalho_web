import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DetalheSolicitacaoCliente } from '../../componentes/detalhe-solicitacao-cliente/detalhe-solicitacao-cliente';
import { NovaSolicitacaoCliente } from '../../componentes/nova-solicitacao-cliente/nova-solicitacao-cliente';
import { mensagemHttpErro } from '../../core/api';
import { Auth } from '../../core/auth';
import { Logo } from '../../shared/logo/logo';
import { SolicitacaoResumo, SolicitacaoService } from '../solicitacao.service';
import { formatarDataHora, formatarMoeda, rotuloEstado } from '../solicitacao.util';

@Component({
  selector: 'app-tela-inicial-cliente',
  imports: [RouterLink, Logo, NovaSolicitacaoCliente, DetalheSolicitacaoCliente],
  templateUrl: './tela-inicial-cliente.html',
  styleUrl: './tela-inicial-cliente.css',
})
export class TelaInicialCliente {
  private readonly solicitacaoService = inject(SolicitacaoService);
  readonly auth = inject(Auth);

  solicitacoes = signal<SolicitacaoResumo[]>([]);
  erro = signal('');
  carregando = signal(true);
  modalAberto = signal(false);
  detalheAberto = signal(false);
  solicitacaoAtual = signal<SolicitacaoResumo | null>(null);
  iniciarRejeicao = signal(false);

  nome = computed(() => this.auth.sessao()?.nome ?? '');
  primeiroNome = computed(() => this.nome().split(' ')[0] || 'Cliente');
  iniciais = computed(() => {
    const partes = this.nome().trim().split(/\s+/).filter(Boolean);
    if (partes.length === 0) {
      return 'C';
    }
    if (partes.length === 1) {
      return partes[0].slice(0, 2).toUpperCase();
    }
    return (partes[0][0] + partes[1][0]).toUpperCase();
  });

  constructor() {
    this.carregar();
  }

  carregar() {
    this.carregando.set(true);
    this.erro.set('');
    this.solicitacaoService.listarDoCliente().subscribe({
      next: (lista) => {
        const ordenada = [...lista].sort(
          (a, b) => new Date(a.dataHoraAbertura).getTime() - new Date(b.dataHoraAbertura).getTime(),
        );
        this.solicitacoes.set(ordenada);
        this.carregando.set(false);
      },
      error: (erro) => {
        this.carregando.set(false);
        this.erro.set(mensagemHttpErro(erro, 'Nao foi possivel carregar as solicitacoes.'));
      },
    });
  }

  descricao(texto: string): string {
    return texto.length <= 30 ? texto : texto.slice(0, 30);
  }

  rotuloEstado = rotuloEstado;
  formatarDataHora = formatarDataHora;
  formatarMoeda = formatarMoeda;

  classeEstado(estado: string): string {
    return `estado-${estado.toLowerCase()}`;
  }

  abrirModal() {
    this.modalAberto.set(true);
  }

  fecharModal() {
    this.modalAberto.set(false);
  }

  visualizar(solicitacao: SolicitacaoResumo) {
    this.abrirDetalhe(solicitacao, false);
  }

  abrirOrcamento(solicitacao: SolicitacaoResumo, rejeitar = false) {
    this.abrirDetalhe(solicitacao, rejeitar);
  }

  resgatar(solicitacao: SolicitacaoResumo) {
    this.abrirDetalhe(solicitacao, false);
  }

  pagar(solicitacao: SolicitacaoResumo) {
    this.abrirDetalhe(solicitacao, false);
  }

  fecharDetalhe() {
    this.detalheAberto.set(false);
    this.solicitacaoAtual.set(null);
    this.iniciarRejeicao.set(false);
  }

  onAtualizou(atualizada: SolicitacaoResumo) {
    this.solicitacoes.update((lista) =>
      lista.map((item) => (item.id === atualizada.id ? { ...item, ...atualizada } : item)),
    );
    this.solicitacaoAtual.set(atualizada);
  }

  onCriou(nova: SolicitacaoResumo) {
    this.solicitacoes.update((lista) =>
      [...lista, nova].sort(
        (a, b) => new Date(a.dataHoraAbertura).getTime() - new Date(b.dataHoraAbertura).getTime(),
      ),
    );
    this.modalAberto.set(false);
  }

  sair() {
    this.auth.logout();
  }

  private abrirDetalhe(solicitacao: SolicitacaoResumo, rejeitar: boolean) {
    this.iniciarRejeicao.set(rejeitar);
    this.solicitacaoAtual.set(solicitacao);
    this.detalheAberto.set(true);
  }
}
