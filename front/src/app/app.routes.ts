import { Routes } from '@angular/router';

import { CategoriaPage } from './categoria/categoria';
import { TelaInicialCliente } from './cliente/tela-inicial-cliente/tela-inicial-cliente';
import { perfilInicialGuard } from './core/auth.guard';
import { clienteGuard } from './core/cliente.guard';
import { funcionarioGuard } from './core/funcionario.guard';
import { SolicitacaoPage } from './solicitacao/solicitacao';
import { Autocadastro } from './home/autocadastro/autocadastro';
import { Login } from './home/login/login';
import { RelatorioReceitasPage } from './relatorio/relatorio-receitas/relatorio-receitas';
import { RelatorioReceitasCategoriaPage } from './relatorio/relatorio-receitas-categoria/relatorio-receitas-categoria';
import { FuncionariosPage } from './funcionario/funcionario-gestao/funcionarios';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'cadastro', component: Autocadastro },
  { path: 'home', canActivate: [perfilInicialGuard], children: [] },
  { path: 'cliente', component: TelaInicialCliente, canActivate: [clienteGuard] },
  { path: 'categorias', component: CategoriaPage, canActivate: [funcionarioGuard] },
  { path: 'funcionarios', component: FuncionariosPage, canActivate: [funcionarioGuard] },
  { path: 'relatorios/receitas', component: RelatorioReceitasPage, canActivate: [funcionarioGuard] },
  { path: 'relatorios/receitas-categoria', component: RelatorioReceitasCategoriaPage, canActivate: [funcionarioGuard] },
  { path: 'funcionario', component: SolicitacaoPage, canActivate: [funcionarioGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
