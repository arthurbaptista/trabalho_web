import { firstValueFrom } from 'rxjs';

import { resetarFuncionariosCadastro } from './funcionario-cadastro.store';
import { FuncionarioCadastroService } from './funcionario-cadastro.service';

const CHAVE_CLIENTES_DEMO = 'clientes_demo';

describe('FuncionarioCadastroService', () => {
  let service: FuncionarioCadastroService;

  beforeEach(() => {
    resetarFuncionariosCadastro();
    localStorage.removeItem(CHAVE_CLIENTES_DEMO);
    service = new FuncionarioCadastroService();
  });

  afterEach(() => {
    resetarFuncionariosCadastro();
    localStorage.removeItem(CHAVE_CLIENTES_DEMO);
  });

  it('lista os funcionarios iniciais (Maria e Mario)', async () => {
    const lista = await firstValueFrom(service.listar());
    expect(lista.map((item) => item.nome)).toEqual(['Maria', 'Mario']);
  });

  it('listarResumo devolve apenas id, nome e email', async () => {
    const lista = await firstValueFrom(service.listarResumo());
    expect(lista[0]).toEqual({ id: 1, nome: 'Maria', email: 'maria@manutencao.com' });
    expect(Object.keys(lista[0])).toEqual(['id', 'nome', 'email']);
  });

  it('cria um novo funcionario', async () => {
    const criado = await firstValueFrom(service.criar({
      nome: 'Ana',
      email: 'ana@manutencao.com',
      dataNascimento: '1990-01-10',
      senha: 'abcd',
    }));

    expect(criado.nome).toBe('Ana');
    const lista = await firstValueFrom(service.listar());
    expect(lista).toHaveLength(3);
  });

  it('rejeita criar com e-mail ja usado por outro funcionario', async () => {
    const promise = firstValueFrom(service.criar({
      nome: 'Outra Maria',
      email: 'maria@manutencao.com',
      dataNascimento: '1990-01-10',
      senha: 'abcd',
    }));

    await expect(promise).rejects.toMatchObject({ error: expect.stringMatching(/ja esta cadastrado/) });
  });

  it('rejeita criar com e-mail ja usado por um cliente (checagem cruzada)', async () => {
    localStorage.setItem(CHAVE_CLIENTES_DEMO, JSON.stringify([
      { nome: 'Cliente Existente', email: 'cliente@manutencao.com', senha: '1234', perfil: 'CLIENTE', cpf: '11111111111' },
    ]));

    const promise = firstValueFrom(service.criar({
      nome: 'Novo Funcionario',
      email: 'cliente@manutencao.com',
      dataNascimento: '1990-01-10',
      senha: 'abcd',
    }));

    await expect(promise).rejects.toMatchObject({ error: expect.stringMatching(/ja esta cadastrado/) });
  });

  it('atualiza nome e email de um funcionario existente', async () => {
    const atualizado = await firstValueFrom(service.atualizar(1, {
      nome: 'Maria Silva',
      email: 'maria.silva@manutencao.com',
      dataNascimento: '1985-04-15',
    }));

    expect(atualizado.nome).toBe('Maria Silva');
    expect(atualizado.email).toBe('maria.silva@manutencao.com');
  });

  it('rejeita atualizar para um e-mail ja usado por outro funcionario', async () => {
    const promise = firstValueFrom(service.atualizar(1, {
      nome: 'Maria',
      email: 'mario@manutencao.com',
      dataNascimento: '1985-04-15',
    }));

    await expect(promise).rejects.toMatchObject({ error: expect.stringMatching(/ja esta cadastrado/) });
  });

  it('rejeita atualizar um funcionario inexistente', async () => {
    const promise = firstValueFrom(service.atualizar(999, {
      nome: 'Qualquer',
      email: 'qualquer@manutencao.com',
      dataNascimento: '1990-01-01',
    }));

    await expect(promise).rejects.toMatchObject({ error: expect.stringMatching(/nao encontrado/) });
  });

  it('remove um funcionario que nao e o logado', async () => {
    await firstValueFrom(service.remover(2, 'maria@manutencao.com'));
    const lista = await firstValueFrom(service.listar());
    expect(lista.map((item) => item.nome)).toEqual(['Maria']);
  });

  it('nao permite remover a si mesmo', async () => {
    const promise = firstValueFrom(service.remover(1, 'maria@manutencao.com'));
    await expect(promise).rejects.toMatchObject({ error: expect.stringMatching(/si mesmo/) });
  });

  it('nao permite remover o unico funcionario restante', async () => {
    await firstValueFrom(service.remover(2, 'maria@manutencao.com'));
    const promise = firstValueFrom(service.remover(1, 'outra@manutencao.com'));
    await expect(promise).rejects.toMatchObject({ error: expect.stringMatching(/unico funcionario/) });
  });
});
