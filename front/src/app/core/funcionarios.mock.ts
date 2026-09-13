export interface FuncionarioRegistro {
  id: number;
  nome: string;
  email: string;
  dataNascimento: string;
  status: boolean;
}

const CHAVE_FUNCIONARIOS_DEMO = 'funcionarios_demo';

const SEED: FuncionarioRegistro[] = [
  { id: 1, nome: 'Maria', email: 'maria@manutencao.com', dataNascimento: '1990-03-12', status: true },
  { id: 2, nome: 'Mario', email: 'mario@manutencao.com', dataNascimento: '1988-07-25', status: true },
];

function ler(): FuncionarioRegistro[] {
  try {
    const raw = globalThis.localStorage?.getItem(CHAVE_FUNCIONARIOS_DEMO);
    if (!raw) {
      salvar(SEED);
      return SEED;
    }
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as FuncionarioRegistro[]) : SEED;
  } catch {
    return SEED;
  }
}

function salvar(lista: FuncionarioRegistro[]) {
  globalThis.localStorage?.setItem(CHAVE_FUNCIONARIOS_DEMO, JSON.stringify(lista));
}

export function listarFuncionariosDemo(): FuncionarioRegistro[] {
  return ler()
    .filter((item) => item.status)
    .sort((a, b) => a.nome.localeCompare(b.nome));
}

export function criarFuncionarioDemo(dados: { nome: string; email: string; dataNascimento: string }): FuncionarioRegistro {
  const lista = ler();
  const email = dados.email.trim().toLowerCase();

  if (lista.some((item) => item.status && item.email.toLowerCase() === email)) {
    throw new Error('Erro: O e-mail informado ja esta cadastrado.');
  }

  const novo: FuncionarioRegistro = {
    id: Date.now(),
    nome: dados.nome.trim(),
    email,
    dataNascimento: dados.dataNascimento,
    status: true,
  };
  lista.push(novo);
  salvar(lista);
  return novo;
}

export function atualizarFuncionarioDemo(
  id: number,
  dados: { nome: string; email: string; dataNascimento: string },
): FuncionarioRegistro {
  const lista = ler();
  const email = dados.email.trim().toLowerCase();

  if (lista.some((item) => item.status && item.email.toLowerCase() === email && item.id !== id)) {
    throw new Error('Erro: O e-mail informado ja esta cadastrado.');
  }

  const indice = lista.findIndex((item) => item.id === id);
  if (indice < 0) {
    throw new Error('Erro: Funcionario nao encontrado.');
  }

  lista[indice] = {
    ...lista[indice],
    nome: dados.nome.trim(),
    email,
    dataNascimento: dados.dataNascimento,
  };
  salvar(lista);
  return lista[indice];
}

export function desativarFuncionarioDemo(id: number, nomeLogado: string): void {
  const lista = ler();
  const alvo = lista.find((item) => item.id === id);
  if (!alvo) {
    throw new Error('Erro: Funcionario nao encontrado.');
  }

  if (alvo.nome.trim().toLowerCase() === nomeLogado.trim().toLowerCase()) {
    throw new Error('Erro: Voce nao pode remover a si mesmo.');
  }

  const ativos = lista.filter((item) => item.status);
  if (ativos.length <= 1) {
    throw new Error('Erro: Deve haver pelo menos um funcionario ativo.');
  }

  alvo.status = false;
  salvar(lista);
}
