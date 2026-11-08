import { HttpRequest, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { API_URL } from '../../core/api';
import { Auth } from '../../core/auth';
import { RelatorioService } from './relatorio.service';

const RELATORIO = {
  linhas: [{ chave: '2026-03-01', rotulo: '01/03/2026', quantidade: 2, total: 150 }],
  quantidade: 2,
  total: 150,
};

describe('RelatorioService', () => {
  let service: RelatorioService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: Auth,
          useValue: {
            headers: () => ({ headers: { Authorization: 'Bearer token-teste' } }),
          },
        },
      ],
    });

    service = TestBed.inject(RelatorioService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('porPeriodo sem datas chama GET /relatorios/receitas', async () => {
    const promessa = firstValueFrom(service.porPeriodo());

    const req = http.expectOne(rota('GET', `${API_URL}/relatorios/receitas`));
    expect(req.request.method).toBe('GET');
    expect(req.request.params.has('dataInicio')).toBe(false);
    expect(req.request.params.has('dataFim')).toBe(false);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-teste');
    req.flush(RELATORIO);

    await expect(promessa).resolves.toEqual(RELATORIO);
  });

  it('porPeriodo com datas envia dataInicio e dataFim', async () => {
    const promessa = firstValueFrom(service.porPeriodo('2026-03-01', '2026-03-31'));

    const req = http.expectOne(rota('GET', `${API_URL}/relatorios/receitas`));
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('dataInicio')).toBe('2026-03-01');
    expect(req.request.params.get('dataFim')).toBe('2026-03-31');
    req.flush(RELATORIO);

    await expect(promessa).resolves.toEqual(RELATORIO);
  });

  it('porCategoria chama GET /relatorios/receitas-categoria', async () => {
    const promessa = firstValueFrom(service.porCategoria());

    const req = http.expectOne(rota('GET', `${API_URL}/relatorios/receitas-categoria`));
    expect(req.request.method).toBe('GET');
    req.flush(RELATORIO);

    await expect(promessa).resolves.toEqual(RELATORIO);
  });

  it('baixarPdfPeriodo sem datas chama GET /relatorios/receitas/pdf', async () => {
    const promessa = firstValueFrom(service.baixarPdfPeriodo());

    const req = http.expectOne(rota('GET', `${API_URL}/relatorios/receitas/pdf`));
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    expect(req.request.params.has('dataInicio')).toBe(false);
    expect(req.request.params.has('dataFim')).toBe(false);
    req.flush(new Blob(['%PDF'], { type: 'application/pdf' }));

    const arquivo = await promessa;
    expect(arquivo.size).toBeGreaterThan(0);
  });

  it('baixarPdfPeriodo chama GET /relatorios/receitas/pdf', async () => {
    const promessa = firstValueFrom(service.baixarPdfPeriodo('2026-03-01', '2026-03-31'));

    const req = http.expectOne(rota('GET', `${API_URL}/relatorios/receitas/pdf`));
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    expect(req.request.params.get('dataInicio')).toBe('2026-03-01');
    expect(req.request.params.get('dataFim')).toBe('2026-03-31');
    req.flush(new Blob(['%PDF'], { type: 'application/pdf' }));

    const arquivo = await promessa;
    expect(arquivo.size).toBeGreaterThan(0);
  });

  it('baixarPdfCategoria chama GET /relatorios/receitas-categoria/pdf', async () => {
    const promessa = firstValueFrom(service.baixarPdfCategoria());

    const req = http.expectOne(rota('GET', `${API_URL}/relatorios/receitas-categoria/pdf`));
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob(['%PDF'], { type: 'application/pdf' }));

    const arquivo = await promessa;
    expect(arquivo instanceof Blob).toBe(true);
  });
});

function rota(metodo: string, url: string) {
  return (pedido: HttpRequest<unknown>) =>
    pedido.method === metodo && pedido.url.split('?')[0] === url;
}
