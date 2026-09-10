import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { mensagemHttpErro } from '../core/api';
import { Auth } from '../core/auth';
import { Logo } from '../shared/logo/logo';
import { Categoria, CategoriaService } from './categoria.service';

@Component({
  selector: 'app-categoria',
  imports: [FormsModule, RouterLink, Logo],
  templateUrl: './categoria.html',
  styleUrl: './categoria.css',
})
export class CategoriaPage {
  private readonly categoriaService = inject(CategoriaService);
  readonly auth = inject(Auth);

  categorias = signal<Categoria[]>([]);
  nome = '';
  editandoId: number | null = null;
  erro = signal('');
  sucesso = signal('');
  carregando = signal(false);

  constructor() {
    this.carregar();
  }

  carregar() {
    this.categoriaService.listar().subscribe({
      next: (lista) => this.categorias.set(lista),
      error: (erro) => this.erro.set(mensagemHttpErro(erro, 'Nao foi possivel listar as categorias.')),
    });
  }

  salvar() {
    const nome = this.nome.trim();
    if (!nome) {
      this.sucesso.set('');
      this.erro.set('Informe o nome da categoria.');
      return;
    }

    this.erro.set('');
    this.sucesso.set('');
    this.carregando.set(true);

    const pedido = this.editandoId === null
      ? this.categoriaService.criar(nome)
      : this.categoriaService.atualizar(this.editandoId, nome);

    pedido.subscribe({
      next: () => {
        this.carregando.set(false);
        this.sucesso.set(this.editandoId === null ? 'Categoria cadastrada.' : 'Categoria atualizada.');
        this.cancelarEdicao();
        this.carregar();
      },
      error: (erro) => {
        this.carregando.set(false);
        this.erro.set(mensagemHttpErro(erro, 'Nao foi possivel salvar a categoria.'));
      },
    });
  }

  editar(categoria: Categoria) {
    this.editandoId = categoria.id;
    this.nome = categoria.nome;
    this.erro.set('');
    this.sucesso.set('');
  }

  cancelarEdicao() {
    this.editandoId = null;
    this.nome = '';
  }

  remover(categoria: Categoria) {
    if (!confirm(`Desativar a categoria "${categoria.nome}"?`)) {
      return;
    }

    this.categoriaService.remover(categoria.id).subscribe({
      next: () => {
        this.sucesso.set('Categoria desativada.');
        this.erro.set('');
        this.carregar();
      },
      error: (erro) => this.erro.set(mensagemHttpErro(erro, 'Nao foi possivel desativar a categoria.')),
    });
  }

  sair() {
    this.auth.logout();
  }
}
