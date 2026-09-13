export interface CategoriaRegistro {
  id: number;
  nome: string;
  status: boolean;
}

const CHAVE_CATEGORIAS_DEMO = 'categorias_demo';

const SEED: CategoriaRegistro[] = [
  { id: 1, nome: 'Notebook', status: true },
  { id: 2, nome: 'Desktop', status: true },
  { id: 3, nome: 'Impressora', status: true },
  { id: 4, nome: 'Mouse', status: true },
  { id: 5, nome: 'Teclado', status: true },
];

function ler(): CategoriaRegistro[] {
  try {
    const raw = globalThis.localStorage?.getItem(CHAVE_CATEGORIAS_DEMO);
    if (!raw) {
      salvar(SEED);
      return SEED;
    }
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as CategoriaRegistro[]) : SEED;
  } catch {
    return SEED;
  }
}

function salvar(lista: CategoriaRegistro[]) {
  globalThis.localStorage?.setItem(CHAVE_CATEGORIAS_DEMO, JSON.stringify(lista));
}

export function listarCategoriasDemo(): CategoriaRegistro[] {
  return ler()
    .filter((item) => item.status)
    .sort((a, b) => a.nome.localeCompare(b.nome));
}

export function criarCategoriaDemo(nome: string): CategoriaRegistro {
  const lista = ler();
  const nomeNormalizado = nome.trim();

  if (lista.some((item) => item.status && item.nome.toLowerCase() === nomeNormalizado.toLowerCase())) {
    throw new Error('Erro: Ja existe uma categoria com esse nome.');
  }

  const nova: CategoriaRegistro = { id: Date.now(), nome: nomeNormalizado, status: true };
  lista.push(nova);
  salvar(lista);
  return nova;
}

export function atualizarCategoriaDemo(id: number, nome: string): CategoriaRegistro {
  const lista = ler();
  const nomeNormalizado = nome.trim();

  if (lista.some((item) => item.status && item.id !== id && item.nome.toLowerCase() === nomeNormalizado.toLowerCase())) {
    throw new Error('Erro: Ja existe uma categoria com esse nome.');
  }

  const indice = lista.findIndex((item) => item.id === id);
  if (indice < 0) {
    throw new Error('Erro: Categoria nao encontrada.');
  }

  lista[indice] = { ...lista[indice], nome: nomeNormalizado };
  salvar(lista);
  return lista[indice];
}

export function desativarCategoriaDemo(id: number): void {
  const lista = ler();
  const alvo = lista.find((item) => item.id === id);
  if (!alvo) {
    throw new Error('Erro: Categoria nao encontrada.');
  }

  alvo.status = false;
  salvar(lista);
}
