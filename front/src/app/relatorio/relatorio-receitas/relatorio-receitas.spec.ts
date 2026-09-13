import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Auth } from '../../core/auth';
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
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RelatorioReceitasPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.relatorio().quantidade).toBeGreaterThan(0);
  });
});
