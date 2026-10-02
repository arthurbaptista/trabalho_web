import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DetalheSolicitacaoFuncionario } from '../componentes/detalhe-solicitacao-funcionario/detalhe-solicitacao-funcionario';
import { SidebarFuncionario } from '../componentes/sidebar-funcionario/sidebar-funcionario';
import { formatarDataHora, formatarMoeda, rotuloEstado } from '../cliente/solicitacao.util';
import { mensagemHttpErro } from '../core/api';
import { Auth } from '../core/auth';
import { filtrarSolicitacoesFuncionario, hojeLocal } from './funcionario.filtro';
import type {
  FiltroPeriodo,
  ModoDetalheFuncionario,
  SolicitacaoFuncionario,
  VistaFuncionario,
} from './funcionario.models';
import { FuncionarioService } from './funcionario.service';

@Component({
  selector: 'app-funcionario',
  imports: [SidebarFuncionario, DetalheSolicitacaoFuncionario],
  templateUrl: './funcionario.html',
  styleUrl: './funcionario.css',
})
export class FuncionarioPage {
  private readonly funcionarioService = inject(FuncionarioService);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly auth = inject(Auth);

  solicitacoes = signal<SolicitacaoFuncionario[]>([]);
  vista = signal<VistaFuncionario>('abertas');
  filtro = signal<FiltroPeriodo>('TODAS');
  dataInicio = signal('');
  dataFim = signal('');
  erro = signal('');
  carregando = signal(true);
  detalheAberto = signal(false);
  solicitacaoAtual = signal<SolicitacaoFuncionario | null>(null);
  modoDetalhe = signal<ModoDetalheFuncionario>('visualizar');

  /*
   * -------------------------------------------------------------------------
   * DOCUMENTAÇÃO DA PÁGINA DO FUNCIONÁRIO
   * -------------------------------------------------------------------------
   *
   * Esta classe representa a página principal utilizada pelo funcionário.
   *
   * A responsabilidade principal da página é organizar a interação entre
   * os componentes visuais, os filtros e o serviço responsável pelas
   * solicitações.
   *
   * A classe utiliza Signals do Angular para manter o estado da tela.
   *
   * O uso de Signals permite que os valores derivados sejam recalculados
   * automaticamente sempre que algum dos estados utilizados for alterado.
   *
   * A lista de solicitações é armazenada no signal "solicitacoes".
   *
   * O signal "vista" determina se o usuário está visualizando solicitações
   * abertas ou todas as solicitações disponíveis.
   *
   * O signal "filtro" representa o filtro de período atualmente selecionado.
   *
   * Os signals "dataInicio" e "dataFim" armazenam os limites escolhidos
   * quando o usuário utiliza um filtro baseado em período personalizado.
   *
   * O signal "erro" concentra a mensagem apresentada quando ocorre alguma
   * falha durante a comunicação com o serviço de solicitações.
   *
   * O signal "carregando" indica para a interface que os dados ainda estão
   * sendo obtidos pelo serviço.
   *
   * Dessa forma, a interface consegue apresentar um estado de carregamento
   * enquanto a requisição ainda não foi concluída.
   *
   * O signal "detalheAberto" controla a exibição do componente responsável
   * por apresentar ou editar os detalhes de uma solicitação.
   *
   * A solicitação selecionada pelo usuário fica armazenada em
   * "solicitacaoAtual".
   *
   * O signal "modoDetalhe" determina qual operação será realizada no
   * componente de detalhes.
   *
   * Entre os modos possíveis estão visualização, orçamento, manutenção,
   * redirecionamento e finalização da solicitação.
   *
   * Os valores relacionados ao usuário autenticado são obtidos através
   * do serviço Auth.
   *
   * O nome completo da sessão é utilizado para gerar informações exibidas
   * na interface, como nome curto e iniciais.
   *
   * A propriedade "nome" é um valor computado derivado da sessão atual.
   *
   * "primeiroNome" utiliza o nome completo para obter apenas o primeiro nome.
   *
   * "iniciais" gera uma representação curta do nome do usuário para utilização
   * em elementos como avatar ou identificação visual.
   *
   * Caso não exista um nome disponível, é utilizado um valor padrão.
   *
   * O título da página também é calculado de acordo com a vista selecionada.
   *
   * Quando a vista corresponde às solicitações abertas, o título informa
   * explicitamente que esse conjunto está sendo apresentado.
   *
   * Para a visualização geral, o título utiliza uma descrição mais abrangente.
   *
   * A propriedade "visiveis" representa a lista efetivamente apresentada
   * na tela após a aplicação de todos os filtros necessários.
   *
   * O processo de filtragem é centralizado em "filtrarSolicitacoesFuncionario".
   *
   * Isso mantém as regras de filtragem separadas da lógica responsável pela
   * apresentação e interação da página.
   *
   * Além da lista original, o filtro recebe informações sobre a vista atual,
   * o período selecionado e os dados do funcionário autenticado.
   *
   * A data atual é obtida através da função "hojeLocal", evitando depender
   * diretamente de uma construção de data espalhada pela interface.
   *
   * -------------------------------------------------------------------------
   * CARREGAMENTO DOS DADOS
   * -------------------------------------------------------------------------
   *
   * O método "carregar" é responsável pelo carregamento inicial da página.
   *
   * Antes da requisição, o estado de carregamento é ativado.
   *
   * A mensagem de erro anterior também é limpa para evitar que informações
   * antigas permaneçam visíveis depois de uma nova tentativa.
   *
   * O FuncionarioService é responsável por consultar as solicitações.
   *
   * Quando a consulta é concluída com sucesso, a lista recebida é armazenada.
   *
   * Depois da atualização da lista, o indicador de carregamento é desativado.
   *
   * Quando ocorre um erro, o estado de carregamento também é encerrado.
   *
   * A mensagem de erro é convertida para uma descrição adequada à interface
   * através da função "mensagemHttpErro".
   *
   * O método "recarregarLista" é utilizado depois de alterações realizadas
   * em uma solicitação, garantindo que a lista exibida permaneça atualizada.
   *
   * -------------------------------------------------------------------------
   * INTERAÇÃO COM FILTROS E DETALHES
   * -------------------------------------------------------------------------
   *
   * Os métodos "mostrarAbertas" e "mostrarTodas" alteram a vista atual.
   *
   * "escolherFiltro" atualiza diretamente o filtro selecionado.
   *
   * Quando o usuário define uma data inicial ou final, o filtro é alterado
   * automaticamente para o modo de período personalizado.
   *
   * Os métodos "visualizar", "orc ar", "manter", "redirecionar" e "finalizar"
   * encaminham a solicitação para o detalhe utilizando o modo correspondente.
   *
   * A lógica de abertura foi centralizada em "abrirDetalhe" para evitar
   * repetição de código entre essas operações.
   *
   * "fecharDetalhe" limpa a solicitação selecionada e restaura o modo padrão.
   *
   * Após uma atualização feita no componente de detalhes, "onAtualizou"
   * mantém a solicitação atualizada e solicita uma nova listagem ao serviço.
   *
   * Por fim, "sair" delega o encerramento da sessão ao serviço de autenticação.
   *
   * -------------------------------------------------------------------------
   * ORGANIZAÇÃO DO CÓDIGO
   * -------------------------------------------------------------------------
   *
   * A classe mantém separadas as responsabilidades de estado, consulta,
   * filtragem, apresentação e navegação entre os detalhes.
   *
   * As funções de formatação são disponibilizadas para utilização pelo
   * template sem duplicar suas implementações nesta classe.
   *
   * A função "classeEstado" transforma o estado da solicitação em uma classe
   * CSS que pode ser utilizada para aplicar estilos específicos.
   *
   * -------------------------------------------------------------------------
   */

  nome = computed(() => this.auth.sessao()?.nome ?? '');

  primeiroNome = computed(() => this.nome().split(' ')[0] || 'Funcionário');

  iniciais = computed(() => {
    const partes = this.nome().trim().split(/\s+/).filter(Boolean);

    if (partes.length === 0) {
      return 'F';
    }

    if (partes.length === 1) {
      return partes[0].slice(0, 2).toUpperCase();
    }

    return (partes[0][0] + partes[1][0]).toUpperCase();
  });

  titulo = computed(() =>
    this.vista() === 'abertas' ? 'Solicitações Abertas' : 'Solicitações',
  );

  visiveis = computed(() =>
    filtrarSolicitacoesFuncionario(this.solicitacoes(), {
      vista: this.vista(),
      filtro: this.filtro(),
      dataInicio: this.dataInicio(),
      dataFim: this.dataFim(),
      nomeFuncionario: this.nome(),
      emailFuncionario: this.auth.sessao()?.email,
      hoje: hojeLocal(),
    }),
  );

  constructor() {
    const vistaInicial =
      this.activatedRoute.snapshot.queryParamMap.get('vista');

    if (vistaInicial === 'todas') {
      this.vista.set('todas');
    }

    this.carregar();
  }

  carregar() {
    this.carregando.set(true);
    this.erro.set('');

    this.funcionarioService.listar().subscribe({
      next: (lista) => {
        this.solicitacoes.set(lista);
        this.carregando.set(false);
      },
      error: (erro) => {
        this.carregando.set(false);
        this.erro.set(
          mensagemHttpErro(
            erro,
            'Nao foi possivel listar as solicitacoes.',
          ),
        );
      },
    });
  }

  private recarregarLista() {
    this.funcionarioService.listar().subscribe({
      next: (lista) => this.solicitacoes.set(lista),
    });
  }

  descricao(texto: string): string {
    return texto.length <= 30 ? texto : texto.slice(0, 30);
  }

  rotuloEstado = rotuloEstado;
  formatarDataHora = formatarDataHora;
  formatarMoeda = formatarMoeda;

  classeEstado(estado: string): string {
    return `estado-${estado.toLowerCase()}`;
  }

  mostrarAbertas() {
    this.vista.set('abertas');
  }

  mostrarTodas() {
    this.vista.set('todas');
  }

  escolherFiltro(filtro: FiltroPeriodo) {
    this.filtro.set(filtro);
  }

  escolherInicio(valor: string) {
    this.filtro.set('PERIODO');
    this.dataInicio.set(valor);
  }

  escolherFim(valor: string) {
    this.filtro.set('PERIODO');
    this.dataFim.set(valor);
  }

  visualizar(solicitacao: SolicitacaoFuncionario) {
    this.abrirDetalhe(solicitacao, 'visualizar');
  }

  orcar(solicitacao: SolicitacaoFuncionario) {
    this.abrirDetalhe(solicitacao, 'orcamento');
  }

  manter(solicitacao: SolicitacaoFuncionario) {
    this.abrirDetalhe(solicitacao, 'manutencao');
  }

  redirecionar(solicitacao: SolicitacaoFuncionario) {
    this.abrirDetalhe(solicitacao, 'redirecionar');
  }

  finalizar(solicitacao: SolicitacaoFuncionario) {
    this.abrirDetalhe(solicitacao, 'finalizar');
  }

  fecharDetalhe() {
    this.detalheAberto.set(false);
    this.solicitacaoAtual.set(null);
    this.modoDetalhe.set('visualizar');
  }

  onAtualizou(atualizada: SolicitacaoFuncionario) {
    this.solicitacaoAtual.set(atualizada);
    this.recarregarLista();
  }

  sair() {
    this.auth.logout();
  }

  private abrirDetalhe(
    solicitacao: SolicitacaoFuncionario,
    modo: ModoDetalheFuncionario,
  ) {
    this.modoDetalhe.set(modo);
    this.solicitacaoAtual.set(solicitacao);
    this.detalheAberto.set(true);
  }
}