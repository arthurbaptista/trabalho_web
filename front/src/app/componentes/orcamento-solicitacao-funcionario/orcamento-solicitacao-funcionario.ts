import { Component, HostListener, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SolicitacaoDetalhe, SolicitacaoResumo, SolicitacaoService } from '../../cliente/solicitacao.service';
import { formatarDataHora, formatarMoeda } from '../../cliente/solicitacao.util';
import { Auth } from '../../core/auth';

@Component({
  selector: 'app-orcamento-solicitacao-funcionario',
  imports: [FormsModule],
  templateUrl: './orcamento-solicitacao-funcionario.html',
  styleUrl: './orcamento-solicitacao-funcionario.css',
})
export class OrcamentoSolicitacaoFuncionario {
  private readonly solicitacaoService = inject(SolicitacaoService);
  private readonly auth = inject(Auth);

  aberto = input(false);
  solicitacao = input<SolicitacaoResumo | null>(null);
  fechou = output<void>();
  registrou = output<SolicitacaoDetalhe>();

  detalhe = signal<SolicitacaoDetalhe | null>(null);
  valor: number | null = null;
  tentouSalvar = false;
  salvando = signal(false);
  registrado = signal(false);
  erro = signal('');

  preco = computed(() => formatarMoeda(this.valor));
  formatarDataHora = formatarDataHora;
  formatarMoeda = formatarMoeda;

  private idCarregado: number | null = null;

  constructor() {
    effect(() => {
      const aberta = this.aberto();
      const resumo = this.solicitacao();
      if (!aberta || !resumo) {
        this.idCarregado = null;
        return;
      }
      if (this.idCarregado === resumo.id) {
        return;
      }

      untracked(() => {
        this.idCarregado = resumo.id;
        this.resetarUi();
        this.carregar(resumo.id);
      });
    });
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.aberto() && !this.salvando()) {
      this.fechar();
    }
  }

  fechar() {
    if (this.salvando()) {
      return;
    }
    this.fechou.emit();
  }

  confirmar() {
    this.tentouSalvar = true;
    const atual = this.detalhe();
    if (!atual || !this.valor || this.valor <= 0 || this.salvando()) {
      return;
    }

    this.salvando.set(true);
    this.erro.set('');
    const funcionarioNome = this.auth.sessao()?.nome ?? 'Funcionario';

    this.solicitacaoService.efetuarOrcamento(atual.id, this.valor, funcionarioNome).subscribe({
      next: (atualizado) => {
        this.salvando.set(false);
        this.detalhe.set(atualizado);
        this.registrado.set(true);
        this.registrou.emit(atualizado);
      },
      error: () => {
        this.salvando.set(false);
        this.erro.set('Nao foi possivel registrar o orcamento.');
      },
    });
  }

  private carregar(id: number) {
    this.detalhe.set(null);
    this.solicitacaoService.detalhar(id).subscribe({
      next: (detalhe) => this.detalhe.set(detalhe),
      error: () => this.erro.set('Nao foi possivel carregar os dados da solicitacao.'),
    });
  }

  private resetarUi() {
    this.detalhe.set(null);
    this.valor = null;
    this.tentouSalvar = false;
    this.salvando.set(false);
    this.registrado.set(false);
    this.erro.set('');
  }
}
