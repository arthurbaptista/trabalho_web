import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SolicitacaoResumo } from '../../cliente/solicitacao.service';
import { formatarMoeda } from '../../cliente/solicitacao.util';

type Aba = 'DIA' | 'CATEGORIA';

interface LinhaDia {
  chave: string;
  rotulo: string;
  total: number;
  quantidade: number;
}

interface LinhaCategoria {
  categoria: string;
  total: number;
  quantidade: number;
}

const ESTADOS_PAGOS = new Set(['PAGA', 'FINALIZADA']);

@Component({
  selector: 'app-relatorio-receitas',
  imports: [FormsModule],
  templateUrl: './relatorio-receitas.html',
  styleUrl: './relatorio-receitas.css',
})
export class RelatorioReceitas {
  aberto = input(false);
  solicitacoes = input<SolicitacaoResumo[]>([]);
  fechou = output<void>();

  aba = signal<Aba>('DIA');
  dataInicio = signal('');
  dataFim = signal('');

  formatarMoeda = formatarMoeda;

  private pagas = computed(() => this.solicitacoes().filter((s) => ESTADOS_PAGOS.has(s.estado)));

  private pagasNoPeriodo = computed(() => {
    const inicio = this.dataInicio();
    const fim = this.dataFim();
    return this.pagas().filter((s) => {
      const data = new Date(s.dataHoraAbertura);
      if (inicio && data.getTime() < new Date(`${inicio}T00:00:00`).getTime()) {
        return false;
      }
      if (fim && data.getTime() > new Date(`${fim}T23:59:59`).getTime()) {
        return false;
      }
      return true;
    });
  });

  porDia = computed<LinhaDia[]>(() => {
    const grupos = new Map<string, LinhaDia>();
    for (const s of this.pagasNoPeriodo()) {
      const data = new Date(s.dataHoraAbertura);
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
      const atual = grupos.get(chave) ?? {
        chave,
        rotulo: data.toLocaleDateString('pt-BR'),
        total: 0,
        quantidade: 0,
      };
      atual.total += s.valorOrcamento ?? 0;
      atual.quantidade += 1;
      grupos.set(chave, atual);
    }
    return [...grupos.values()].sort((a, b) => a.chave.localeCompare(b.chave));
  });

  porCategoria = computed<LinhaCategoria[]>(() => {
    const grupos = new Map<string, LinhaCategoria>();
    for (const s of this.pagas()) {
      const atual = grupos.get(s.categoria) ?? { categoria: s.categoria, total: 0, quantidade: 0 };
      atual.total += s.valorOrcamento ?? 0;
      atual.quantidade += 1;
      grupos.set(s.categoria, atual);
    }
    return [...grupos.values()].sort((a, b) => a.categoria.localeCompare(b.categoria));
  });

  totalDia = computed(() => this.porDia().reduce((soma, item) => soma + item.total, 0));
  totalCategoria = computed(() => this.porCategoria().reduce((soma, item) => soma + item.total, 0));

  selecionarAba(aba: Aba) {
    this.aba.set(aba);
  }

  fechar() {
    this.fechou.emit();
  }

  imprimir() {
    window.print();
  }
}
