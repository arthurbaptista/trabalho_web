import { Component, inject } from '@angular/core';

import { Auth } from '../core/auth';
import { Logo } from '../shared/logo/logo';

@Component({
  selector: 'app-home',
  imports: [Logo],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly auth = inject(Auth);

  sessao = this.auth.sessao();

  sair() {
    this.auth.logout();
  }
}
