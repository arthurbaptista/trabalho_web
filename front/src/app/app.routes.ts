import { Routes } from '@angular/router';

import { CategoriaPage } from './categoria/categoria';
import { TelaInicialCliente } from './cliente/tela-inicial-cliente/tela-inicial-cliente';
import { perfilInicialGuard } from './core/auth.guard';
import { clienteGuard } from './core/cliente.guard';
import { funcionarioGuard } from './core/funcionario.guard';
import { FuncionarioPage } from './funcionario/funcionario';
import { Autocadastro } from './home/autocadastro/autocadastro';
import { Login } from './home/login/login';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'cadastro', component: Autocadastro },
  { path: 'home', canActivate: [perfilInicialGuard], children: [] },
  { path: 'cliente', component: TelaInicialCliente, canActivate: [clienteGuard] },
  { path: 'categorias', component: CategoriaPage, canActivate: [funcionarioGuard] },
  { path: 'funcionario', component: FuncionarioPage, canActivate: [funcionarioGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
