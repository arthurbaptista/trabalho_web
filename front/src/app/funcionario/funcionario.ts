import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { mensagemHttpErro } from '../core/api';
import { Auth } from '../core/auth';
import { Logo } from '../shared/logo/logo';
import { FuncionarioService, Solicitacao } from './funcionario.service';

const TAMANHO_MAX_EQUIPAMENTO = 30;

@Component({
  selector: 'app-funcionario',
  imports: [FormsModule, RouterLink, Logo, DatePipe],
  templateUrl: './funcionario.html',
  styleUrl: './funcionario.css',
})
export class FuncionarioPage {
  private readonly funcionarioService = inject(FuncionarioService);
  readonly auth = inject(Auth);

  solicitacoes = signal<Solicitacao[]>([]);
  solicitacoesAbertas = computed(() =>
    this.solicitacoes().filter((s) => s.estadoAtual === 'ABERTA'),
  );

  valores: Record<number, number | null> = {};
  erro = signal('');
  sucesso = signal('');
  carregando = signal(false);

  constructor() {
    this.carregar();
  }

  carregar() {
    this.funcionarioService.listarSolicitacoes().subscribe({
      next: (lista) => {
        const ordenadas = [...lista].sort(
          (a, b) => new Date(a.dataHoraAbertura).getTime() - new Date(b.dataHoraAbertura).getTime(),
        );
        this.solicitacoes.set(ordenadas);
      },
      error: (erro) => this.erro.set(mensagemHttpErro(erro, 'Nao foi possivel listar as solicitacoes.')),
    });
  }

  truncar(texto: string): string {
    return texto.length > TAMANHO_MAX_EQUIPAMENTO
      ? `${texto.slice(0, TAMANHO_MAX_EQUIPAMENTO)}…`
      : texto;
  }

  efetuarOrcamento(solicitacao: Solicitacao) {
    const valor = this.valores[solicitacao.id];
    if (!valor || valor <= 0) {
      this.sucesso.set('');
      this.erro.set('Informe um valor de orcamento valido.');
      return;
    }

    this.erro.set('');
    this.sucesso.set('');
    this.carregando.set(true);

    this.funcionarioService.efetuarOrcamento(solicitacao.id, valor).subscribe({
      next: () => {
        this.carregando.set(false);
        this.sucesso.set(`Orcamento enviado para "${solicitacao.descricaoEquipamento}".`);
        delete this.valores[solicitacao.id];
        this.carregar();
      },
      error: (erro) => {
        this.carregando.set(false);
        this.erro.set(mensagemHttpErro(erro, 'Nao foi possivel registrar o orcamento.'));
      },
    });
  }

  sair() {
    this.auth.logout();
  }
}