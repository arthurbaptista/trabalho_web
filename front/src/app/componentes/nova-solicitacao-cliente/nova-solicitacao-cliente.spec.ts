import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { CategoriaService } from '../../categoria/categoria.service';
import { SolicitacaoService } from '../../cliente/solicitacao.service';
import { NovaSolicitacaoCliente } from './nova-solicitacao-cliente';

describe('NovaSolicitacaoCliente', () => {
  let component: NovaSolicitacaoCliente;
  let fixture: ComponentFixture<NovaSolicitacaoCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovaSolicitacaoCliente],
      providers: [
        provideHttpClient(),
        {
          provide: CategoriaService,
          useValue: {
            listar: () => of([{ id: 1, nome: 'Notebook', status: true }]),
          },
        },
        {
          provide: SolicitacaoService,
          useValue: {
            criar: () => of({
              id: 99,
              dataHoraAbertura: '2026-09-10T22:00:00',
              descricaoEquipamento: 'Macbook',
              categoria: 'Notebook',
              estado: 'ABERTA',
              valorOrcamento: null,
            }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NovaSolicitacaoCliente);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('aberto', true);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('nao confirma sem preencher os campos', () => {
    let emitiu = false;
    component.criou.subscribe(() => {
      emitiu = true;
    });
    component.confirmar();
    expect(component.attemptedSubmit).toBe(true);
    expect(emitiu).toBe(false);
  });
});
