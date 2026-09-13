import { Component, HostListener, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  formatarDataHora,
  formatarMoeda,
  nomesIguais,
  rotuloAutor,
  rotuloEstado,
  temaEstado,
} from '../../cliente/solicitacao.util';
import { Auth } from '../../core/auth';
import type { FuncionarioResumo, ModoDetalheFuncionario, SolicitacaoFuncionario } from '../../funcionario/funcionario.models';
import { FuncionarioService } from '../../funcionario/funcionario.service';

type MensagemAcao = 'orcada' | 'arrumada' | 'redirecionada' | 'finalizada';
type EtapaManutencao = 'escolha' | 'efetuar' | 'redirecionar';

@Component({
  selector: 'app-detalhe-solicitacao-funcionario',
  imports: [FormsModule],
  templateUrl: './detalhe-solicitacao-funcionario.html',
  styleUrl: './detalhe-solicitacao-funcionario.css',
})
export class DetalheSolicitacaoFuncionario {
  private readonly funcionarioService = inject(FuncionarioService);
  private readonly auth = inject(Auth);

  aberto = input(false);
  solicitacao = input<SolicitacaoFuncionario | null>(null);
  modo = input<ModoDetalheFuncionario>('visualizar');
  fechou = output<void>();
  atualizou = output<SolicitacaoFuncionario>();

  detalhe = signal<SolicitacaoFuncionario | null>(null);
  funcionarios = signal<FuncionarioResumo[]>([]);
  mensagem = signal<MensagemAcao | null>(null);
  etapaManutencao = signal<EtapaManutencao>('escolha');
  valorTexto = '';
  descricaoManutencao = '';
  orientacoesCliente = '';
  funcionarioDestinoId: number | null = null;
  tentativa = false;
  salvando = false;
  erro = signal('');

  private chaveCarregada: string | null = null;

  historico = computed(() => this.detalhe()?.historico ?? []);
  estado = computed(() => this.detalhe()?.estado ?? this.solicitacao()?.estado ?? '');
  preco = computed(() => formatarMoeda(this.detalhe()?.valorOrcamento ?? this.solicitacao()?.valorOrcamento));
  funcionariosDestino = computed(() => {
    const sessao = this.auth.sessao();
    const nome = sessao?.nome ?? '';
    const email = sessao?.email?.trim().toLowerCase() ?? '';
    return this.funcionarios().filter((item) => {
      const mesmoEmail = Boolean(email && item.email.trim().toLowerCase() === email);
      return !mesmoEmail && !nomesIguais(item.nome, nome);
    });
  });

  constructor() {
    effect(() => {
      const aberta = this.aberto();
      const resumo = this.solicitacao();
      const modo = this.modo();
      if (!aberta || !resumo) {
        this.chaveCarregada = null;
        return;
      }
      const chave = `${resumo.id}-${modo}`;
      if (this.chaveCarregada === chave) {
        return;
      }

      untracked(() => {
        this.chaveCarregada = chave;
        this.resetarUi(resumo, modo);
        this.carregar(resumo);
      });
    });
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (!this.aberto() || this.salvando) {
      return;
    }
    if (this.etapaManutencao() !== 'escolha') {
      this.etapaManutencao.set('escolha');
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

  confirmarOrcamento() {
    this.tentativa = true;
    const atual = this.detalhe();
    const valor = this.valorNumerico();
    if (!atual || valor == null || this.salvando) {
      return;
    }
    this.executar(() => this.funcionarioService.efetuarOrcamento(atual.id, valor), 'orcada');
  }

  escolherEfetuar() {
    this.etapaManutencao.set('efetuar');
    this.tentativa = false;
    this.erro.set('');
  }

  escolherRedirecionar() {
    this.etapaManutencao.set('redirecionar');
    this.tentativa = false;
    this.erro.set('');
  }

  voltarEscolha() {
    this.etapaManutencao.set('escolha');
    this.tentativa = false;
  }

  confirmarManutencao() {
    this.tentativa = true;
    const atual = this.detalhe();
    if (!atual || this.salvando || !this.descricaoManutencao.trim() || !this.orientacoesCliente.trim()) {
      return;
    }
    this.executar(
      () => this.funcionarioService.efetuarManutencao(
        atual.id,
        this.descricaoManutencao.trim(),
        this.orientacoesCliente.trim(),
      ),
      'arrumada',
    );
  }

  confirmarRedirecionamento() {
    this.tentativa = true;
    const atual = this.detalhe();
    const destino = this.funcionariosDestino().find((item) => item.id === this.funcionarioDestinoId);
    if (!atual || !destino || this.salvando) {
      return;
    }
    this.executar(
      () => this.funcionarioService.redirecionar(atual.id, destino.nome),
      'redirecionada',
    );
  }

  confirmarFinalizacao() {
    const atual = this.detalhe();
    if (!atual || this.salvando) {
      return;
    }
    this.executar(() => this.funcionarioService.finalizar(atual.id), 'finalizada');
  }

  formatarDataHora = formatarDataHora;
  formatarMoeda = formatarMoeda;
  rotuloEstado = rotuloEstado;
  temaEstado = temaEstado;

  autorDoPasso(autor: string): string {
    const nome = this.detalhe()?.cliente?.nome || this.solicitacao()?.cliente.nome;
    return rotuloAutor(autor, nome);
  }

  valorInvalido() {
    return this.tentativa && this.valorNumerico() == null;
  }

  private valorNumerico(): number | null {
    const texto = this.valorTexto.trim().replace(/[^\d,.-]/g, '');
    if (!texto) {
      return null;
    }
    const normalizado = texto.includes(',')
      ? texto.replace(/\./g, '').replace(',', '.')
      : texto;
    const valor = Number(normalizado);
    return Number.isFinite(valor) && valor > 0 ? valor : null;
  }

  private carregar(resumo: SolicitacaoFuncionario) {
    this.detalhe.set(resumo);
    this.funcionarioService.listarFuncionarios().subscribe((lista) => this.funcionarios.set(lista));
    this.funcionarioService.detalhar(resumo.id).subscribe({
      next: (detalhe) => this.detalhe.set(detalhe),
      error: () => this.erro.set('Nao foi possivel carregar os detalhes da solicitacao.'),
    });
  }

  private executar(
    acao: () => ReturnType<FuncionarioService['efetuarOrcamento']>,
    mensagem: MensagemAcao,
  ) {
    this.salvando = true;
    this.erro.set('');
    acao().subscribe({
      next: (detalhe) => {
        this.salvando = false;
        this.detalhe.set(detalhe);
        this.mensagem.set(mensagem);
        this.atualizou.emit(detalhe);
      },
      error: () => {
        this.salvando = false;
        this.erro.set('Nao foi possivel concluir a acao.');
      },
    });
  }

  private resetarUi(resumo: SolicitacaoFuncionario, modo: ModoDetalheFuncionario = 'visualizar') {
    this.detalhe.set(resumo);
    this.mensagem.set(null);
    this.etapaManutencao.set(modo === 'redirecionar' ? 'redirecionar' : 'escolha');
    this.valorTexto = '';
    this.descricaoManutencao = resumo.descricaoManutencao ?? '';
    this.orientacoesCliente = resumo.orientacoesCliente ?? '';
    this.funcionarioDestinoId = null;
    this.tentativa = false;
    this.salvando = false;
    this.erro.set('');
  }
}
