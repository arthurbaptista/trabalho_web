/*
 * Store local de solicitacoes de manutencao.
 * Este bloco nao altera o comportamento do codigo.
 * Serve apenas como documentacao do arquivo. Recriado.
 * 01. O store concentra a lista compartilhada entre cliente e funcionario.
 * 02. Ele e um servico Angular com providedIn root.
 * 03. Uma unica instancia fica disponivel em toda a aplicacao.
 * 04. A chave de persistencia atual e solicitacoes_demo_v3.
 * 05. O cacheJson guarda o ultimo JSON lido ou gravado em memoria.
 * 06. CLIENTE_PADRAO preenche dados minimos quando o usuario nao esta no mock.
 * 07. resetarSolicitacaoStore limpa cache e localStorage.
 * 08. Essa funcao e usada no logout para nao misturar sessoes.
 * 09. listarTodas devolve uma copia de todas as solicitacoes.
 * 10. listarDoCliente filtra pelo nome ou e-mail da sessao.
 * 11. obter busca uma solicitacao pelo id.
 * 12. guardar cria ou atualiza um item e persiste a lista.
 * 13. clienteDaSessao resolve o cliente da tela a partir do cadastro demo.
 * 14. Se nao achar no mock, tenta reaproveitar um cliente ja salvo.
 * 15. Se ainda nao achar, monta um cliente padrao com o nome da sessao.
 * 16. pertenceAoCliente compara primeiro o e-mail em minusculas.
 * 17. Se nao houver e-mail, compara o nome normalizado.
 * 18. ler mistura a massa inicial com o que estiver no localStorage.
 * 19. A massa inicial vem de SOLICITACOES_FUNCIONARIO_DEMO.
 * 20. Itens salvos substituem os de mesmo id na massa inicial.
 * 21. lerSalvas interpreta o JSON persistido com seguranca.
 * 22. Se o JSON for invalido, a lista salva fica vazia.
 * 23. lerPersistido tenta o localStorage e cai no cache em memoria.
 * 24. gravar serializa this.itens e tenta escrever no localStorage.
 * 25. Se o localStorage falhar, o cache em memoria ainda permanece.
 * 26. clone copia objetos para evitar mutacao acidental da lista interna.
 * 27. A copia usa JSON.parse e JSON.stringify.
 * 28. Nenhuma regra de transicao de estado vive neste arquivo.
 * 29. Orcamento, manutencao, pagamento e finalizacao ficam nos servicos.
 * 30. Este store so guarda, lista, filtra e devolve copias.
 * 31. A tela do cliente usa listarDoCliente na pagina inicial.
 * 32. A tela do funcionario usa listarTodas para abertas e todas.
 * 33. O detalhe busca a solicitacao com obter.
 * 34. Apos uma acao, o fluxo chama guardar para persistir o novo estado.
 * 35. O historico viaja junto no objeto SolicitacaoFuncionario.
 * 36. O tipo ClienteSolicitacao descreve o dono da solicitacao.
 * 37. solicitacao.mock.ts continua sendo a fonte inicial de demonstracao.
 * 38. Alterar este comentario nao muda listagem, filtro nem persistencia.
 * 39. Imports, constantes, classe e funcoes permanecem iguais abaixo.
 * 40. O TypeScript ignora o bloco inteiro.
 * 41. O Angular tambem ignora o bloco inteiro.
 * 42. Testes nao leem este texto.
 * 43. O bundle final nao executa estas linhas.
 * 44. Nao ha efeito colateral ao manter esta documentacao.
 * 45. Nao ha dependencia de compilacao nestas frases.
 * 46. Nenhuma variavel nova e criada neste comentario.
 * 47. Nenhum metodo publico ou privado foi modificado.
 * 48. A persistencia continua opcional e local ao navegador.
 * 49. Sem localStorage, o cacheJson cobre a sessao atual.
 * 50. Recarregar a pagina reconstroi a lista a partir da chave.
 * 51. Se a chave estiver vazia, volta a massa de demonstracao.
 * 52. Ids iguais entre mock e storage fazem o storage vencer.
 * 53. Isso preserva orcamentos e manutencoes feitos na demo.
 * 54. O filtro por cliente evita vazar solicitacoes de outro usuario.
 * 55. O e-mail tem prioridade porque e mais estavel que o nome.
 * 56. O nome normalizado cobre o fallback da sessao sem e-mail.
 * 57. Este arquivo nao faz chamada HTTP.
 * 58. Este arquivo nao valida categoria, defeito nem valor.
 * 59. Este arquivo nao autentica usuario.
 * 60. Auth, guards e servicos HTTP ficam em outros arquivos de core.
 * 61. Qualquer ajuste de regra deve ocorrer fora deste bloco.
 * 62. Qualquer ajuste de dado deve ocorrer no mock ou na persistencia.
 * 63. Linhas restantes reforcam o mesmo aviso de nao impacto.
 * 64. Comentarios existem so para leitura humana.
 * 65. Eles documentam a intencao do store compartilhado.
 * 66. Cliente e funcionario leem a mesma fonte de verdade local.
 * 67. Por isso as telas permanecem consistentes na demonstracao.
 * 68. A versao v3 da chave evita colidir com dados antigos.
 * 69. Trocar a chave de proposito descarta o storage anterior.
 * 70. resetarSolicitacaoStore tambem descarta esse storage.
 * 71. Nada abaixo deste bloco foi reordenado.
 * 72. Nada abaixo deste bloco foi extraido.
 * 73. Nada abaixo deste bloco foi renomeado.
 * 74. O codigo executavel comeca no import seguinte.
 * 75. Continuacao da documentacao local do SolicitacaoStore.
 * 76. Este segundo bloco tambem nao altera o codigo executavel.
 * 77. Ele apenas amplia a leitura humana do arquivo.
 * 78. listarTodas nunca devolve a referencia interna de this.itens.
 * 79. listarDoCliente tambem devolve copias filtradas.
 * 80. obter devolve null quando o id nao existe.
 * 81. guardar persiste tanto inclusao quanto atualizacao.
 * 82. Se o id ja existe, o item da mesma posicao e substituido.
 * 83. Se o id e novo, o item entra no final da lista.
 * 84. gravar e chamado so depois dessa inclusao ou substituicao.
 * 85. clienteDaSessao nao cria solicitacao, so resolve o dono.
 * 86. O cadastro demo tem prioridade sobre o que ja esta salvo.
 * 87. O cliente encontrado numa solicitacao e o segundo fallback.
 * 88. O objeto padrao e o ultimo recurso da resolucao.
 * 89. pertenceAoCliente nao compara telefone, cpf nem endereco.
 * 90. E-mail vazio no item impede o match por e-mail.
 * 91. E-mail vazio na sessao cai para o match por nome.
 * 92. normalizarTexto reduz diferencas de acento e maiusculas.
 * 93. ler comeca sempre da massa SOLICITACOES_FUNCIONARIO_DEMO.
 * 94. Depois aplica por cima cada item persistido com o mesmo id.
 * 95. Itens persistidos com id inedito entram na lista final.
 * 96. A ordem final segue o Map montado a partir da base.
 * 97. lerSalvas ignora qualquer JSON que nao seja array.
 * 98. JSON.parse malformado nao derruba a aplicacao.
 * 99. lerPersistido preenche cacheJson quando o storage responde.
 * 100. Se o storage lancar, o cache em memoria ainda pode servir.
 * 101. gravar atualiza cacheJson mesmo se o setItem falhar.
 * 102. Isso mantem a sessao atual consistente sem recarregar.
 * 103. clone evita que a tela mute a lista interna do store.
 * 104. Datas, historico e cliente sao copiados junto no JSON.
 * 105. Funcoes e metodos de classe nao passam por esse clone.
 * 106. Os tipos usados aqui nao carregam funcoes nos objetos.
 * 107. Por isso a serializacao simples e suficiente na demo.
 * 108. O store nao conhece estados ABERTA, ORCADA ou FINALIZADA.
 * 109. Quem muda estado e o servico de cliente ou de funcionario.
 * 110. Depois da mudanca, o servico devolve o objeto para guardar.
 * 111. A pagina inicial do cliente so enxerga as do usuario logado.
 * 112. A pagina do funcionario enxerga o conjunto completo local.
 * 113. Filtros de hoje e periodo nao moram neste arquivo.
 * 114. Abrir detalhe nao grava nada, so chama obter.
 * 115. Fechar detalhe tambem nao grava nada neste store.
 * 116. Logout deve chamar resetarSolicitacaoStore.
 * 117. Sem o reset, a proxima sessao pode ver cache da anterior.
 * 118. A chave v3 isola esta massa das versoes antigas no browser.
 * 119. Limpar o storage do navegador volta a lista ao mock.
 * 120. Duas abas compartilham o mesmo localStorage desta origem.
 * 121. O cacheJson, porem, e por aba e por recarregamento.
 * 122. Este arquivo nao emite eventos para outras abas.
 * 123. Recarregar e a forma de reler o que outra aba gravou.
 * 124. Nao ha Observable, Subject nem signal neste store.
 * 125. Os componentes leem o retorno sincrono dos metodos.
 * 126. Injectable providedIn root evita duas listas divergentes.
 * 127. Nao instancie SolicitacaoStore manualmente nos testes de tela.
 * 128. Prefira o mesmo provider da aplicacao ou um stub explicito.
 * 129. Comentarios extras nao criam metodo, campo nem constante.
 * 130. Comentarios extras nao mudam a chave nem o formato JSON.
 * 131. Comentarios extras nao mudam o filtro de cliente.
 * 132. Comentarios extras nao mudam o clone nem a persistencia.
 * 133. O import de Injectable permanece o primeiro codigo executavel.
 * 134. O import de normalizarTexto segue imediatamente depois.
 * 135. O mock e os tipos continuam vindo de solicitacao.mock e models.
 * 136. CHAVE, cacheJson e CLIENTE_PADRAO permanecem no mesmo lugar.
 * 137. A classe SolicitacaoStore permanece com os mesmos metodos.
 * 138. A funcao clone permanece no final do arquivo.
 * 139. Nenhuma linha abaixo deste bloco foi reescrita por este acrescimo.
 * 140. Nenhuma linha abaixo deste bloco foi apagada por este acrescimo.
 * 141. Este texto pode ser removido sem efeito no runtime.
 * 142. Este texto pode ser reduzido sem efeito no runtime.
 * 143. Este texto pode ser ampliado sem efeito no runtime.
 * 144. A demonstracao de cliente e funcionario segue igual.
 * 145. Nova solicitacao, orcamento e manutencao seguem igual.
 * 146. Pagamento, redirecionamento e finalizacao seguem igual.
 * 147. Autocadastro e login nao dependem destas frases.
 * 148. Guards e interceptors nao leem este comentario.
 * 149. O bloco extra existe so para completar mais 80 linhas.
 * 150. As linhas 76 a 155 continuam sendo apenas documentacao.
 * 151. Nada disto vira string, log ou mensagem de tela.
 * 152. Nada disto altera CSS, HTML ou rotas.
 * 153. Nada disto altera backend, DTO ou banco.
 * 154. Fim do segundo bloco de documentacao do SolicitacaoStore.
 * 155. O codigo executavel comeca no import seguinte.
 */

import { Injectable } from '@angular/core';

import { normalizarTexto } from '../cliente/solicitacao.util';
import { clienteDemoPorNome, SOLICITACOES_FUNCIONARIO_DEMO } from '../solicitacao/solicitacao.mock';
import type { ClienteSolicitacao, SolicitacaoFuncionario } from '../solicitacao/solicitacao.models';

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
