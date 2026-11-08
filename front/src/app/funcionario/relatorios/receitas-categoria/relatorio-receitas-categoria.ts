import { Component, computed, inject, signal } from '@angular/core';

import { formatarMoeda } from '../../../shared/solicitacao/solicitacao.util';
import { Auth } from '../../../core/auth';
import { SidebarFuncionario } from '../../sidebar/sidebar-funcionario';
import {
  RelatorioReceita,
  RelatorioService,
  baixarArquivo,
  mensagemRelatorio,
} from '../relatorio.service';

@Component({
  selector: 'app-relatorio-receitas-categoria',
  imports: [SidebarFuncionario],
  templateUrl: './relatorio-receitas-categoria.html',
  styleUrl: '../relatorio-pagina.css',
})
export class RelatorioReceitasCategoriaPage {
  private readonly relatorioService = inject(RelatorioService);

  readonly auth = inject(Auth);

  relatorio = signal<RelatorioReceita>({ linhas: [], quantidade: 0, total: 0 });
  carregando = signal(true);
  erro = signal('');
  erroPdf = signal('');
  baixandoPdf = signal(false);

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
  formatarMoeda = formatarMoeda;

  constructor() {
    this.carregar();
  }

  carregar() {
    this.carregando.set(true);
    this.erro.set('');

    this.relatorioService.porCategoria().subscribe({
      next: (dados) => {
        this.relatorio.set(dados);
        this.carregando.set(false);
      },
      error: (falha) => {
        this.relatorio.set({ linhas: [], quantidade: 0, total: 0 });
        this.carregando.set(false);
        this.erro.set(mensagemRelatorio(falha, 'carregar o relatorio'));
      },
    });
  }

  gerarPdf() {
    this.erroPdf.set('');
    this.baixandoPdf.set(true);
    this.relatorioService.baixarPdfCategoria().subscribe({
      next: (arquivo) => {
        this.baixandoPdf.set(false);
        baixarArquivo(arquivo, 'receitas-categoria.pdf');
      },
      error: (falha) => {
        this.baixandoPdf.set(false);
        this.erroPdf.set(mensagemRelatorio(falha, 'gerar o PDF'));
      },
    });
  }

  sair() {
    this.auth.logout();
  }
}
