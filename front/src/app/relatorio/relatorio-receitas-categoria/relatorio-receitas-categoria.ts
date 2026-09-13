import { Component, computed, inject } from '@angular/core';

import { formatarMoeda } from '../../cliente/solicitacao.util';
import { Auth } from '../../core/auth';
import { SidebarFuncionario } from '../../componentes/sidebar-funcionario/sidebar-funcionario';
import { RelatorioService, imprimirRelatorioPdf } from '../relatorio.service';

@Component({
  selector: 'app-relatorio-receitas-categoria',
  imports: [SidebarFuncionario],
  templateUrl: './relatorio-receitas-categoria.html',
  styleUrl: '../relatorio-pagina.css',
})
export class RelatorioReceitasCategoriaPage {
  private readonly relatorioService = inject(RelatorioService);
  readonly auth = inject(Auth);

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

  relatorio = computed(() => this.relatorioService.porCategoria());
  formatarMoeda = formatarMoeda;

  gerarPdf() {
    imprimirRelatorioPdf({
      titulo: 'Relatório de Receitas por Categoria',
      subtitulo: 'Receita desde sempre, agrupada por categoria de equipamento',
      colunas: ['Categoria', 'Quantidade', 'Receita'],
      relatorio: this.relatorio(),
    });
  }

  sair() {
    this.auth.logout();
  }
}
