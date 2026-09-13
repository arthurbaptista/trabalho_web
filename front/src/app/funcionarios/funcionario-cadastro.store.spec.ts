import {
  autenticarFuncionario,
  criarFuncionarioCadastro,
  listarFuncionariosCadastro,
  removerFuncionarioCadastro,
  resetarFuncionariosCadastro,
} from './funcionario-cadastro.store';

describe('FuncionarioCadastroStore', () => {
  beforeEach(() => {
    resetarFuncionariosCadastro();
  });

  it('inicia com Maria e Mario', () => {
    expect(listarFuncionariosCadastro().map((item) => item.nome)).toEqual(['Maria', 'Mario']);
  });

  it('nao remove o funcionario logado', () => {
    expect(() => removerFuncionarioCadastro(1, 'maria@manutencao.com')).toThrowError(/si mesmo/);
    expect(listarFuncionariosCadastro()).toHaveLength(2);
  });

  it('nao remove o unico funcionario restante', () => {
    removerFuncionarioCadastro(2, 'maria@manutencao.com');
    expect(listarFuncionariosCadastro()).toHaveLength(1);
    expect(() => removerFuncionarioCadastro(1, 'outra@manutencao.com')).toThrowError(/unico funcionario/);
  });

  it('cadastra funcionario autenticavel', () => {
    const criado = criarFuncionarioCadastro({
      nome: 'Marta',
      email: 'marta@manutencao.com',
      dataNascimento: '1990-01-10',
      senha: 'abcd',
    });
    expect(criado.id).toBeGreaterThan(2);
    expect(autenticarFuncionario('marta@manutencao.com', 'abcd')?.nome).toBe('Marta');
  });
});
