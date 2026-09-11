import { Routes } from '@angular/router';

import { Autocadastro } from './autocadastro/autocadastro';
import { CategoriaPage } from './categoria/categoria';
import { Cliente } from './cliente/cliente';
import { authGuard } from './core/auth.guard';
import { funcionarioGuard } from './core/funcionario.guard';
import { Home } from './home/home';
import { Login } from './login/login';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'cadastro', component: Autocadastro },
  { path: 'home', component: Home, canActivate: [authGuard] },
  { path: 'cliente', component: Cliente, canActivate: [authGuard] },
  { path: 'categorias', component: CategoriaPage, canActivate: [funcionarioGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
