import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { mensagemHttpErro } from '../core/api';
import { Auth } from '../core/auth';
import { FuncionarioRegistro } from '../core/funcionarios.mock';
import { Logo } from '../shared/logo/logo';
import { FuncionariosService } from './funcionarios.service';

@Component({
  selector: 'app-funcionarios',
  imports: [FormsModule, RouterLink, Logo, DatePipe],
  templateUrl: './funcionarios.html',
  styleUrl: './funcionarios.css',
})
export class FuncionariosPage {
  private readonly funcionariosService = inject(FuncionariosService);
  readonly auth = inject(Auth);

  funcionarios = signal<FuncionarioRegistro[]>([]);
  editandoId: number | null = null;
  nome = '';
  email = '';
  dataNascimento = '';
  erro = signal('');
  sucesso = signal('');
  carregando = signal(false);

  nomeLogado = computed(() => this.auth.sessao()?.nome ?? '');
  ehUltimoAtivo = computed(() => this.funcionarios().length <= 1);

  constructor() {
    this.carregar();
  }

  carregar() {
    this.funcionariosService.listar().subscribe({
      next: (lista) => this.funcionarios.set(lista),
      error: (erro) => this.erro.set(mensagemHttpErro(erro, 'Nao foi possivel listar os funcionarios.')),
    });
  }

  salvar() {
    const nome = this.nome.trim();
    const email = this.email.trim();
    const dataNascimento = this.dataNascimento;

    if (!nome || !email || !dataNascimento) {
      this.sucesso.set('');
      this.erro.set('Preencha nome, e-mail e data de nascimento.');
      return;
    }

    this.erro.set('');
    this.sucesso.set('');
    this.carregando.set(true);

    const payload = { nome, email, dataNascimento };
    const pedido = this.editandoId === null
      ? this.funcionariosService.criar(payload)
      : this.funcionariosService.atualizar(this.editandoId, payload);

    pedido.subscribe({
      next: () => {
        this.carregando.set(false);
        this.sucesso.set(this.editandoId === null ? 'Funcionario cadastrado.' : 'Funcionario atualizado.');
        this.cancelarEdicao();
        this.carregar();
      },
      error: (erro) => {
        this.carregando.set(false);
        this.erro.set(mensagemHttpErro(erro, 'Nao foi possivel salvar o funcionario.'));
      },
    });
  }

  editar(funcionario: FuncionarioRegistro) {
    this.editandoId = funcionario.id;
    this.nome = funcionario.nome;
    this.email = funcionario.email;
    this.dataNascimento = funcionario.dataNascimento;
    this.erro.set('');
    this.sucesso.set('');
  }

  cancelarEdicao() {
    this.editandoId = null;
    this.nome = '';
    this.email = '';
    this.dataNascimento = '';
  }

  ehVoceMesmo(funcionario: FuncionarioRegistro): boolean {
    return funcionario.nome.trim().toLowerCase() === this.nomeLogado().trim().toLowerCase();
  }

  remover(funcionario: FuncionarioRegistro) {
    if (this.ehVoceMesmo(funcionario)) {
      this.sucesso.set('');
      this.erro.set('Voce nao pode remover a si mesmo.');
      return;
    }
    if (this.ehUltimoAtivo()) {
      this.sucesso.set('');
      this.erro.set('Deve haver pelo menos um funcionario ativo.');
      return;
    }
    if (!confirm(`Remover o funcionario "${funcionario.nome}"?`)) {
      return;
    }

    this.funcionariosService.remover(funcionario.id).subscribe({
      next: () => {
        this.sucesso.set('Funcionario removido.');
        this.erro.set('');
        this.carregar();
      },
      error: (erro) => this.erro.set(mensagemHttpErro(erro, 'Nao foi possivel remover o funcionario.')),
    });
  }

  sair() {
    this.auth.logout();
  }
}
