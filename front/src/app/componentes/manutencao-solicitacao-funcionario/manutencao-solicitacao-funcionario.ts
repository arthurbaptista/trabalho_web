import { Component, HostListener, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SolicitacaoDetalhe, SolicitacaoResumo, SolicitacaoService } from '../../cliente/solicitacao.service';
import { formatarDataHora } from '../../cliente/solicitacao.util';
import { Auth } from '../../core/auth';
import { FuncionarioRegistro } from '../../core/funcionarios.mock';
import { FuncionariosService } from '../../funcionarios/funcionarios.service';

type Modo = 'escolha' | 'manutencao' | 'redirecionar';

@Component({
  selector: 'app-manutencao-solicitacao-funcionario',
  imports: [FormsModule],
  templateUrl: './manutencao-solicitacao-funcionario.html',
  styleUrl: './manutencao-solicitacao-funcionario.css',
})
export class ManutencaoSolicitacaoFuncionario {
  private readonly solicitacaoService = inject(SolicitacaoService);
  private readonly funcionariosService = inject(FuncionariosService);
  private readonly auth = inject(Auth);

  aberto = input(false);
  solicitacao = input<SolicitacaoResumo | null>(null);
  fechou = output<void>();
  registrou = output<SolicitacaoDetalhe>();

  detalhe = signal<SolicitacaoDetalhe | null>(null);
  outrosFuncionarios = signal<FuncionarioRegistro[]>([]);
  modo = signal<Modo>('escolha');
  registrado = signal<'manutencao' | 'redirecionado' | null>(null);

  descricaoManutencao = '';
  orientacoesCliente = '';
  funcionarioDestino: string | null = null;

  tentouSalvar = false;
  salvando = signal(false);
  erro = signal('');

  formatarDataHora = formatarDataHora;

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
        this.carregarFuncionarios();
      });
    });
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (!this.aberto() || this.salvando()) {
      return;
    }
    if (this.modo() !== 'escolha') {
      this.voltar();
      return;
    }
    this.fechar();
  }

  fechar() {
    if (this.salvando()) {
      return;
    }
    this.fechou.emit();
  }

  escolherManutencao() {
    this.modo.set('manutencao');
    this.erro.set('');
  }

  escolherRedirecionar() {
    this.modo.set('redirecionar');
    this.erro.set('');
  }

  voltar() {
    this.modo.set('escolha');
    this.erro.set('');
    this.tentouSalvar = false;
  }

  confirmarManutencao() {
    this.tentouSalvar = true;
    const atual = this.detalhe();
    const descricao = this.descricaoManutencao.trim();
    const orientacoes = this.orientacoesCliente.trim();
    if (!atual || !descricao || !orientacoes || this.salvando()) {
      return;
    }

    this.salvando.set(true);
    this.erro.set('');
    const funcionarioNome = this.auth.sessao()?.nome ?? 'Funcionario';

    this.solicitacaoService.efetuarManutencao(atual.id, descricao, orientacoes, funcionarioNome).subscribe({
      next: (atualizado) => {
        this.salvando.set(false);
        this.detalhe.set(atualizado);
        this.registrado.set('manutencao');
        this.registrou.emit(atualizado);
      },
      error: () => {
        this.salvando.set(false);
        this.erro.set('Nao foi possivel registrar a manutencao.');
      },
    });
  }

  confirmarRedirecionamento() {
    this.tentouSalvar = true;
    const atual = this.detalhe();
    if (!atual || !this.funcionarioDestino || this.salvando()) {
      return;
    }

    this.salvando.set(true);
    this.erro.set('');
    const funcionarioOrigem = this.auth.sessao()?.nome ?? 'Funcionario';

    this.solicitacaoService.redirecionar(atual.id, this.funcionarioDestino, funcionarioOrigem).subscribe({
      next: (atualizado) => {
        this.salvando.set(false);
        this.detalhe.set(atualizado);
        this.registrado.set('redirecionado');
        this.registrou.emit(atualizado);
      },
      error: () => {
        this.salvando.set(false);
        this.erro.set('Nao foi possivel redirecionar a solicitacao.');
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

  private carregarFuncionarios() {
    const nomeLogado = this.auth.sessao()?.nome ?? '';
    this.funcionariosService.listar().subscribe({
      next: (lista) => {
        this.outrosFuncionarios.set(
          lista.filter((f) => f.nome.trim().toLowerCase() !== nomeLogado.trim().toLowerCase()),
        );
      },
      error: () => this.outrosFuncionarios.set([]),
    });
  }

  private resetarUi() {
    this.detalhe.set(null);
    this.modo.set('escolha');
    this.registrado.set(null);
    this.descricaoManutencao = '';
    this.orientacoesCliente = '';
    this.funcionarioDestino = null;
    this.tentouSalvar = false;
    this.salvando.set(false);
    this.erro.set('');
  }
}
