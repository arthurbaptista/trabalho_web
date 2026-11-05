import { Routes } from '@angular/router';

import { CategoriaPage } from './funcionario/categorias/categoria';
import { TelaInicialCliente } from './cliente/inicio/tela-inicial-cliente';
import { perfilInicialGuard } from './core/auth.guard';
import { clienteGuard } from './core/cliente.guard';
import { funcionarioGuard } from './core/funcionario.guard';
import { SolicitacaoPage } from './funcionario/solicitacoes/solicitacao';
import { Autocadastro } from './auth/cadastro/autocadastro';
import { Login } from './auth/login/login';
import { RelatorioReceitasPage } from './funcionario/relatorios/receitas/relatorio-receitas';
import { RelatorioReceitasCategoriaPage } from './funcionario/relatorios/receitas-categoria/relatorio-receitas-categoria';
import { FuncionariosPage } from './funcionario/funcionarios/funcionarios';

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
