import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Auth } from '../core/auth';
import { CATEGORIAS_INICIAIS } from './categoria.mock';
import { CategoriaPage } from './categoria';
import { CategoriaService } from './categoria.service';

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
            listar: () => of(CATEGORIAS_INICIAIS),
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
