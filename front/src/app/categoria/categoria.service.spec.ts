import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { API_URL } from '../core/api';
import { Auth } from '../core/auth';
import { CATEGORIAS_INICIAIS } from './categoria.mock';
import { CategoriaService } from './categoria.service';

const CHAVE_LOCALSTORAGE = 'categorias_demo';

describe('CategoriaService', () => {
  let service: CategoriaService;
  let http: HttpTestingController;

  beforeEach(() => {
    // O service le o localStorage no momento em que e construido (no campo
    // `itens`), entao precisa estar limpo ANTES do TestBed.inject criar a
    // instancia - senao um teste anterior contamina o proximo.
    localStorage.removeItem(CHAVE_LOCALSTORAGE);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Auth, useValue: { sessao: () => null } },
      ],
    });

    service = TestBed.inject(CategoriaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.removeItem(CHAVE_LOCALSTORAGE);
  });

  // Todo teste aqui precisa derrubar a chamada HTTP real (o backend nao esta
  // disponivel no ambiente de teste) para forcar o service a cair no
  // fallback local - e la que mora a logica que interessa testar.
  function falharRequisicao(metodo: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string) {
    const req = http.expectOne((r) => r.method === metodo && r.url === url);
    req.error(new ProgressEvent('error'), { status: 0, statusText: 'offline' });
  }

  it('lista as categorias iniciais quando o backend nao responde', async () => {
    const promise = firstValueFrom(service.listar());
    falharRequisicao('GET', `${API_URL}/categorias`);

    const lista = await promise;
    expect(lista.map((item) => item.nome).sort()).toEqual(
      CATEGORIAS_INICIAIS.map((item) => item.nome).sort(),
    );
  });

  it('cria uma categoria nova via fallback local', async () => {
    const promise = firstValueFrom(service.criar('Microfone'));
    falharRequisicao('POST', `${API_URL}/categorias`);

    const criada = await promise;
    expect(criada.nome).toBe('Microfone');
    expect(criada.status).toBe(true);
    // id deve ser maior que qualquer id ja existente na massa inicial
    expect(criada.id).toBeGreaterThan(Math.max(...CATEGORIAS_INICIAIS.map((item) => item.id)));
  });

  it('rejeita criar uma categoria com nome ja cadastrado (case-insensitive)', async () => {
    const promise = firstValueFrom(service.criar('  notebook  '));
    falharRequisicao('POST', `${API_URL}/categorias`);

    await expect(promise).rejects.toMatchObject({ error: expect.stringMatching(/ja esta cadastrada/) });
  });

  it('reativa uma categoria desativada em vez de duplicar', async () => {
    const remocao = firstValueFrom(service.remover(1));
    falharRequisicao('DELETE', `${API_URL}/categorias/1`);
    await remocao;

    const criacao = firstValueFrom(service.criar('Notebook'));
    falharRequisicao('POST', `${API_URL}/categorias`);
    const reativada = await criacao;

    expect(reativada.id).toBe(1);
    expect(reativada.status).toBe(true);

    const listagem = firstValueFrom(service.listar());
    falharRequisicao('GET', `${API_URL}/categorias`);
    const lista = await listagem;
    expect(lista.filter((item) => item.nome === 'Notebook')).toHaveLength(1);
  });

  it('atualiza o nome de uma categoria existente', async () => {
    const promise = firstValueFrom(service.atualizar(2, 'Desktop Gamer'));
    falharRequisicao('PUT', `${API_URL}/categorias/2`);

    const atualizada = await promise;
    expect(atualizada.id).toBe(2);
    expect(atualizada.nome).toBe('Desktop Gamer');
  });

  it('rejeita atualizar para um nome ja usado por outra categoria ativa', async () => {
    const promise = firstValueFrom(service.atualizar(2, 'Notebook'));
    falharRequisicao('PUT', `${API_URL}/categorias/2`);

    await expect(promise).rejects.toMatchObject({ error: expect.stringMatching(/ja esta cadastrada/) });
  });

  it('rejeita atualizar uma categoria inexistente', async () => {
    const promise = firstValueFrom(service.atualizar(999, 'Qualquer'));
    falharRequisicao('PUT', `${API_URL}/categorias/999`);

    await expect(promise).rejects.toMatchObject({ error: expect.stringMatching(/nao encontrada/) });
  });

  it('desativa (soft delete) uma categoria em vez de apagar', async () => {
    const remocao = firstValueFrom(service.remover(3));
    falharRequisicao('DELETE', `${API_URL}/categorias/3`);
    await remocao;

    const listagem = firstValueFrom(service.listar());
    falharRequisicao('GET', `${API_URL}/categorias`);
    const lista = await listagem;

    expect(lista.some((item) => item.id === 3)).toBe(false);
  });

  it('rejeita remover uma categoria que ja foi removida', async () => {
    const primeira = firstValueFrom(service.remover(4));
    falharRequisicao('DELETE', `${API_URL}/categorias/4`);
    await primeira;

    const segunda = firstValueFrom(service.remover(4));
    falharRequisicao('DELETE', `${API_URL}/categorias/4`);
    await expect(segunda).rejects.toMatchObject({ error: expect.stringMatching(/nao encontrada/) });
  });

  it('persiste as mudancas no localStorage entre instancias do service', async () => {
    const promise = firstValueFrom(service.criar('Roteador'));
    falharRequisicao('POST', `${API_URL}/categorias`);
    await promise;

    // Simula um "reload da pagina": recria o TestBed para forcar uma nova
    // instancia de CategoriaService, que le o localStorage do zero.
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Auth, useValue: { sessao: () => null } },
      ],
    });
    const novoService = TestBed.inject(CategoriaService);
    const novoHttp = TestBed.inject(HttpTestingController);

    const listagem = firstValueFrom(novoService.listar());
    const req = novoHttp.expectOne((r) => r.method === 'GET' && r.url === `${API_URL}/categorias`);
    req.error(new ProgressEvent('error'), { status: 0, statusText: 'offline' });

    const lista = await listagem;
    expect(lista.some((item) => item.nome === 'Roteador')).toBe(true);
    novoHttp.verify();
  });
});
