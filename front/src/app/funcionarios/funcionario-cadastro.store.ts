export interface FuncionarioCadastro {
  id: number;
  nome: string;
  email: string;
  dataNascimento: string;
  senha: string;
}

export interface FuncionarioPayload {
  nome: string;
  email: string;
  dataNascimento: string;
  senha?: string;
}

const CHAVE = 'funcionarios_cadastro_v1';

const INICIAIS: FuncionarioCadastro[] = [
  { id: 1, nome: 'Maria', email: 'maria@manutencao.com', dataNascimento: '1985-04-15', senha: '1234' },
  { id: 2, nome: 'Mario', email: 'mario@manutencao.com', dataNascimento: '1988-11-02', senha: '1234' },
];

let cache: FuncionarioCadastro[] | null = null;

export function resetarFuncionariosCadastro() {
  cache = null;
  try {
    globalThis.localStorage?.removeItem(CHAVE);
  } catch {
    return;
  }
}

export function listarFuncionariosCadastro(): FuncionarioCadastro[] {
  return hidratar().map(clone);
}

export function autenticarFuncionario(email: string, senha: string): FuncionarioCadastro | undefined {
  const emailNorm = email.trim().toLowerCase();
  return hidratar().find((item) => item.email === emailNorm && item.senha === senha);
}

export function emailFuncionarioExiste(email: string, ignorarId?: number): boolean {
  const emailNorm = email.trim().toLowerCase();
  return hidratar().some((item) => item.email === emailNorm && item.id !== ignorarId);
}

export function criarFuncionarioCadastro(payload: FuncionarioPayload): FuncionarioCadastro {
  const dados = validar(payload, true);
  if (emailFuncionarioExiste(dados.email)) {
    throw new Error('Erro: O e-mail informado ja esta cadastrado.');
  }

  const itens = hidratar();
  const novo: FuncionarioCadastro = {
    ...dados,
    id: Math.max(0, ...itens.map((item) => item.id)) + 1,
  };
  itens.push(novo);
  gravar(itens);
  return clone(novo);
}

export function atualizarFuncionarioCadastro(id: number, payload: FuncionarioPayload): FuncionarioCadastro {
  const itens = hidratar();
  const atual = itens.find((item) => item.id === id);
  if (!atual) {
    throw new Error('Erro: Funcionario nao encontrado.');
  }

  const senhaObrigatoria = Boolean(payload.senha?.trim());
  const dados = validar({ ...payload, senha: payload.senha?.trim() || atual.senha }, senhaObrigatoria);
  if (emailFuncionarioExiste(dados.email, id)) {
    throw new Error('Erro: O e-mail informado ja esta cadastrado.');
  }

  atual.nome = dados.nome;
  atual.email = dados.email;
  atual.dataNascimento = dados.dataNascimento;
  if (payload.senha?.trim()) {
    atual.senha = dados.senha;
  }
  gravar(itens);
  return clone(atual);
}

export function removerFuncionarioCadastro(id: number, emailLogado?: string): void {
  const itens = hidratar();
  if (itens.length <= 1) {
    throw new Error('Erro: Nao e possivel remover o unico funcionario.');
  }

  const atual = itens.find((item) => item.id === id);
  if (!atual) {
    throw new Error('Erro: Funcionario nao encontrado.');
  }
  if (emailLogado && atual.email === emailLogado.trim().toLowerCase()) {
    throw new Error('Erro: Voce nao pode remover a si mesmo.');
  }

  gravar(itens.filter((item) => item.id !== id));
}

function validar(payload: FuncionarioPayload, senhaObrigatoria: boolean): FuncionarioCadastro {
  const nome = payload.nome.trim();
  const email = payload.email.trim().toLowerCase();
  const dataNascimento = payload.dataNascimento.trim();
  const senha = payload.senha?.trim() ?? '';

  if (!nome) {
    throw new Error('Informe o nome.');
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Informe um e-mail valido.');
  }
  if (!dataNascimento) {
    throw new Error('Informe a data de nascimento.');
  }
  if (dataNascimento > hojeIso()) {
    throw new Error('A data de nascimento nao pode ser futura.');
  }
  if (senhaObrigatoria && senha.length < 4) {
    throw new Error('A senha deve ter pelo menos 4 caracteres.');
  }

  return { id: 0, nome, email, dataNascimento, senha };
}

function hidratar(): FuncionarioCadastro[] {
  if (cache) {
    return cache;
  }
  try {
    const raw = globalThis.localStorage?.getItem(CHAVE);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) {
        cache = parsed as FuncionarioCadastro[];
        return cache;
      }
    }
  } catch {
    // usa a massa inicial
  }
  cache = INICIAIS.map(clone);
  return cache;
}

function gravar(itens: FuncionarioCadastro[]) {
  cache = itens;
  try {
    globalThis.localStorage?.setItem(CHAVE, JSON.stringify(itens));
  } catch {
    return;
  }
}

function hojeIso(): string {
  const hoje = new Date();
  const pad = (valor: number) => String(valor).padStart(2, '0');
  return `${hoje.getFullYear()}-${pad(hoje.getMonth() + 1)}-${pad(hoje.getDate())}`;
}

function clone(item: FuncionarioCadastro): FuncionarioCadastro {
  return { ...item };
}
