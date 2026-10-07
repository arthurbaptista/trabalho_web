import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Auth } from '../core/auth';
import { resetarFuncionariosCadastro } from './funcionario-cadastro.store';
import { FuncionariosPage } from './funcionarios';

describe('FuncionariosPage', () => {
  let component: FuncionariosPage;
  let fixture: ComponentFixture<FuncionariosPage>;

  beforeEach(async () => {
    resetarFuncionariosCadastro();
    await TestBed.configureTestingModule({
      imports: [FuncionariosPage],
      providers: [
        provideRouter([]),
        {
          provide: Auth,
          useValue: {
            sessao: () => ({
              token: 't',
              perfil: 'FUNCIONARIO',
              nome: 'Maria',
              email: 'maria@manutencao.com',
            }),
            logout: () => undefined,
            atualizarPerfil: () => undefined,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FuncionariosPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.funcionarios().map((item) => item.nome)).toEqual(['Maria', 'Mario']);
  });

  it('nao permite Maria remover a si mesma', () => {
    const maria = component.funcionarios().find((item) => item.email === 'maria@manutencao.com')!;
    expect(component.podeRemover(maria)).toBe(false);
    expect(component.motivoBloqueio(maria)).toContain('si mesmo');
  });

  it('permite Maria remover Mario', () => {
    const mario = component.funcionarios().find((item) => item.email === 'mario@manutencao.com')!;
    expect(component.podeRemover(mario)).toBe(true);
  });
});
