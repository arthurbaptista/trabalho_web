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

// =============================================================================
// Comentarios de codigo deste modulo de usuarios demo (90 linhas)
// =============================================================================
// 01. Este arquivo simula usuarios para login e cadastro sem API real.
// 02. PerfilDemo define os dois papeis aceitos: CLIENTE e FUNCIONARIO.
// 03. UsuarioDemo descreve nome, email, senha, perfil e CPF opcional.
// 04. USUARIOS_DEMO guarda a lista inicial usada nos testes da interface.
// 05. Maria e Mario entram como funcionarios com senha 1234.
// 06. Joao, Jose, Joana e Joaquina entram como clientes com senha 1234.
// 07. CHAVE_CLIENTES_DEMO e a chave do localStorage para clientes novos.
// 08. lerClientesDemo le e interpreta o JSON salvo no navegador.
// 09. Se o storage estiver vazio, lerClientesDemo devolve lista vazia.
// 10. Se o JSON for invalido, o catch evita quebrar a aplicacao.
// 11. todosClientesDemo junta clientes fixos com clientes persistidos.
// 12. emailClienteDemoExiste compara e-mail ignorando maiusculas.
// 13. buscarUsuarioDemo tenta funcionario antes de cliente.
// 14. autenticarFuncionario vem do store de cadastro de funcionarios.
// 15. Se o funcionario existir, o retorno usa perfil FUNCIONARIO.
// 16. Se nao existir, a busca continua nos clientes demo.
// 17. A senha do cliente precisa ser exatamente igual a gravada.
// 18. cadastrarClienteDemo recebe nome, email e cpf do formulario.
// 19. O e-mail cadastrado e normalizado com trim e toLowerCase.
// 20. O CPF cadastrado perde pontuacao e fica so com digitos.
// 21. E-mail de cliente duplicado gera erro de cadastro.
// 22. E-mail de funcionario duplicado tambem gera erro de cadastro.
// 23. CPF duplicado entre clientes persistidos gera erro de cadastro.
// 24. A senha nova e um numero de 0 a 9999, com 4 digitos.
// 25. padStart preenche a senha com zeros a esquerda quando preciso.
// 26. O cliente novo e inserido no array lido do localStorage.
// 27. Depois da insercao, o array e gravado de volta no storage.
// 28. O id devolvido e Date.now, suficiente para a demonstracao.
// 29. Este modulo nao cifra senha e nao deve ir para producao.
// 30. Substitua estas funcoes por chamadas HTTP quando a API existir.
// 31. Login de funcionario: maria@manutencao.com / 1234.
// 32. Login de funcionario: mario@manutencao.com / 1234.
// 33. Login de cliente: joao@manutencao.com / 1234.
// 34. Login de cliente: jose@manutencao.com / 1234.
// 35. Login de cliente: joana@manutencao.com / 1234.
// 36. Login de cliente: joaquina@manutencao.com / 1234.
// 37. Clientes criados na tela de cadastro usam senha gerada na hora.
// 38. A tela de sucesso deve mostrar a senha gerada ao usuario.
// 39. Recarregar a pagina nao apaga clientes salvos no localStorage.
// 40. Limpar o storage do navegador remove os clientes cadastrados.
// 41. SSR e testes sem window.localStorage caem no optional chaining.
// 42. Array.isArray evita aceitar JSON que nao seja uma lista.
// 43. O filtro de USUARIOS_DEMO ignora funcionarios na lista de clientes.
// 44. emailFuncionarioExiste impede conflito entre os dois cadastros.
// 45. buscarUsuarioDemo devolve undefined quando as credenciais falham.
// 46. O login da home usa buscarUsuarioDemo para autenticar o usuario.
// 47. O cadastro da home usa cadastrarClienteDemo para criar a conta.
// 48. Nao ha exclusao de usuario neste arquivo.
// 49. Nao ha edicao de senha neste arquivo.
// 50. Nao ha validacao de formato de e-mail neste arquivo.
// 51. Nao ha validacao de CPF alem da unicidade entre clientes novos.
// 52. Nao ha controle de sessao, token ou expiracao neste arquivo.
// 53. O perfil CLIENTE abre e acompanha solicitacoes de manutencao.
// 54. O perfil FUNCIONARIO atende as solicitacoes na area interna.
// 55. Mantenha os e-mails mockados visiveis na documentacao do trabalho.
// 56. Evite alterar as senhas iniciais para nao quebrar o roteiro de teste.
// 57. Se adicionar usuario fixo, inclua tambem neste bloco de comentarios.
// 58. Se mudar a chave do storage, atualize CHAVE_CLIENTES_DEMO.
// 59. JSON.stringify serializa a lista antes de salvar.
// 60. JSON.parse reconstitui a lista na leitura.
// 61. O tipo unknown apos o parse forca checagem antes do cast.
// 62. UsuarioDemo e a forma unica de representar usuario neste mock.
// 63. PerfilDemo impede valores de perfil fora de CLIENTE e FUNCIONARIO.
// 64. Funcoes internas nao sao exportadas: so as tres funcoes publicas.
// 65. Funcoes publicas: emailClienteDemoExiste, buscarUsuarioDemo, cadastrarClienteDemo.
// 66. emailClienteDemoExiste serve para validar o formulario de cadastro.
// 67. buscarUsuarioDemo serve para validar o formulario de login.
// 68. cadastrarClienteDemo serve para gravar o novo cliente demo.
// 69. O retorno de cadastro traz id numerico e senha em texto.
// 70. Erros de cadastro usam mensagens em portugues para a interface.
// 71. Mensagem de e-mail: O E-mail informado ja esta cadastrado.
// 72. Mensagem de CPF: O CPF informado ja esta cadastrado.
// 73. Math.random nao e criptograficamente seguro; serve so para demo.
// 74. Math.floor reduz o numero aleatorio para inteiro.
// 75. String converte a senha numerica para texto de 4 caracteres.
// 76. dados.nome.trim remove espacos extras do nome informado.
// 77. existentes.push adiciona o cliente no fim da lista persistida.
// 78. globalThis permite acessar localStorage no contexto do browser.
// 79. O operador ?. evita excecao se localStorage nao existir.
// 80. Este comentario fecha o roteiro de uso do mock de usuarios.
// 81. Fluxo login: normaliza e-mail, testa funcionario, testa cliente.
// 82. Fluxo cadastro: normaliza dados, valida duplicidade, grava storage.
// 83. Fluxo leitura: getItem, parse, valida array, devolve lista.
// 84. Fluxo uniao: clientes fixos + clientes persistidos.
// =============================================================================
// Fim dos comentarios de codigo (90 linhas)
// =============================================================================

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

