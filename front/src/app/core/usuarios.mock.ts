/**
 * usuarios.mock.ts
 *
 * Este arquivo concentra os dados e funcoes de demonstracao usados no fluxo
 * de autenticacao e cadastro de clientes enquanto o backend ainda nao esta
 * integrado. Os usuarios listados abaixo existem apenas para testes locais
 * e nao representam contas reais de producao.
 *
 * Perfis suportados:
 * - CLIENTE: usuario que abre solicitacoes de manutencao.
 * - FUNCIONARIO: usuario interno que atende as solicitacoes.
 *
 * Os funcionarios fixos (Maria e Mario) servem de ponto de partida para o
 * login interno. Os clientes fixos (Joao, Jose, Joana e Joaquina) permitem
 * exercitar o fluxo do cliente sem precisar cadastrar uma conta nova.
 *
 * Clientes criados em tempo de execucao sao persistidos no localStorage
 * sob a chave "clientes_demo". Essa persistencia e intencional para o
 * ambiente de demonstracao: o cadastro sobrevive a um reload da pagina,
 * mas nao substitui um banco de dados.
 *
 * Funcoes exportadas:
 * - emailClienteDemoExiste: verifica se um e-mail ja pertence a um cliente.
 * - buscarUsuarioDemo: autentica funcionario ou cliente com e-mail e senha.
 * - cadastrarClienteDemo: registra um novo cliente e gera senha de 4 digitos.
 *
 * Regras de cadastro:
 * 1. O e-mail nao pode coincidir com cliente existente.
 * 2. O e-mail nao pode coincidir com funcionario existente.
 * 3. O CPF nao pode coincidir com cliente ja persistido.
 * 4. A senha gerada e numerica, com quatro digitos, preenchida com zeros.
 *
 * Observacoes de implementacao:
 * - A leitura do localStorage e protegida com try/catch para evitar quebra
 *   quando o JSON estiver invalido ou o storage indisponivel (SSR/tests).
 * - O e-mail e normalizado com trim e toLowerCase antes de qualquer busca.
 * - O CPF e sanitizado removendo caracteres nao numericos.
 * - A autenticacao de funcionario tem prioridade sobre a de cliente.
 * - Este modulo e temporario e deve ser substituido por chamadas HTTP.
 *
 * Como usar no login:
 * Informe um dos e-mails mockados e a senha "1234" para entrar como
 * funcionario ou cliente. Novos clientes recebem senha aleatoria no
 * momento do cadastro; essa senha e exibida na tela de sucesso.
 *
 * Limitacoes conhecidas:
 * - Nao ha criptografia de senha.
 * - Nao ha expiracao de sessao neste arquivo.
 * - Nao ha sincronizacao entre abas alem do localStorage nativo.
 * - Nao ha validacao de formato de e-mail neste modulo.
 * - Nao ha exclusao de clientes demo a partir daqui.
 *
 * Dados iniciais de funcionario:
 * Maria  -> maria@manutencao.com  / 1234
 * Mario  -> mario@manutencao.com  / 1234
 *
 * Dados iniciais de cliente:
 * Joao     -> joao@manutencao.com     / 1234
 * Jose     -> jose@manutencao.com     / 1234
 * Joana    -> joana@manutencao.com    / 1234
 * Joaquina -> joaquina@manutencao.com / 1234
 *
 * Estrutura de UsuarioDemo:
 * nome   -> nome exibido na interface
 * email  -> identificador de login
 * senha  -> credencial em texto simples (apenas demo)
 * perfil -> CLIENTE ou FUNCIONARIO
 * cpf    -> opcional; preenchido no cadastro de cliente
 *
 * Chave de armazenamento:
 * clientes_demo
 *
 * Fluxo resumido de buscarUsuarioDemo:
 * 1. Normaliza o e-mail informado.
 * 2. Tenta autenticar como funcionario.
 * 3. Se encontrar, devolve um UsuarioDemo com perfil FUNCIONARIO.
 * 4. Caso contrario, busca nos clientes fixos e nos clientes persistidos.
 *
 * Fluxo resumido de cadastrarClienteDemo:
 * 1. Normaliza e-mail e CPF.
 * 2. Rejeita e-mail duplicado (cliente ou funcionario).
 * 3. Rejeita CPF duplicado entre clientes persistidos.
 * 4. Gera senha de quatro digitos.
 * 5. Persiste o novo cliente no localStorage.
 * 6. Retorna id (timestamp) e senha gerada.
 *
 * Fim da documentacao de demonstracao deste modulo.
 *
 * Arquivo de mock local: nao usar em producao.
 */

import { autenticarFuncionario, emailFuncionarioExiste } from '../funcionario/funcionario-gestao/funcionario-cadastro.store';

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

