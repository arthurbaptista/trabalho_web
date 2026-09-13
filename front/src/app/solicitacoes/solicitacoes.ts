import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { OrcamentoSolicitacaoFuncionario } from '../componentes/orcamento-solicitacao-funcionario/orcamento-solicitacao-funcionario';
import { ManutencaoSolicitacaoFuncionario } from '../componentes/manutencao-solicitacao-funcionario/manutencao-solicitacao-funcionario';
import { RelatorioReceitas } from '../componentes/relatorio-receitas/relatorio-receitas';
import { SolicitacaoResumo, SolicitacaoService } from '../cliente/solicitacao.service';
import { formatarDataHora, formatarMoeda, rotuloEstado, temaEstado } from '../cliente/solicitacao.util';
import { mensagemHttpErro } from '../core/api';
import { Auth } from '../core/auth';
import { Logo } from '../shared/logo/logo';

type Filtro = 'HOJE' | 'PERIODO' | 'TODAS';

@Component({
  selector: 'app-solicitacoes',
  imports: [
    FormsModule,
    RouterLink,
    Logo,
    OrcamentoSolicitacaoFuncionario,
    ManutencaoSolicitacaoFuncionario,
    RelatorioReceitas,
  ],
  templateUrl: './solicitacoes.html',
  styleUrl: './solicitacoes.css',
})
export class SolicitacoesPage {
  private readonly solicitacaoService = inject(SolicitacaoService);
  readonly auth = inject(Auth);

  solicitacoes = signal<SolicitacaoResumo[]>([]);
  erro = signal('');
  sucesso = signal('');
  carregando = signal(true);
  finalizandoId = signal<number | null>(null);

  filtro = signal<Filtro>('TODAS');
  dataInicio = signal('');
  dataFim = signal('');

  orcamentoAberto = signal(false);
  manutencaoAberta = signal(false);
  relatorioAberto = signal(false);
  solicitacaoAtual = signal<SolicitacaoResumo | null>(null);

  nomeLogado = computed(() => this.auth.sessao()?.nome ?? '');

  rotuloEstado = rotuloEstado;
  formatarDataHora = formatarDataHora;
  formatarMoeda = formatarMoeda;
  temaEstado = temaEstado;

  visiveis = computed(() => {
    const nome = this.nomeLogado().trim().toLowerCase();
    return this.solicitacoes().filter((s) => {
      if (s.estado === 'REDIRECIONADA') {
        return (s.funcionarioDestino ?? '').trim().toLowerCase() === nome;
      }
      return true;
    });
  });

  filtradas = computed(() => {
    const filtro = this.filtro();
    const lista = this.visiveis().filter((s) => this.passaNoFiltro(s, filtro));
    return [...lista].sort(
      (a, b) => new Date(a.dataHoraAbertura).getTime() - new Date(b.dataHoraAbertura).getTime(),
    );
  });

  periodoIncompleto = computed(() => this.filtro() === 'PERIODO' && (!this.dataInicio() || !this.dataFim()));

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

  selecionarFiltro(filtro: Filtro) {
    this.filtro.set(filtro);
  }

  abrirOrcamento(s: SolicitacaoResumo) {
    this.solicitacaoAtual.set(s);
    this.orcamentoAberto.set(true);
  }

  abrirManutencao(s: SolicitacaoResumo) {
    this.solicitacaoAtual.set(s);
    this.manutencaoAberta.set(true);
  }

  fecharOrcamento() {
    this.orcamentoAberto.set(false);
    this.solicitacaoAtual.set(null);
  }

  fecharManutencao() {
    this.manutencaoAberta.set(false);
    this.solicitacaoAtual.set(null);
  }

  onAtualizou(atualizada: SolicitacaoResumo) {
    this.solicitacoes.update((lista) =>
      lista.map((item) => (item.id === atualizada.id ? { ...item, ...atualizada } : item)),
    );
  }

  finalizar(s: SolicitacaoResumo) {
    if (!confirm(`Finalizar a solicitação "${s.descricaoEquipamento}"?`)) {
      return;
    }

    this.erro.set('');
    this.sucesso.set('');
    this.finalizandoId.set(s.id);
    const funcionarioNome = this.nomeLogado() || 'Funcionario';

    this.solicitacaoService.finalizar(s.id, funcionarioNome).subscribe({
      next: (atualizada) => {
        this.finalizandoId.set(null);
        this.sucesso.set(`Solicitação "${s.descricaoEquipamento}" finalizada.`);
        this.onAtualizou(atualizada);
      },
      error: (erro) => {
        this.finalizandoId.set(null);
        this.erro.set(mensagemHttpErro(erro, 'Nao foi possivel finalizar a solicitacao.'));
      },
    });
  }

  sair() {
    this.auth.logout();
  }

  private passaNoFiltro(s: SolicitacaoResumo, filtro: Filtro): boolean {
    if (filtro === 'TODAS') {
      return true;
    }

    const data = new Date(s.dataHoraAbertura);
    if (filtro === 'HOJE') {
      const hoje = new Date();
      return (
        data.getFullYear() === hoje.getFullYear() &&
        data.getMonth() === hoje.getMonth() &&
        data.getDate() === hoje.getDate()
      );
    }

    if (!this.dataInicio() || !this.dataFim()) {
      return false;
    }
    const inicio = new Date(`${this.dataInicio()}T00:00:00`);
    const fim = new Date(`${this.dataFim()}T23:59:59`);
    return data.getTime() >= inicio.getTime() && data.getTime() <= fim.getTime();
  }
}
