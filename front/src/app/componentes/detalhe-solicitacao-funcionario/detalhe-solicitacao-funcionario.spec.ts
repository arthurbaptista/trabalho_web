import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Auth } from '../../core/auth';
import { SOLICITACOES_FUNCIONARIO_DEMO } from '../../funcionario/funcionario.mock';
import { FuncionarioService } from '../../funcionario/funcionario.service';
import { DetalheSolicitacaoFuncionario } from './detalhe-solicitacao-funcionario';

describe('DetalheSolicitacaoFuncionario', () => {
  let component: DetalheSolicitacaoFuncionario;
  let fixture: ComponentFixture<DetalheSolicitacaoFuncionario>;
  const idsOrcados: number[] = [];

  beforeEach(async () => {
    idsOrcados.length = 0;
    const aberta = SOLICITACOES_FUNCIONARIO_DEMO.find((item) => item.estado === 'ABERTA')!;

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
            detalhar: () => of(aberta),
            listarFuncionarios: () => of([
              { id: 1, nome: 'Maria', email: 'maria@manutencao.com' },
              { id: 2, nome: 'Mario', email: 'mario@manutencao.com' },
            ]),
            efetuarOrcamento: (id: number, valor: number) => {
              idsOrcados.push(id);
              return of({ ...aberta, estado: 'ORCADA', valorOrcamento: valor });
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalheSolicitacaoFuncionario);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('aberto', true);
    fixture.componentRef.setInput('solicitacao', aberta);
    fixture.componentRef.setInput('modo', 'orcamento');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('nao registra orcamento sem valor', () => {
    component.detalhe.set(SOLICITACOES_FUNCIONARIO_DEMO.find((item) => item.estado === 'ABERTA')!);
    component.valorTexto = '';
    component.confirmarOrcamento();
    expect(idsOrcados).toEqual([]);
    expect(component.tentativa).toBe(true);
  });

  it('mostra Cliente e o nome no historico', () => {
    const aberta = SOLICITACOES_FUNCIONARIO_DEMO.find((item) => item.estado === 'ABERTA')!;
    component.detalhe.set(aberta);
    expect(component.autorDoPasso('Cliente')).toBe(`Cliente ${aberta.cliente.nome}`);
  });

  it('mostra o mesmo funcionario no orcamento e na manutencao quando nao houve redirecionamento', () => {
    const arrumada = SOLICITACOES_FUNCIONARIO_DEMO.find((item) => item.estado === 'ARRUMADA' && !item.funcionarioDestino)!;
    const autores = Object.fromEntries(arrumada.historico.map((passo) => [passo.estado, passo.autor]));
    expect(autores['ORCADA']).toBe(autores['ARRUMADA']);
    expect(autores['ORCADA']).toBe('Maria');
    expect(autores['APROVADA']).toContain('Cliente');
  });
});
