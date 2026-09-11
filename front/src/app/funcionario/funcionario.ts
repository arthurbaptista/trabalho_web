import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { mensagemHttpErro } from '../core/api';
import { Auth } from '../core/auth';
import { Logo } from '../shared/logo/logo';
import { FuncionarioService, Solicitacao } from './funcionario.service';

const ESTADO_LABEL: Record<string, string> = {
  ABERTA: 'Aberta',
  ORCADA: 'Orçada',
  APROVADA: 'Aprovada',
  REJEITADA: 'Rejeitada',
  REDIRECIONADA: 'Redirecionada',
  ARRUMADA: 'Arrumada',
  PAGA: 'Paga',
  FINALIZADA: 'Finalizada',
};

@Component({
  selector: 'app-funcionario',
  imports: [FormsModule, RouterLink, Logo, DatePipe, CurrencyPipe],
  templateUrl: './funcionario.html',
  styleUrl: './funcionario.css',
})
export class FuncionarioPage {
  private readonly funcionarioService = inject(FuncionarioService);
  readonly auth = inject(Auth);

  solicitacoes = signal<Solicitacao[]>([]);
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

  rotulo(estado: string): string {
    return ESTADO_LABEL[estado] ?? estado;
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
