import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { SolicitacaoService } from '../../cliente/solicitacao.service';
import { DetalheSolicitacaoCliente } from './detalhe-solicitacao-cliente';

const DETALHE = {
  id: 9,
  dataHoraAbertura: '2026-02-19T19:47:00',
  descricaoEquipamento: 'ASUS ROG Zephyrus',
  categoria: 'Notebook',
  estado: 'ORCADA',
  valorOrcamento: 1250,
  descricaoDefeito: 'Superaquecimento em jogos.',
  historico: [
    { estado: 'ABERTA', dataHora: '2026-02-19T19:47:00', autor: 'Cliente' },
    { estado: 'ORCADA', dataHora: '2026-02-20T03:47:00', autor: 'Maria' },
  ],
};

describe('DetalheSolicitacaoCliente', () => {
  let component: DetalheSolicitacaoCliente;
  let fixture: ComponentFixture<DetalheSolicitacaoCliente>;
  const idsAprovados: number[] = [];

  beforeEach(async () => {
    idsAprovados.length = 0;

    await TestBed.configureTestingModule({
      imports: [DetalheSolicitacaoCliente],
      providers: [
        provideHttpClient(),
        {
          provide: SolicitacaoService,
          useValue: {
            detalhar: () => of(DETALHE),
            aprovar: (id: number) => {
              idsAprovados.push(id);
              return of({ ...DETALHE, estado: 'APROVADA' });
            },
            rejeitar: () => of({ ...DETALHE, estado: 'REJEITADA' }),
            resgatar: () => of({ ...DETALHE, estado: 'APROVADA' }),
            pagar: () => of({ ...DETALHE, estado: 'PAGA' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalheSolicitacaoCliente);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('aberto', true);
    fixture.componentRef.setInput('solicitacao', DETALHE);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('aprova o orcamento e mostra a mensagem de sucesso', () => {
    component.detalhe.set(DETALHE);
    component.aprovar();
    expect(idsAprovados).toEqual([9]);
    expect(component.mensagem()).toBe('aprovado');
  });
});
