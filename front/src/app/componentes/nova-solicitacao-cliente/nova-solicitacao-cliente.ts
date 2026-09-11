import { Component, HostListener, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, of, timeout } from 'rxjs';

import { Categoria, CategoriaService } from '../../categoria/categoria.service';
import { SolicitacaoResumo, SolicitacaoService } from '../../cliente/solicitacao.service';

const CATEGORIAS_DEMO: Categoria[] = [
  { id: 1, nome: 'Notebook', status: true },
  { id: 2, nome: 'Desktop', status: true },
  { id: 3, nome: 'Impressora', status: true },
  { id: 4, nome: 'Mouse', status: true },
  { id: 5, nome: 'Teclado', status: true },
];

@Component({
  selector: 'app-nova-solicitacao-cliente',
  imports: [FormsModule],
  templateUrl: './nova-solicitacao-cliente.html',
  styleUrl: './nova-solicitacao-cliente.css',
})
export class NovaSolicitacaoCliente {
  private readonly categoriaService = inject(CategoriaService);
  private readonly solicitacaoService = inject(SolicitacaoService);

  aberto = input(false);
  fechou = output<void>();
  criou = output<SolicitacaoResumo>();

  categorias = signal<Categoria[]>([]);
  creationDevice = '';
  creationCategoryId: number | null = null;
  creationDescription = '';
  attemptedSubmit = false;
  creating = false;
  dataHora = '';

  constructor() {
    effect(() => {
      if (this.aberto()) {
        this.resetar();
        this.carregarCategorias();
      }
    });
  }

  get deviceVazio() {
    return this.creationDevice.trim().length === 0;
  }

  get categoriaVazia() {
    return this.creationCategoryId == null;
  }

  get descricaoVazia() {
    return this.creationDescription.trim().length === 0;
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.aberto() && !this.creating) {
      this.closeModal();
    }
  }

  closeModal() {
    if (this.creating) {
      return;
    }
    this.fechou.emit();
  }

  confirmar() {
    this.attemptedSubmit = true;
    if (this.deviceVazio || this.categoriaVazia || this.descricaoVazia) {
      return;
    }

    const categoria = this.categorias().find((item) => item.id === this.creationCategoryId);
    if (!categoria) {
      return;
    }

    this.creating = true;
    this.solicitacaoService
      .criar({
        descricaoEquipamento: this.creationDevice.trim().slice(0, 30),
        categoriaId: categoria.id,
        descricaoDefeito: this.creationDescription.trim(),
        categoriaNome: categoria.nome,
      })
      .subscribe({
        next: (solicitacao) => {
          this.creating = false;
          this.criou.emit(solicitacao);
          this.fechou.emit();
        },
        error: () => {
          this.creating = false;
        },
      });
  }

  private resetar() {
    this.creationDevice = '';
    this.creationCategoryId = null;
    this.creationDescription = '';
    this.attemptedSubmit = false;
    this.creating = false;
    this.dataHora = this.formatarAgora();
  }

  private carregarCategorias() {
    this.categoriaService
      .listar()
      .pipe(
        timeout(2000),
        catchError(() => of(CATEGORIAS_DEMO)),
      )
      .subscribe((lista) => this.categorias.set(lista));
  }

  private formatarAgora(): string {
    const data = new Date();
    const dia = new Intl.DateTimeFormat('pt-BR', { day: 'numeric' }).format(data);
    const mes = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(data);
    const hora = new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(data);
    const mesCap = mes.charAt(0).toUpperCase() + mes.slice(1);
    return `${dia} de ${mesCap} ${hora.replace(':', 'h')}`;
  }
}
