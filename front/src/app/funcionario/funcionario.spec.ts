import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Auth } from '../core/auth';
import { SOLICITACOES_FUNCIONARIO_DEMO } from './funcionario.mock';
import { FuncionarioPage } from './funcionario';
import { FuncionarioService } from './funcionario.service';

describe('FuncionarioPage', () => {
  let component: FuncionarioPage;
  let fixture: ComponentFixture<FuncionarioPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FuncionarioPage],
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
          provide: FuncionarioService,
          useValue: {
            listar: () => of(SOLICITACOES_FUNCIONARIO_DEMO),
            detalhar: (id: number) => of(SOLICITACOES_FUNCIONARIO_DEMO.find((item) => item.id === id)),
            listarFuncionarios: () => of([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FuncionarioPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('mostra apenas solicitacoes abertas na pagina inicial', () => {
    expect(component.visiveis().every((item) => item.estado === 'ABERTA')).toBe(true);
  });

  it('trunca a descricao do equipamento em 30 caracteres', () => {
    expect(component.descricao('Macbook M1 Pro')).toBe('Macbook M1 Pro');
    expect(component.descricao('A'.repeat(35))).toBe('A'.repeat(30));
  });

  it('esconde redirecionadas de outro funcionario na lista geral', () => {
    component.mostrarTodas();
    const ids = component.visiveis().map((item) => item.id);
    expect(ids).toContain(21);
    expect(ids).not.toContain(14);
  });

  it('aplica o filtro de periodo na lista geral', () => {
    component.mostrarTodas();
    component.escolherFiltro('PERIODO');
    component.escolherInicio('2026-02-10');
    component.escolherFim('2026-02-10');
    expect(component.visiveis().every((item) => item.dataHoraAbertura.startsWith('2026-02-10'))).toBe(true);
    expect(component.visiveis().length).toBeGreaterThan(0);
  });

  it('abre o detalhe de redirecionamento', () => {
    const aprovada = SOLICITACOES_FUNCIONARIO_DEMO.find((item) => item.estado === 'APROVADA')!;
    component.redirecionar(aprovada);
    expect(component.detalheAberto()).toBe(true);
    expect(component.modoDetalhe()).toBe('redirecionar');
    expect(component.solicitacaoAtual()?.id).toBe(aprovada.id);
  });
});
