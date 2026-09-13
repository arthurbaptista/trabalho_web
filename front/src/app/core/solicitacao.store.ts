import { Injectable } from '@angular/core';

import { normalizarTexto } from '../cliente/solicitacao.util';
import { clienteDemoPorNome, SOLICITACOES_FUNCIONARIO_DEMO } from '../funcionario/funcionario.mock';
import type { ClienteSolicitacao, SolicitacaoFuncionario } from '../funcionario/funcionario.models';

const CHAVE = 'solicitacoes_demo_v3';

let cacheJson: string | null = null;

const CLIENTE_PADRAO: ClienteSolicitacao = {
  id: 0,
  nome: 'Cliente',
  email: '',
  cpf: '',
  telefone: '',
  endereco: '',
};

export function resetarSolicitacaoStore() {
  cacheJson = null;
  try {
    globalThis.localStorage?.removeItem(CHAVE);
  } catch {
    return;
  }
}

@Injectable({ providedIn: 'root' })
export class SolicitacaoStore {
  private itens: SolicitacaoFuncionario[] = this.ler();

  listarTodas(): SolicitacaoFuncionario[] {
    return this.itens.map(clone);
  }

  listarDoCliente(nome: string, email?: string): SolicitacaoFuncionario[] {
    return this.itens.filter((item) => this.pertenceAoCliente(item, nome, email)).map(clone);
  }

  obter(id: number): SolicitacaoFuncionario | null {
    const item = this.itens.find((solicitacao) => solicitacao.id === id);
    return item ? clone(item) : null;
  }

  guardar(item: SolicitacaoFuncionario): SolicitacaoFuncionario {
    const copia = clone(item);
    const indice = this.itens.findIndex((solicitacao) => solicitacao.id === copia.id);
    if (indice >= 0) {
      this.itens[indice] = copia;
    } else {
      this.itens.push(copia);
    }
    this.gravar();
    return clone(copia);
  }

  clienteDaSessao(nome: string, email?: string): ClienteSolicitacao {
    const doCadastro = clienteDemoPorNome(nome, email);
    if (doCadastro) {
      return clone(doCadastro);
    }
    const existente = this.itens.find((item) => this.pertenceAoCliente(item, nome, email));
    if (existente) {
      return clone(existente.cliente);
    }
    return {
      ...CLIENTE_PADRAO,
      nome: nome.trim() || CLIENTE_PADRAO.nome,
      email: email?.trim().toLowerCase() || '',
    };
  }

  private pertenceAoCliente(item: SolicitacaoFuncionario, nome: string, email?: string): boolean {
    const emailItem = item.cliente.email.trim().toLowerCase();
    const emailSessao = email?.trim().toLowerCase() ?? '';
    if (emailSessao && emailItem && emailItem === emailSessao) {
      return true;
    }
    return Boolean(normalizarTexto(nome)) && normalizarTexto(item.cliente.nome) === normalizarTexto(nome);
  }

  private ler(): SolicitacaoFuncionario[] {
    const base = SOLICITACOES_FUNCIONARIO_DEMO.map(clone);
    const salvas = this.lerSalvas();
    if (salvas.length === 0) {
      return base;
    }
    const porId = new Map(base.map((item) => [item.id, item]));
    for (const item of salvas) {
      porId.set(item.id, item);
    }
    return [...porId.values()];
  }

  private lerSalvas(): SolicitacaoFuncionario[] {
    const raw = this.lerPersistido();
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? parsed as SolicitacaoFuncionario[] : [];
    } catch {
      return [];
    }
  }

  private lerPersistido(): string | null {
    try {
      const raw = globalThis.localStorage?.getItem(CHAVE);
      if (raw) {
        cacheJson = raw;
        return raw;
      }
    } catch {
      // usa o cache em memoria
    }
    return cacheJson;
  }

  private gravar() {
    cacheJson = JSON.stringify(this.itens);
    try {
      globalThis.localStorage?.setItem(CHAVE, cacheJson);
    } catch {
      return;
    }
  }
}

function clone<T>(valor: T): T {
  return JSON.parse(JSON.stringify(valor)) as T;
}
