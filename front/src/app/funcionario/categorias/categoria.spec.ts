import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Auth } from '../../core/auth';
import { CategoriaPage } from './categoria';
import { CategoriaService } from './categoria.service';

const CATEGORIAS = [
  { id: 1, nome: 'Notebook', status: true },
  { id: 2, nome: 'Desktop', status: true },
  { id: 3, nome: 'Impressora', status: true },
  { id: 4, nome: 'Mouse', status: true },
  { id: 5, nome: 'Teclado', status: true },
];

describe('CategoriaPage', () => {
  let component: CategoriaPage;
  let fixture: ComponentFixture<CategoriaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriaPage],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: Auth,
          useValue: {
            sessao: () => ({ token: 't', perfil: 'FUNCIONARIO', nome: 'Maria' }),
            logout: () => undefined,
          },
        },
        {
          provide: CategoriaService,
          useValue: {
            listar: () => of(CATEGORIAS),
            criar: (nome: string) => of({ id: 6, nome, status: true }),
            atualizar: (id: number, nome: string) => of({ id, nome, status: true }),
            remover: () => of(undefined),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriaPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('carrega as 5 categorias iniciais', () => {
    expect(component.categorias().map((item) => item.nome)).toEqual([
      'Notebook',
      'Desktop',
      'Impressora',
      'Mouse',
      'Teclado',
    ]);
  });

  it('nao salva sem nome', () => {
    component.nome = '   ';
    component.salvar();
    expect(component.erro()).toBe('Informe o nome da categoria.');
  });
});
