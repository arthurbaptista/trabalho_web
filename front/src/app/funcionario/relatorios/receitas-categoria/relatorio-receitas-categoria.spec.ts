import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Auth } from '../../../core/auth';
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
              linhas: [{ chave: 'Notebook', rotulo: 'Notebook', quantidade: 1, total: 100 }],
              quantidade: 1,
              total: 100,
            }),
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
  });
});
