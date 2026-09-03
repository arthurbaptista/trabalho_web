import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { mensagemHttpErro } from '../core/api';
import { Auth } from '../core/auth';
import { Logo } from '../shared/logo/logo';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, Logo],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  email = '';
  senha = '';
  lembrar = false;

  erro = signal('');
  carregando = signal(false);
  mostrarSenha = signal(false);

  constructor() {
    if (this.auth.estaLogado()) {
      this.router.navigateByUrl('/home');
    }
  }

  alternarSenha() {
    this.mostrarSenha.update((v) => !v);
  }

  onSubmit() {
    if (!this.email || !this.senha) {
      this.erro.set('Preencha e-mail e senha.');
      return;
    }

    this.erro.set('');
    this.carregando.set(true);

    this.auth.login(this.email.trim(), this.senha, this.lembrar).subscribe({
      next: () => {
        this.carregando.set(false);
        this.router.navigateByUrl('/home');
      },
      error: (erro) => {
        this.carregando.set(false);
        this.erro.set(mensagemHttpErro(erro, 'Nao foi possivel entrar. Tente novamente.'));
      },
    });
  }
}
