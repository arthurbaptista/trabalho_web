import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Auth } from '../../core/auth';
import { SolicitacaoService } from '../solicitacao.service';
import { TelaInicialCliente } from './tela-inicial-cliente';

describe('TelaInicialCliente', () => {
  let component: TelaInicialCliente;
  let fixture: ComponentFixture<TelaInicialCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TelaInicialCliente],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: Auth,
          useValue: {
            sessao: () => ({ token: 't', perfil: 'CLIENTE', nome: 'Joao' }),
            logout: () => undefined,
          },
        },
        {
          provide: SolicitacaoService,
          useValue: {
            listarDoCliente: () => of([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TelaInicialCliente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('trunca a descricao do equipamento em 30 caracteres', () => {
    expect(component.descricao('Macbook M1 Pro')).toBe('Macbook M1 Pro');
    expect(component.descricao('A'.repeat(35))).toBe('A'.repeat(30));
  });

  it('mostra o estado em portugues', () => {
    expect(component.rotuloEstado('ORCADA')).toBe('Orçada');
    expect(component.rotuloEstado('ARRUMADA')).toBe('Arrumada');
  });

  it('formata valores no padrao brasileiro', () => {
    expect(component.formatarMoeda(1250)).toContain('1.250');
  });

  it('formata data e hora no padrao brasileiro', () => {
    expect(component.formatarDataHora('2026-02-19T19:47:00')).toMatch(/19 de Fevereiro 19h47/i);
  });
});
