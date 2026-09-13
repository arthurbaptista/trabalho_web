import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Auth } from '../../core/auth';
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
