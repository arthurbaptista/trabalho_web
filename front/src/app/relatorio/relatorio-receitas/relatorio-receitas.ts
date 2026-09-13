import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { formatarMoeda } from '../../cliente/solicitacao.util';
import { Auth } from '../../core/auth';
import { SidebarFuncionario } from '../../componentes/sidebar-funcionario/sidebar-funcionario';
import { RelatorioService, imprimirRelatorioPdf } from '../relatorio.service';

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

  nome = computed(() => this.auth.sessao()?.nome ?? '');
  primeiroNome = computed(() => this.nome().split(' ')[0] || 'Funcionário');
  iniciais = computed(() => iniciaisDe(this.nome()));

  relatorio = computed(() => this.relatorioService.porPeriodo(this.dataInicio(), this.dataFim()));
  formatarMoeda = formatarMoeda;

  gerarPdf() {
    const inicio = this.dataInicio();
    const fim = this.dataFim();
    const periodo = !inicio && !fim
      ? 'Todo o período'
      : `${inicio ? formatarFiltro(inicio) : 'início'} até ${fim ? formatarFiltro(fim) : 'hoje'}`;

    imprimirRelatorioPdf({
      titulo: 'Relatório de Receitas',
      subtitulo: `Agrupado por dia · ${periodo}`,
      colunas: ['Data', 'Quantidade', 'Receita'],
      relatorio: this.relatorio(),
    });
  }

  sair() {
    this.auth.logout();
  }
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

function formatarFiltro(isoDia: string): string {
  const [ano, mes, dia] = isoDia.split('-');
  return `${dia}/${mes}/${ano}`;
}
