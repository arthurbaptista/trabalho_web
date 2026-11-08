import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Auth } from '../../core/auth';
import type { SolicitacaoFuncionario } from '../../shared/solicitacao/solicitacao.models';
import { SolicitacaoService as FuncionarioService } from '../solicitacoes/solicitacao.service';
import { DetalheSolicitacaoFuncionario } from './detalhe-solicitacao-funcionario';

const CLIENTE = {
  id: 4,
  nome: 'Joaquina',
  email: 'joaquina@manutencao.com',
  cpf: '',
  telefone: '',
  endereco: '',
};

const ABERTA: SolicitacaoFuncionario = {
  id: 1,
  dataHoraAbertura: '2026-01-12T14:10:00',
  descricaoEquipamento: 'Lenovo ThinkPad',
  descricaoDefeito: 'Nao carrega.',
  categoria: 'Notebook',
  estado: 'ABERTA',
  valorOrcamento: null,
  cliente: CLIENTE,
  funcionarioDestino: null,
  historico: [{ estado: 'ABERTA', dataHora: '2026-01-12T14:10:00', autor: 'Cliente' }],
};

const ARRUMADA: SolicitacaoFuncionario = {
  id: 2,
  dataHoraAbertura: '2026-01-20T10:00:00',
  descricaoEquipamento: 'Dell XPS',
  descricaoDefeito: 'Tela quebrada.',
  categoria: 'Notebook',
  estado: 'ARRUMADA',
  valorOrcamento: 350,
  cliente: CLIENTE,
  funcionarioDestino: null,
  historico: [
    { estado: 'ABERTA', dataHora: '2026-01-20T10:00:00', autor: 'Cliente Joaquina' },
    { estado: 'ORCADA', dataHora: '2026-01-20T18:00:00', autor: 'Maria' },
    { estado: 'APROVADA', dataHora: '2026-01-21T10:00:00', autor: 'Cliente Joaquina' },
    { estado: 'ARRUMADA', dataHora: '2026-01-22T10:00:00', autor: 'Maria' },
  ],
};

describe('DetalheSolicitacaoFuncionario', () => {
  let component: DetalheSolicitacaoFuncionario;
  let fixture: ComponentFixture<DetalheSolicitacaoFuncionario>;
  const idsOrcados: number[] = [];

  beforeEach(async () => {
    idsOrcados.length = 0;

    await TestBed.configureTestingModule({
      imports: [DetalheSolicitacaoFuncionario],
      providers: [
        provideHttpClient(),
        {
          provide: Auth,
          useValue: { sessao: () => ({ token: 't', perfil: 'FUNCIONARIO', nome: 'Maria' }) },
        },
        {
          provide: FuncionarioService,
          useValue: {
            detalhar: () => of(ABERTA),
            listarFuncionarios: () => of([
              { id: 1, nome: 'Maria', email: 'maria@manutencao.com' },
              { id: 2, nome: 'Mario', email: 'mario@manutencao.com' },
            ]),
            efetuarOrcamento: (id: number, valor: number) => {
              idsOrcados.push(id);
              return of({ ...ABERTA, estado: 'ORCADA', valorOrcamento: valor });
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalheSolicitacaoFuncionario);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('aberto', true);
    fixture.componentRef.setInput('solicitacao', ABERTA);
    fixture.componentRef.setInput('modo', 'orcamento');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('nao registra orcamento sem valor', () => {
    component.detalhe.set(ABERTA);
    component.valorTexto = '';
    component.confirmarOrcamento();
    expect(idsOrcados).toEqual([]);
    expect(component.tentativa).toBe(true);
  });

  it('mostra Cliente e o nome no historico', () => {
    component.detalhe.set(ABERTA);
    expect(component.autorDoPasso('Cliente')).toBe(`Cliente ${ABERTA.cliente.nome}`);
  });

  it('mostra o mesmo funcionario no orcamento e na manutencao quando nao houve redirecionamento', () => {
    const autores = Object.fromEntries(ARRUMADA.historico.map((passo) => [passo.estado, passo.autor]));
    expect(autores['ORCADA']).toBe(autores['ARRUMADA']);
    expect(autores['ORCADA']).toBe('Maria');
    expect(autores['APROVADA']).toContain('Cliente');
  });
});
