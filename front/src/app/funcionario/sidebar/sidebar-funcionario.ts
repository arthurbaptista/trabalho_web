import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Logo } from '../../shared/logo/logo';

export type PaginaFuncionario =
  | 'funcionario'
  | 'funcionarios'
  | 'categorias'
  | 'receitas'
  | 'receitas-categoria';

@Component({
  selector: 'app-sidebar-funcionario',
  imports: [RouterLink, RouterLinkActive, Logo],
  templateUrl: './sidebar-funcionario.html',
  styleUrl: './sidebar-funcionario.css',
})
export class SidebarFuncionario {
  pagina = input<PaginaFuncionario>('funcionario');
  vista = input<'abertas' | 'todas'>('abertas');
  abertas = output<void>();
  todas = output<void>();
  sair = output<void>();
}
