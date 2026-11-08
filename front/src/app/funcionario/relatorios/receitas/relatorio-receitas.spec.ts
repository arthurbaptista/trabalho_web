import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { Auth } from '../../../core/auth';
import { RelatorioService } from '../relatorio.service';
import { RelatorioReceitasPage } from './relatorio-receitas';

describe('RelatorioReceitasPage', () => {
  let component: RelatorioReceitasPage;
  let fixture: ComponentFixture<RelatorioReceitasPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelatorioReceitasPage],
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
            porPeriodo: () => of({
              linhas: [{ chave: '2026-03-01', rotulo: '01/03/2026', quantidade: 2, total: 80 }],
              quantidade: 2,
              total: 80,
            }),
            baixarPdfPeriodo: () => of(new Blob()),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RelatorioReceitasPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.relatorio().quantidade).toBeGreaterThan(0);
    fixture.detectChanges();
    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('01/03/2026');
    expect(texto).not.toContain('Carregando...');
  });
});

describe('RelatorioReceitasPage estados', () => {
  const auth = {
    sessao: () => ({ token: 't', perfil: 'FUNCIONARIO', nome: 'Maria' }),
    logout: () => undefined,
  };

  it('mostra Carregando e depois a tabela vazia', async () => {
    const respostas = new Subject<{ linhas: never[]; quantidade: number; total: number }>();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [RelatorioReceitasPage],
      providers: [
        provideRouter([]),
        { provide: Auth, useValue: auth },
        {
          provide: RelatorioService,
          useValue: {
            porPeriodo: () => respostas.asObservable(),
            baixarPdfPeriodo: () => of(new Blob()),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(RelatorioReceitasPage);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Carregando...');

    respostas.next({ linhas: [], quantidade: 0, total: 0 });
    fixture.detectChanges();
    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('Nenhuma receita encontrada');
    expect(texto).not.toContain('Carregando...');
  });

  it('mostra erro quando a API nao responde', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [RelatorioReceitasPage],
      providers: [
        provideRouter([]),
        { provide: Auth, useValue: auth },
        {
          provide: RelatorioService,
          useValue: {
            porPeriodo: () => throwError(() => ({ status: 0 })),
            baixarPdfPeriodo: () => throwError(() => ({ status: 401 })),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(RelatorioReceitasPage);
    fixture.detectChanges();
    const pagina = fixture.componentInstance;
    expect(fixture.nativeElement.textContent).toContain('Verifique se a API esta no ar');
    expect(fixture.nativeElement.textContent).not.toContain('Nenhuma receita encontrada');

    pagina.gerarPdf();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Sessao invalida ou token expirado');
  });
});
