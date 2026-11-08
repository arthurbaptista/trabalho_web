import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { Auth } from '../../core/auth';
import { RelatorioService } from '../relatorio.service';
import { RelatorioReceitasCategoriaPage } from './relatorio-receitas-categoria';

describe('RelatorioReceitasCategoriaPage', () => {
  let component: RelatorioReceitasCategoriaPage;
  let fixture: ComponentFixture<RelatorioReceitasCategoriaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelatorioReceitasCategoriaPage],
      providers: [
        provideRouter([]),
        {
          provide: Auth,
          useValue: {
            sessao: () => ({ token: 't', perfil: 'FUNCIONARIO', nome: 'Maria' }),
            logout: () => undefined,
          },
        },
        {
          provide: RelatorioService,
          useValue: {
            porCategoria: () => of({
              linhas: [{ chave: 'Notebook', rotulo: 'Notebook', quantidade: 1, total: 50 }],
              quantidade: 1,
              total: 50,
            }),
            baixarPdfCategoria: () => of(new Blob()),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RelatorioReceitasCategoriaPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.relatorio().linhas.some((linha) => linha.rotulo === 'Notebook')).toBe(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Notebook');
  });
});

describe('RelatorioReceitasCategoriaPage erro', () => {
  it('mostra erro quando o acesso e negado', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [RelatorioReceitasCategoriaPage],
      providers: [
        provideRouter([]),
        {
          provide: Auth,
          useValue: {
            sessao: () => ({ token: 't', perfil: 'FUNCIONARIO', nome: 'Maria' }),
            logout: () => undefined,
          },
        },
        {
          provide: RelatorioService,
          useValue: {
            porCategoria: () => throwError(() => ({ status: 403 })),
            baixarPdfCategoria: () => of(new Blob()),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(RelatorioReceitasCategoriaPage);
    fixture.detectChanges();
    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('Acesso negado');
    expect(texto).not.toContain('Nenhuma receita encontrada');
  });
});
