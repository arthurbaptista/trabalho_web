import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { OrcamentoSolicitacaoFuncionario } from '../componentes/orcamento-solicitacao-funcionario/orcamento-solicitacao-funcionario';
import { SolicitacaoResumo, SolicitacaoService } from '../cliente/solicitacao.service';
import { mensagemHttpErro } from '../core/api';
import { Auth } from '../core/auth';
import { Logo } from '../shared/logo/logo';
import { formatarDataHora } from '../cliente/solicitacao.util';

@Component({
  selector: 'app-funcionario',
  imports: [RouterLink, Logo, OrcamentoSolicitacaoFuncionario],
  templateUrl: './funcionario.html',
  styleUrl: './funcionario.css',
})
export class FuncionarioPage {
  private readonly solicitacaoService = inject(SolicitacaoService);
  readonly auth = inject(Auth);

  solicitacoes = signal<SolicitacaoResumo[]>([]);
  erro = signal('');
  carregando = signal(true);
  orcamentoAberto = signal(false);
  solicitacaoAtual = signal<SolicitacaoResumo | null>(null);

  nome = computed(() => this.auth.sessao()?.nome ?? '');
  primeiroNome = computed(() => this.nome().split(' ')[0] || 'Funcionario');

  abertas = computed(() =>
    [...this.solicitacoes()]
      .filter((s) => s.estado === 'ABERTA')
      .sort((a, b) => new Date(a.dataHoraAbertura).getTime() - new Date(b.dataHoraAbertura).getTime()),
  );

  formatarDataHora = formatarDataHora;

  constructor() {
    this.carregar();
  }

  carregar() {
    this.carregando.set(true);
    this.erro.set('');
    this.solicitacaoService.listarTodas().subscribe({
      next: (lista) => {
        this.solicitacoes.set(lista);
        this.carregando.set(false);
      },
      error: (erro) => {
        this.carregando.set(false);
        this.erro.set(mensagemHttpErro(erro, 'Nao foi possivel listar as solicitacoes.'));
      },
    });
  }

  descricao(texto: string): string {
    return texto.length <= 30 ? texto : texto.slice(0, 30);
  }

  abrirOrcamento(solicitacao: SolicitacaoResumo) {
    this.solicitacaoAtual.set(solicitacao);
    this.orcamentoAberto.set(true);
  }

  fecharOrcamento() {
    this.orcamentoAberto.set(false);
    this.solicitacaoAtual.set(null);
  }

  onOrcamentoFeito(atualizada: SolicitacaoResumo) {
    this.solicitacoes.update((lista) =>
      lista.map((item) => (item.id === atualizada.id ? { ...item, ...atualizada } : item)),
    );
  }

  sair() {
    this.auth.logout();
  }
}
