import { autenticarFuncionario, emailFuncionarioExiste } from '../funcionarios/funcionario-cadastro.store';

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

function todosClientesDemo(): UsuarioDemo[] {
  return [
    ...USUARIOS_DEMO.filter((usuario) => usuario.perfil === 'CLIENTE'),
    ...lerClientesDemo(),
  ];
}

export function emailClienteDemoExiste(email: string): boolean {
  const emailNorm = email.trim().toLowerCase();
  return todosClientesDemo().some((usuario) => usuario.email.toLowerCase() === emailNorm);
}

export function buscarUsuarioDemo(email: string, senha: string): UsuarioDemo | undefined {
  const emailNorm = email.trim().toLowerCase();
  const funcionario = autenticarFuncionario(emailNorm, senha);
  if (funcionario) {
    return {
      nome: funcionario.nome,
      email: funcionario.email,
      senha: funcionario.senha,
      perfil: 'FUNCIONARIO',
    };
  }

  return todosClientesDemo().find(
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

  if (todosClientesDemo().some((usuario) => usuario.email.toLowerCase() === email)
    || emailFuncionarioExiste(email)) {
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

/*
 * ====================================================================================================
 * DOCUMENTAÇÃO COMPLEMENTAR DA APLICAÇÃO DE DEMONSTRAÇÃO (MÓDULO DE USUÁRIOS & AUTENTICAÇÃO)
 * ====================================================================================================
 *
 * 1. PROPÓSITO DO MÓDULO:
 *    Este arquivo atua como uma camada simulada (mock) para o gerenciamento de autenticação e cadastro de
 *    usuários no sistema. Ele resolve a necessidade de ter uma aplicação funcional no frontend sem a
 *    dependência imediata de um serviço de backend ou banco de dados relacional ativo.
 *
 * 2. ARQUITETURA DE DADOS E PERFIS:
 *    A aplicação trabalha com dois tipos distintos de acessos definidos pelo tipo 'PerfilDemo':
 *    - FUNCIONARIO: Usuários administrativos pré-definidos armazenados na store dedicada de funcionários.
 *    - CLIENTE: Usuários finais do sistema, que contam com um mix de dados estáticos pré-carregados e
 *      registros dinâmicos gerados durante o uso da plataforma.
 *
 * 3. PERSISTÊNCIA LOCAL (localStorage):
 *    Para manter o estado da aplicação entre atualizações de página, os novos clientes cadastrados são
 *    serializados em formato JSON e salvos na chave 'clientes_demo'. O uso de 'globalThis.localStorage'
 *    com encadeamento opcional (?.) e blocos try/catch assegura resiliência contra falhas em ambientes
 *    Node.js, testes unitários sem window ou contextos de renderização no servidor (SSR).
 *
 * 4. REGRAS DE NEGÓCIO E VALIDAÇÕES IMPLEMENTADAS:
 *    - Normalização de Strings: Todos os e-mails são processados com '.trim().toLowerCase()' para garantir
 *      que buscas e cadastros sejam 'case-insensitive' e insensíveis a espaços acidentais.
 *    - Higienização do CPF: A expressão regular '/\D/g' remove toda a formatação (pontos e traços),
 *      garantindo que apenas dígitos numéricos sejam comparados e salvos.
 *    - Unicidade Cross-Entity: O e-mail de um novo cliente é checado contra a base de clientes (estáticos
 *      e dinâmicos) e também contra a base de funcionários ('emailFuncionarioExiste'), impedindo colisões.
 *    - Unicidade de CPF: Impede que o mesmo documento seja utilizado em mais de uma conta no storage local.
 *    - Autenticação Priorizada: 'buscarUsuarioDemo' checa primeiro a base de funcionários para conceder
 *      acesso administrativo e, caso não localize, busca entre os clientes cadastrados.
 *
 * 5. GERADORES DE DADOS DINÂMICOS:
 *    - Senhas: As senhas de novos clientes são geradas aleatoriamente com 4 dígitos numéricos, formatadas
 *      via 'padStart(4, '0')' para garantir a integridade de valores com zeros à esquerda (ex: '0042').
 *    - Identificadores: O ID do cliente gerado no cadastro utiliza o timestamp atual ('Date.now()'),
 *      fornecendo uma chave temporária única para operações em memória na interface.
 *
 * ====================================================================================================
 */
//
//
