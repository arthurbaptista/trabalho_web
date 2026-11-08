import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { mensagemHttpErro } from '../../../core/api';
import { Auth } from '../../../core/auth';
import { formatarMoeda } from '../../../shared/solicitacao/solicitacao.util';
import { SidebarFuncionario } from '../../sidebar/sidebar-funcionario';
import { RelatorioReceita, RelatorioService, baixarArquivo } from '../relatorio.service';

@Component({
  selector: 'app-relatorio-receitas',
  imports: [FormsModule, SidebarFuncionario],
  templateUrl: './relatorio-receitas.html',
  styleUrl: '../relatorio-pagina.css',
})
export class RelatorioReceitasPage {
  private readonly relatorioService = inject(RelatorioService);

  readonly auth = inject(Auth);

  dataInicio = signal('');
  dataFim = signal('');
  relatorio = signal<RelatorioReceita>(relatorioVazio());
  carregando = signal(true);
  erro = signal('');
  erroPdf = signal('');
  baixandoPdf = signal(false);

  nome = computed(() => this.auth.sessao()?.nome ?? '');
  primeiroNome = computed(() => this.nome().split(' ')[0] || 'Funcionário');
  iniciais = computed(() => iniciaisDe(this.nome()));
  formatarMoeda = formatarMoeda;

  constructor() {
    this.carregar();
  }

  definirInicio(valor: string) {
    this.dataInicio.set(valor ?? '');
    this.carregar();
  }

  definirFim(valor: string) {
    this.dataFim.set(valor ?? '');
    this.carregar();
  }

  carregar() {
    this.carregando.set(true);
    this.erro.set('');

    this.relatorioService.porPeriodo(this.dataInicio(), this.dataFim()).subscribe({
      next: (dados) => {
        this.relatorio.set(dados);
        this.carregando.set(false);
      },
      error: (falha) => {
        this.relatorio.set(relatorioVazio());
        this.carregando.set(false);
        this.erro.set(mensagemHttpErro(falha, 'Nao foi possivel carregar o relatorio.'));
      },
    });
  }

  gerarPdf() {
    this.erroPdf.set('');
    this.baixandoPdf.set(true);
    this.relatorioService.baixarPdfPeriodo(this.dataInicio(), this.dataFim()).subscribe({
      next: (arquivo) => {
        this.baixandoPdf.set(false);
        baixarArquivo(arquivo, 'receitas.pdf');
      },
      error: (falha) => {
        this.baixandoPdf.set(false);
        this.erroPdf.set(mensagemHttpErro(falha, 'Nao foi possivel gerar o PDF.'));
      },
    });
  }

  sair() {
    this.auth.logout();
  }
}

function relatorioVazio(): RelatorioReceita {
  return { linhas: [], quantidade: 0, total: 0 };
}

function iniciaisDe(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) {
    return 'F';
  }
  if (partes.length === 1) {
    return partes[0].slice(0, 2).toUpperCase();
  }
  return (partes[0][0] + partes[1][0]).toUpperCase();
}
