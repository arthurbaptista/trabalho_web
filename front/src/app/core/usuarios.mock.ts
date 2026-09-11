export type PerfilDemo = 'CLIENTE' | 'FUNCIONARIO';

export interface UsuarioDemo {
  nome: string;
  email: string;
  senha: string;
  perfil: PerfilDemo;
  cpf?: string;
}

export const USUARIOS_DEMO: UsuarioDemo[] = [
  { nome: 'Maria', email: 'maria@manutencao.com', senha: '1234', perfil: 'FUNCIONARIO' },
  { nome: 'Mario', email: 'mario@manutencao.com', senha: '1234', perfil: 'FUNCIONARIO' },
  { nome: 'Joao', email: 'joao@manutencao.com', senha: '1234', perfil: 'CLIENTE' },
  { nome: 'Jose', email: 'jose@manutencao.com', senha: '1234', perfil: 'CLIENTE' },
  { nome: 'Joana', email: 'joana@manutencao.com', senha: '1234', perfil: 'CLIENTE' },
  { nome: 'Joaquina', email: 'joaquina@manutencao.com', senha: '1234', perfil: 'CLIENTE' },
];

const CHAVE_CLIENTES_DEMO = 'clientes_demo';

function lerClientesDemo(): UsuarioDemo[] {
  try {
    const raw = globalThis.localStorage?.getItem(CHAVE_CLIENTES_DEMO);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed as UsuarioDemo[] : [];
  } catch {
    return [];
  }
}

function todosUsuariosDemo(): UsuarioDemo[] {
  return [...USUARIOS_DEMO, ...lerClientesDemo()];
}

export function buscarUsuarioDemo(email: string, senha: string): UsuarioDemo | undefined {
  const emailNorm = email.trim().toLowerCase();
  return todosUsuariosDemo().find(
    (usuario) => usuario.email.toLowerCase() === emailNorm && usuario.senha === senha,
  );
}

export function cadastrarClienteDemo(dados: { nome: string; email: string; cpf: string }): {
  id: number;
  senha: string;
} {
  const email = dados.email.trim().toLowerCase();
  const cpf = dados.cpf.replace(/\D/g, '');
  const existentes = lerClientesDemo();

  if (todosUsuariosDemo().some((usuario) => usuario.email.toLowerCase() === email)) {
    throw new Error('Erro: O E-mail informado ja esta cadastrado.');
  }
  if (existentes.some((usuario) => usuario.cpf === cpf)) {
    throw new Error('Erro: O CPF informado ja esta cadastrado.');
  }

  const senha = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  existentes.push({
    nome: dados.nome.trim(),
    email,
    senha,
    cpf,
    perfil: 'CLIENTE',
  });
  globalThis.localStorage?.setItem(CHAVE_CLIENTES_DEMO, JSON.stringify(existentes));

  return { id: Date.now(), senha };
}
