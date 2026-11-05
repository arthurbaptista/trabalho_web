import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

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
              linhas: [{ chave: '2026-01-01', rotulo: '01/01/2026', quantidade: 1, total: 100 }],
              quantidade: 1,
              total: 100,
            }),
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
