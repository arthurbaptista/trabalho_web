import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DetalheSolicitacaoFuncionario } from '../componentes/detalhe-solicitacao-funcionario/detalhe-solicitacao-funcionario';
import { SidebarFuncionario } from '../componentes/sidebar-funcionario/sidebar-funcionario';
import { formatarDataHora, formatarMoeda, rotuloEstado } from '../cliente/solicitacao.util';
import { mensagemHttpErro } from '../core/api';
import { Auth } from '../core/auth';
import { filtrarSolicitacoesFuncionario, hojeLocal } from './funcionario.filtro';
import type { FiltroPeriodo, ModoDetalheFuncionario, SolicitacaoFuncionario, VistaFuncionario } from './funcionario.models';
import { FuncionarioService } from './funcionario.service';

@Component({
  selector: 'app-funcionario',
  imports: [SidebarFuncionario, DetalheSolicitacaoFuncionario],
  templateUrl: './funcionario.html',
  styleUrl: './funcionario.css',
})
export class FuncionarioPage {
  private readonly funcionarioService = inject(FuncionarioService);
  readonly auth = inject(Auth);

  solicitacoes = signal<SolicitacaoFuncionario[]>([]);
  vista = signal<VistaFuncionario>('abertas');
  filtro = signal<FiltroPeriodo>('TODAS');
  dataInicio = signal('');
  dataFim = signal('');
  erro = signal('');
  carregando = signal(true);
  detalheAberto = signal(false);
  solicitacaoAtual = signal<SolicitacaoFuncionario | null>(null);
  modoDetalhe = signal<ModoDetalheFuncionario>('visualizar');

  nome = computed(() => this.auth.sessao()?.nome ?? '');
  primeiroNome = computed(() => this.nome().split(' ')[0] || 'Funcionário');
  iniciais = computed(() => {
    const partes = this.nome().trim().split(/\s+/).filter(Boolean);
    if (partes.length === 0) {
      return 'F';
    }
    if (partes.length === 1) {
      return partes[0].slice(0, 2).toUpperCase();
    }
    return (partes[0][0] + partes[1][0]).toUpperCase();
  });

  titulo = computed(() =>
    this.vista() === 'abertas' ? 'Solicitações Abertas' : 'Solicitações',
  );

  visiveis = computed(() =>
    filtrarSolicitacoesFuncionario(this.solicitacoes(), {
      vista: this.vista(),
      filtro: this.filtro(),
      dataInicio: this.dataInicio(),
      dataFim: this.dataFim(),
      nomeFuncionario: this.nome(),
      emailFuncionario: this.auth.sessao()?.email,
      hoje: hojeLocal(),
    }),
  );

  constructor() {
    if (inject(ActivatedRoute).snapshot.queryParamMap.get('vista') === 'todas') {
      this.vista.set('todas');
    }
    this.carregar();
  }

  carregar() {
    this.carregando.set(true);
    this.erro.set('');
    this.funcionarioService.listar().subscribe({
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

  private recarregarLista() {
    this.funcionarioService.listar().subscribe({
      next: (lista) => this.solicitacoes.set(lista),
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

  mostrarAbertas() {
    this.vista.set('abertas');
  }

  mostrarTodas() {
    this.vista.set('todas');
  }

  escolherFiltro(filtro: FiltroPeriodo) {
    this.filtro.set(filtro);
  }

  escolherInicio(valor: string) {
    this.filtro.set('PERIODO');
    this.dataInicio.set(valor);
  }

  escolherFim(valor: string) {
    this.filtro.set('PERIODO');
    this.dataFim.set(valor);
  }

  visualizar(solicitacao: SolicitacaoFuncionario) {
    this.abrirDetalhe(solicitacao, 'visualizar');
  }

  orcar(solicitacao: SolicitacaoFuncionario) {
    this.abrirDetalhe(solicitacao, 'orcamento');
  }

  manter(solicitacao: SolicitacaoFuncionario) {
    this.abrirDetalhe(solicitacao, 'manutencao');
  }

  redirecionar(solicitacao: SolicitacaoFuncionario) {
    this.abrirDetalhe(solicitacao, 'redirecionar');
  }

  finalizar(solicitacao: SolicitacaoFuncionario) {
    this.abrirDetalhe(solicitacao, 'finalizar');
  }

  fecharDetalhe() {
    this.detalheAberto.set(false);
    this.solicitacaoAtual.set(null);
    this.modoDetalhe.set('visualizar');
  }

  onAtualizou(atualizada: SolicitacaoFuncionario) {
    this.solicitacaoAtual.set(atualizada);
    this.recarregarLista();
  }

  sair() {
    this.auth.logout();
  }

  private abrirDetalhe(solicitacao: SolicitacaoFuncionario, modo: ModoDetalheFuncionario) {
    this.modoDetalhe.set(modo);
    this.solicitacaoAtual.set(solicitacao);
    this.detalheAberto.set(true);
  }
}
