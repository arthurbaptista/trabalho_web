import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Auth } from '../core/auth';
import { Logo } from '../shared/logo/logo';

@Component({
  selector: 'app-home',
  imports: [Logo, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly auth = inject(Auth);

  sessao = this.auth.sessao();

  ehFuncionario = this.sessao?.perfil === 'FUNCIONARIO';

  sair() {
    this.auth.logout();
  }
}
