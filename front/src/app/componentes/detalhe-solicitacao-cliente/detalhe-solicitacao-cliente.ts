import { Component, HostListener, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SolicitacaoDetalhe, SolicitacaoResumo, SolicitacaoService } from '../../cliente/solicitacao.service';
import {
  formatarDataHora,
  formatarMoeda,
  rotuloAutor,
  rotuloEstado,
  temaEstado,
} from '../../cliente/solicitacao.util';

type MensagemAcao = 'aprovado' | 'rejeitado' | 'resgatado' | 'pago';

@Component({
  selector: 'app-detalhe-solicitacao-cliente',
  imports: [FormsModule],
  templateUrl: './detalhe-solicitacao-cliente.html',
  styleUrl: './detalhe-solicitacao-cliente.css',
})
export class DetalheSolicitacaoCliente {
  private readonly solicitacaoService = inject(SolicitacaoService);

  aberto = input(false);
  solicitacao = input<SolicitacaoResumo | null>(null);
  iniciarRejeicao = input(false);
  fechou = output<void>();
  atualizou = output<SolicitacaoDetalhe>();

  detalhe = signal<SolicitacaoDetalhe | null>(null);
  escrevendoRejeicao = signal(false);
  confirmandoResgate = signal(false);
  mensagem = signal<MensagemAcao | null>(null);
  motivoRejeicao = '';
  tentativaRejeicao = false;
  salvando = false;
  erro = signal('');

  historico = computed(() => this.detalhe()?.historico ?? []);
  estado = computed(() => this.detalhe()?.estado ?? this.solicitacao()?.estado ?? '');
  preco = computed(() => formatarMoeda(this.detalhe()?.valorOrcamento ?? this.solicitacao()?.valorOrcamento));

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
        this.resetarUi(resumo);
        this.carregar(resumo);
      });
    });
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (!this.aberto() || this.salvando) {
      return;
    }
    if (this.escrevendoRejeicao()) {
      this.cancelarRejeicao();
      return;
    }
    if (this.confirmandoResgate()) {
      this.confirmandoResgate.set(false);
      return;
    }
    this.fechar();
  }

  fechar() {
    if (this.salvando) {
      return;
    }
    this.fechou.emit();
  }

  confirmarMensagem() {
    const atual = this.detalhe();
    if (atual) {
      this.atualizou.emit(atual);
    }
    this.fechar();
  }

  comecarRejeicao() {
    this.escrevendoRejeicao.set(true);
    this.confirmandoResgate.set(false);
    this.tentativaRejeicao = false;
    this.erro.set('');
  }

  cancelarRejeicao() {
    this.escrevendoRejeicao.set(false);
    this.tentativaRejeicao = false;
    this.motivoRejeicao = this.detalhe()?.motivoRejeicao ?? '';
  }

  aprovar() {
    const atual = this.detalhe();
    if (!atual || this.salvando) {
      return;
    }
    this.executar(() => this.solicitacaoService.aprovar(atual.id), 'aprovado');
  }

  confirmarRejeicao() {
    this.tentativaRejeicao = true;
    const motivo = this.motivoRejeicao.trim();
    const atual = this.detalhe();
    if (!motivo || !atual || this.salvando) {
      return;
    }
    this.executar(() => this.solicitacaoService.rejeitar(atual.id, motivo), 'rejeitado');
  }

  pedirResgate() {
    this.confirmandoResgate.set(true);
    this.erro.set('');
  }

  cancelarResgate() {
    this.confirmandoResgate.set(false);
  }

  confirmarResgate() {
    const atual = this.detalhe();
    if (!atual || this.salvando) {
      return;
    }
    this.executar(() => this.solicitacaoService.resgatar(atual.id), 'resgatado');
  }

  pagar() {
    const atual = this.detalhe();
    if (!atual || this.salvando) {
      return;
    }
    this.executar(() => this.solicitacaoService.pagar(atual.id), 'pago');
  }

  formatarDataHora = formatarDataHora;
  formatarMoeda = formatarMoeda;
  rotuloEstado = rotuloEstado;
  temaEstado = temaEstado;

  autorDoPasso(autor: string): string {
    return rotuloAutor(autor, this.detalhe()?.nomeCliente);
  }

  private carregar(resumo: SolicitacaoResumo) {
    this.detalhe.set(null);
    this.solicitacaoService.detalhar(resumo.id).subscribe({
      next: (detalhe) => {
        this.detalhe.set(detalhe);
        if (!this.motivoRejeicao) {
          this.motivoRejeicao = detalhe.motivoRejeicao ?? '';
        }
      },
      error: () => {
        this.erro.set('Nao foi possivel carregar os detalhes da solicitacao.');
      },
    });
  }

  private executar(
    acao: () => ReturnType<SolicitacaoService['aprovar']>,
    mensagem: MensagemAcao,
  ) {
    this.salvando = true;
    this.erro.set('');
    acao().subscribe({
      next: (detalhe) => {
        this.salvando = false;
        this.detalhe.set(detalhe);
        this.escrevendoRejeicao.set(false);
        this.confirmandoResgate.set(false);
        this.mensagem.set(mensagem);
        this.atualizou.emit(detalhe);
      },
      error: () => {
        this.salvando = false;
        this.erro.set('Nao foi possivel concluir a acao.');
      },
    });
  }

  private resetarUi(resumo: SolicitacaoResumo) {
    this.detalhe.set(null);
    this.escrevendoRejeicao.set(this.iniciarRejeicao() && resumo.estado === 'ORCADA');
    this.confirmandoResgate.set(false);
    this.mensagem.set(null);
    this.motivoRejeicao = '';
    this.tentativaRejeicao = false;
    this.salvando = false;
    this.erro.set('');
  }
}
