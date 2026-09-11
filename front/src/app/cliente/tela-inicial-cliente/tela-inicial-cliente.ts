import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NovaSolicitacaoCliente } from '../../componentes/nova-solicitacao-cliente/nova-solicitacao-cliente';
import { mensagemHttpErro } from '../../core/api';
import { Auth } from '../../core/auth';
import { Logo } from '../../shared/logo/logo';
import { SolicitacaoResumo, SolicitacaoService } from '../solicitacao.service';

const ROTULOS_ESTADO: Record<string, string> = {
  ABERTA: 'Aberta',
  ORCADA: 'Orçada',
  APROVADA: 'Aprovada',
  REJEITADA: 'Rejeitada',
  REDIRECIONADA: 'Redirecionada',
  ARRUMADA: 'Arrumada',
  PAGA: 'Paga',
  FINALIZADA: 'Finalizada',
};

@Component({
  selector: 'app-tela-inicial-cliente',
  imports: [RouterLink, Logo, NovaSolicitacaoCliente],
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

  rotuloEstado(estado: string): string {
    return ROTULOS_ESTADO[estado] ?? estado;
  }

  classeEstado(estado: string): string {
    return `estado-${estado.toLowerCase()}`;
  }

  formatarDataHora(iso: string): string {
    const data = new Date(iso);
    if (Number.isNaN(data.getTime())) {
      return iso;
    }

    const dia = new Intl.DateTimeFormat('pt-BR', { day: 'numeric' }).format(data);
    const mes = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(data);
    const hora = new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(data);
    const mesCap = mes.charAt(0).toUpperCase() + mes.slice(1);

    return `${dia} de ${mesCap} ${hora.replace(':', 'h')}`;
  }

  formatarMoeda(valor: number | null): string {
    if (valor == null) {
      return '';
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  abrirModal() {
    this.modalAberto.set(true);
  }

  fecharModal() {
    this.modalAberto.set(false);
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
}
