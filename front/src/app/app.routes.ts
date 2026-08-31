import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Autocadastro } from './autocadastro/autocadastro';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'cadastro', component: Autocadastro },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];