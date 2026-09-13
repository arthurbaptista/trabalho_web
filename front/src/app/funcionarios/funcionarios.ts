import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { nomesIguais } from '../cliente/solicitacao.util';
import { SidebarFuncionario } from '../componentes/sidebar-funcionario/sidebar-funcionario';
import { mensagemHttpErro } from '../core/api';
import { Auth } from '../core/auth';
import { FuncionarioCadastroService } from './funcionario-cadastro.service';
import type { FuncionarioCadastro } from './funcionario-cadastro.store';

@Component({
  selector: 'app-funcionarios',
  imports: [FormsModule, SidebarFuncionario],
  templateUrl: './funcionarios.html',
  styleUrl: './funcionarios.css',
})
export class FuncionariosPage {
  private readonly cadastro = inject(FuncionarioCadastroService);
  readonly auth = inject(Auth);

  funcionarios = signal<FuncionarioCadastro[]>([]);
  nome = '';
  email = '';
  dataNascimento = '';
  senha = '';
  editandoId: number | null = null;
  erro = signal('');
  sucesso = signal('');
  carregando = signal(false);

  nomeUsuario = computed(() => this.auth.sessao()?.nome ?? '');
  primeiroNome = computed(() => this.nomeUsuario().split(' ')[0] || 'Funcionário');
  iniciais = computed(() => {
    const partes = this.nomeUsuario().trim().split(/\s+/).filter(Boolean);
    if (partes.length === 0) {
      return 'F';
    }
    if (partes.length === 1) {
      return partes[0].slice(0, 2).toUpperCase();
    }
    return (partes[0][0] + partes[1][0]).toUpperCase();
  });

  constructor() {
    this.carregar();
  }

  carregar() {
    this.cadastro.listar().subscribe({
      next: (lista) => {
        this.funcionarios.set(lista);
        this.erro.set('');
      },
      error: (erro) => this.erro.set(mensagemHttpErro(erro, 'Nao foi possivel listar os funcionarios.')),
    });
  }

  salvar() {
    this.erro.set('');
    this.sucesso.set('');
    this.carregando.set(true);

    const payload = {
      nome: this.nome,
      email: this.email,
      dataNascimento: this.dataNascimento,
      senha: this.senha,
    };

    const pedido = this.editandoId === null
      ? this.cadastro.criar(payload)
      : this.cadastro.atualizar(this.editandoId, payload);

    pedido.subscribe({
      next: (salvo) => {
        this.carregando.set(false);
        if (salvo && this.ehEu(salvo)) {
          this.auth.atualizarPerfil(salvo.nome, salvo.email);
        }
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

  editar(funcionario: FuncionarioCadastro) {
    this.editandoId = funcionario.id;
    this.nome = funcionario.nome;
    this.email = funcionario.email;
    this.dataNascimento = funcionario.dataNascimento;
    this.senha = '';
    this.erro.set('');
    this.sucesso.set('');
  }

  cancelarEdicao() {
    this.editandoId = null;
    this.nome = '';
    this.email = '';
    this.dataNascimento = '';
    this.senha = '';
  }

  remover(funcionario: FuncionarioCadastro) {
    if (!this.podeRemover(funcionario)) {
      this.erro.set(this.motivoBloqueio(funcionario));
      this.sucesso.set('');
      return;
    }
    if (!confirm(`Remover o funcionario "${funcionario.nome}"?`)) {
      return;
    }

    this.cadastro.remover(funcionario.id, this.auth.sessao()?.email).subscribe({
      next: () => {
        this.sucesso.set('Funcionario removido.');
        this.erro.set('');
        this.carregar();
      },
      error: (erro) => this.erro.set(mensagemHttpErro(erro, 'Nao foi possivel remover o funcionario.')),
    });
  }

  podeRemover(funcionario: FuncionarioCadastro): boolean {
    return !this.motivoBloqueio(funcionario);
  }

  motivoBloqueio(funcionario: FuncionarioCadastro): string {
    if (this.funcionarios().length <= 1) {
      return 'Nao e possivel remover o unico funcionario.';
    }
    if (this.ehEu(funcionario)) {
      return 'Voce nao pode remover a si mesmo.';
    }
    return '';
  }

  formatarNascimento(iso: string): string {
    const [ano, mes, dia] = iso.split('-');
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : iso;
  }

  sair() {
    this.auth.logout();
  }

  private ehEu(funcionario: { nome: string; email: string }): boolean {
    const sessao = this.auth.sessao();
    if (!sessao) {
      return false;
    }
    const email = sessao.email?.trim().toLowerCase() ?? '';
    if (email && funcionario.email === email) {
      return true;
    }
    return nomesIguais(funcionario.nome, sessao.nome);
  }
}
