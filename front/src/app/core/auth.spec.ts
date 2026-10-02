import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { API_URL } from './api';
import { Auth } from './auth';

describe('Auth', () => {
  let auth: Auth;
  let http: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });

    auth = TestBed.inject(Auth);
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('comeca deslogado quando nao ha sessao salva', () => {
    expect(auth.estaLogado()).toBe(false);
    expect(auth.sessao()).toBeNull();
  });

  it('faz login com o backend real e guarda a sessao', async () => {
    const promise = firstValueFrom(auth.login('joao@manutencao.com', '1234', true));

    const req = http.expectOne(`${API_URL}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({ token: 'abc123', tipo: 'Bearer', perfil: 'CLIENTE', nome: 'Joao' });

    await promise;
    expect(auth.estaLogado()).toBe(true);
    expect(auth.sessao()).toEqual({ token: 'abc123', perfil: 'CLIENTE', nome: 'Joao', email: 'joao@manutencao.com' });
  });

  it('guarda a sessao em localStorage quando persistente=true e em sessionStorage quando false', async () => {
    const promise1 = firstValueFrom(auth.login('joao@manutencao.com', '1234', true));
    http.expectOne(`${API_URL}/auth/login`).flush({ token: 't', tipo: 'Bearer', perfil: 'CLIENTE', nome: 'Joao' });
    await promise1;
    expect(localStorage.getItem('auth')).not.toBeNull();
    expect(sessionStorage.getItem('auth')).toBeNull();

    const promise2 = firstValueFrom(auth.login('joao@manutencao.com', '1234', false));
    http.expectOne(`${API_URL}/auth/login`).flush({ token: 't2', tipo: 'Bearer', perfil: 'CLIENTE', nome: 'Joao' });
    await promise2;
    expect(sessionStorage.getItem('auth')).not.toBeNull();
    expect(localStorage.getItem('auth')).toBeNull();
  });

  it('propaga erro de credenciais invalidas quando o backend esta disponivel', async () => {
    const promise = firstValueFrom(auth.login('joao@manutencao.com', 'errada', true));
    const req = http.expectOne(`${API_URL}/auth/login`);
    req.flush({ error: 'Email ou senha invalidos' }, { status: 400, statusText: 'Bad Request' });

    await expect(promise).rejects.toBeTruthy();
    expect(auth.estaLogado()).toBe(false);
  });

  it('cai para o login de demonstracao quando o backend esta fora do ar', async () => {
    const promise = firstValueFrom(auth.login('joao@manutencao.com', '1234', true));
    const req = http.expectOne(`${API_URL}/auth/login`);
    req.error(new ProgressEvent('error'), { status: 0, statusText: 'offline' });

    const resposta = await promise;
    expect(resposta.perfil).toBe('CLIENTE');
    expect(resposta.nome).toBe('Joao');
    expect(auth.estaLogado()).toBe(true);
  });

  it('rejeita login de demonstracao com credenciais que nao existem', async () => {
    const promise = firstValueFrom(auth.login('ninguem@manutencao.com', 'x', true));
    const req = http.expectOne(`${API_URL}/auth/login`);
    req.error(new ProgressEvent('error'), { status: 0, statusText: 'offline' });

    await expect(promise).rejects.toMatchObject({ error: expect.stringMatching(/invalidos/) });
    expect(auth.estaLogado()).toBe(false);
  });

  it('ativarSessaoDemo loga como Joao (cliente) sem precisar de senha', () => {
    auth.ativarSessaoDemo();
    expect(auth.estaLogado()).toBe(true);
    expect(auth.sessao()?.perfil).toBe('CLIENTE');
  });

  it('ativarSessaoDemo nao sobrescreve uma sessao ja existente', () => {
    auth.ativarSessaoDemo();
    const primeira = auth.sessao();
    auth.ativarSessaoDemo();
    expect(auth.sessao()).toEqual(primeira);
  });

  it('rotaInicial aponta para /funcionario ou /cliente conforme o perfil', async () => {
    const promise = firstValueFrom(auth.login('joao@manutencao.com', '1234', true));
    http.expectOne(`${API_URL}/auth/login`).flush({ token: 't', tipo: 'Bearer', perfil: 'CLIENTE', nome: 'Joao' });
    await promise;
    expect(auth.rotaInicial()).toBe('/cliente');
  });

  it('headers() inclui Authorization quando ha token, e fica vazio quando nao ha sessao', async () => {
    expect(auth.headers()).toEqual({});

    const promise = firstValueFrom(auth.login('joao@manutencao.com', '1234', true));
    http.expectOne(`${API_URL}/auth/login`).flush({ token: 'meu-token', tipo: 'Bearer', perfil: 'CLIENTE', nome: 'Joao' });
    await promise;

    expect(auth.headers()).toEqual({ headers: { Authorization: 'Bearer meu-token' } });
  });

  it('logout limpa a sessao e navega para /login', async () => {
    const promise = firstValueFrom(auth.login('joao@manutencao.com', '1234', true));
    http.expectOne(`${API_URL}/auth/login`).flush({ token: 't', tipo: 'Bearer', perfil: 'CLIENTE', nome: 'Joao' });
    await promise;

    const navegarSpy = vi.spyOn(router, 'navigateByUrl');
    auth.logout();

    expect(auth.estaLogado()).toBe(false);
    expect(localStorage.getItem('auth')).toBeNull();
    expect(navegarSpy).toHaveBeenCalledWith('/login');
  });

  it('atualizarPerfil troca nome e email da sessao atual', async () => {
    const promise = firstValueFrom(auth.login('joao@manutencao.com', '1234', true));
    http.expectOne(`${API_URL}/auth/login`).flush({ token: 't', tipo: 'Bearer', perfil: 'CLIENTE', nome: 'Joao' });
    await promise;

    auth.atualizarPerfil('Joao Silva', 'joao.silva@manutencao.com');

    expect(auth.sessao()?.nome).toBe('Joao Silva');
    expect(auth.sessao()?.email).toBe('joao.silva@manutencao.com');
  });

  it('cadastrar cai para o cadastro de demonstracao quando o backend esta fora do ar', async () => {
    const promise = firstValueFrom(auth.cadastrar({
      nome: 'Nova Cliente',
      cpf: '12345678901',
      email: 'nova@manutencao.com',
      telefone: '41999999999',
      cep: '80000000',
      logradouro: 'Rua X',
      numero: '1',
      complemento: '',
      bairro: 'Centro',
      cidade: 'Curitiba',
      estado: 'PR',
    }));

    const req = http.expectOne(`${API_URL}/clientes/cadastro`);
    req.error(new ProgressEvent('error'), { status: 0, statusText: 'offline' });

    const resposta = await promise;
    expect(resposta.email).toBe('nova@manutencao.com');
    expect(resposta.mensagem).toContain('senha');
  });
});
