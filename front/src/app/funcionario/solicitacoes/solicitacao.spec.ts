import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Auth } from '../../core/auth';
import { SolicitacaoPage } from './solicitacao';
import type { SolicitacaoFuncionario } from '../../shared/solicitacao/solicitacao.models';
import { SolicitacaoService } from './solicitacao.service';

const CLIENTE = {
  id: 1,
  nome: 'Joao',
  email: 'joao@manutencao.com',
  cpf: '',
  telefone: '',
  endereco: '',
};

function sol(
  parcial: Partial<SolicitacaoFuncionario> & Pick<SolicitacaoFuncionario, 'id' | 'estado' | 'dataHoraAbertura'>,
): SolicitacaoFuncionario {
  return {
    descricaoEquipamento: 'Notebook',
    descricaoDefeito: 'Defeito',
    categoria: 'Notebook',
    valorOrcamento: null,
    cliente: CLIENTE,
    funcionarioDestino: null,
    historico: [],
    ...parcial,
  };
}

const LISTA: SolicitacaoFuncionario[] = [
  sol({ id: 1, estado: 'ABERTA', dataHoraAbertura: '2026-02-10T10:00:00' }),
  sol({ id: 14, estado: 'REDIRECIONADA', dataHoraAbertura: '2026-02-10T11:00:00', funcionarioDestino: 'Mario' }),
  sol({ id: 21, estado: 'REDIRECIONADA', dataHoraAbertura: '2026-02-10T12:00:00', funcionarioDestino: 'Maria' }),
  sol({ id: 30, estado: 'APROVADA', dataHoraAbertura: '2026-03-01T09:00:00' }),
];

describe('SolicitacaoPage', () => {
  let component: SolicitacaoPage;
  let fixture: ComponentFixture<SolicitacaoPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitacaoPage],
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
          provide: SolicitacaoService,
          useValue: {
            listar: () => of(LISTA),
            detalhar: (id: number) => of(LISTA.find((item) => item.id === id)),
            listarFuncionarios: () => of([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitacaoPage);
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
    const aprovada = LISTA.find((item) => item.estado === 'APROVADA')!;
    component.redirecionar(aprovada);
    expect(component.detalheAberto()).toBe(true);
    expect(component.modoDetalhe()).toBe('redirecionar');
    expect(component.solicitacaoAtual()?.id).toBe(aprovada.id);
  });
});
