import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Logo } from '../shared/logo/logo';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, Logo],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  senha = '';
  lembrar = false;

  erro = signal('');
  carregando = signal(false);
  mostrarSenha = signal(false);

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

    // TODO: trocar pelo HttpClient chamando o endpoint de login real
    console.log('Login enviado:', this.email, this.senha);

    setTimeout(() => this.carregando.set(false), 800);
  }
}
