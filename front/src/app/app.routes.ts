import { Routes } from '@angular/router';

import { Autocadastro } from './autocadastro/autocadastro';
import { authGuard } from './core/auth.guard';
import { Home } from './home/home';
import { Login } from './login/login';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'cadastro', component: Autocadastro },
  { path: 'home', component: Home, canActivate: [authGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
