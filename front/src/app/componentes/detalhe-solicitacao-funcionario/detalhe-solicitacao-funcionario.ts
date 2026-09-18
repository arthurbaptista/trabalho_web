import { Component, HostListener, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  formatarDataHora,
  formatarMoeda,
  nomesIguais,
  rotuloAutor,
  rotuloEstado,
  temaEstado,
} from '../../cliente/solicitacao.util';
import { Auth } from '../../core/auth';
import type { FuncionarioResumo, ModoDetalheFuncionario, SolicitacaoFuncionario } from '../../funcionario/funcionario.models';
import { FuncionarioService } from '../../funcionario/funcionario.service';

// Mensagem de confirmação mostrada depois que uma ação é concluída com sucesso.
// Cada valor corresponde ao resultado de uma das quatro ações que este componente
// executa: orçar (RF012), efetuar manutenção (RF014), redirecionar (RF015) e
// finalizar (RF016).
type MensagemAcao = 'orcada' | 'arrumada' | 'redirecionada' | 'finalizada';

// O modo "manutencao" (ModoDetalheFuncionario) abre este componente numa tela
// intermediária de escolha: o funcionário decide se vai efetuar a manutenção
// ele mesmo ou redirecionar a solicitação para outro funcionário. EtapaManutencao
// controla qual dessas sub-telas está visível dentro do modal.
type EtapaManutencao = 'escolha' | 'efetuar' | 'redirecionar';

/**
 * Modal único que concentra as quatro ações que o funcionário pode executar
 * sobre uma solicitação, dependendo do estado em que ela está:
 *
 *  - RF012 (Efetuar Orçamento): estado ABERTA -> ORCADA
 *  - RF014 (Efetuar Manutenção): estado APROVADA/REDIRECIONADA -> ARRUMADA
 *  - RF015 (Redirecionar Manutenção): estado APROVADA/REDIRECIONADA -> REDIRECIONADA
 *  - RF016 (Finalizar Solicitação): estado PAGA -> FINALIZADA
 *
 * Qual dessas ações fica disponível é decidido pelo componente pai (FuncionarioPage),
 * que passa o `modo` de entrada. Este componente só concentra a UI e a chamada ao
 * service; a regra de "quem pode ver qual botão" mora em funcionario.filtro.ts.
 */
@Component({
  selector: 'app-detalhe-solicitacao-funcionario',
  imports: [FormsModule],
  templateUrl: './detalhe-solicitacao-funcionario.html',
  styleUrl: './detalhe-solicitacao-funcionario.css',
})
export class DetalheSolicitacaoFuncionario {
  private readonly funcionarioService = inject(FuncionarioService);
  private readonly auth = inject(Auth);

  aberto = input(false);
  solicitacao = input<SolicitacaoFuncionario | null>(null);
  modo = input<ModoDetalheFuncionario>('visualizar');
  fechou = output<void>();
  atualizou = output<SolicitacaoFuncionario>();

  detalhe = signal<SolicitacaoFuncionario | null>(null);
  funcionarios = signal<FuncionarioResumo[]>([]);
  mensagem = signal<MensagemAcao | null>(null);
  etapaManutencao = signal<EtapaManutencao>('escolha');
  valorTexto = '';
  descricaoManutencao = '';
  orientacoesCliente = '';
  funcionarioDestinoId: number | null = null;
  tentativa = false;
  salvando = false;
  erro = signal('');

  // Guarda "id da solicitação + modo" da última vez que carregamos os dados.
  // Serve para o effect abaixo não recarregar/resetar a UI toda vez que o
  // Angular roda change detection - só quando o usuário efetivamente abriu
  // uma solicitação (ou um modo) diferente do que já estava carregado.
  private chaveCarregada: string | null = null;

  historico = computed(() => this.detalhe()?.historico ?? []);
  estado = computed(() => this.detalhe()?.estado ?? this.solicitacao()?.estado ?? '');
  preco = computed(() => formatarMoeda(this.detalhe()?.valorOrcamento ?? this.solicitacao()?.valorOrcamento));

  // RF015: "não pode ser redirecionada para si mesmo". Filtra o funcionário
  // logado da lista de destinos possíveis, comparando por e-mail quando
  // disponível (mais confiável) e caindo para comparação de nome normalizado
  // (sem acento/maiúsculas) quando não há e-mail na sessão.
  funcionariosDestino = computed(() => {
    const sessao = this.auth.sessao();
    const nome = sessao?.nome ?? '';
    const email = sessao?.email?.trim().toLowerCase() ?? '';
    return this.funcionarios().filter((item) => {
      const mesmoEmail = Boolean(email && item.email.trim().toLowerCase() === email);
      return !mesmoEmail && !nomesIguais(item.nome, nome);
    });
  });

  constructor() {
    // Este effect é o que faz o modal "trocar de conteúdo" sem ser destruído
    // e recriado a cada clique: ele observa aberto()/solicitacao()/modo() e,
    // só quando a combinação muda de fato, reseta o formulário e busca os
    // dados completos da solicitação (ver carregar()). O untracked() evita
    // que as próprias chamadas de resetarUi/carregar (que também mexem em
    // signals) disparem o effect de novo, criando um loop.
    effect(() => {
      const aberta = this.aberto();
      const resumo = this.solicitacao();
      const modo = this.modo();
      if (!aberta || !resumo) {
        this.chaveCarregada = null;
        return;
      }
      const chave = `${resumo.id}-${modo}`;
      if (this.chaveCarregada === chave) {
        return;
      }

      untracked(() => {
        this.chaveCarregada = chave;
        this.resetarUi(resumo, modo);
        this.carregar(resumo);
      });
    });
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (!this.aberto() || this.salvando) {
      return;
    }
    if (this.etapaManutencao() !== 'escolha') {
      this.etapaManutencao.set('escolha');
      return;
    }
    this.fechar();
  }

  fechar() {
    if (this.salvando) {
      return;
    }
    this.fechou.emit();
  }

  confirmarMensagem() {
    const atual = this.detalhe();
    if (atual) {
      this.atualizou.emit(atual);
    }
    this.fechar();
  }

  confirmarOrcamento() {
    this.tentativa = true;
    const atual = this.detalhe();
    const valor = this.valorNumerico();
    if (!atual || valor == null || this.salvando) {
      return;
    }
    this.executar(() => this.funcionarioService.efetuarOrcamento(atual.id, valor), 'orcada');
  }

  escolherEfetuar() {
    this.etapaManutencao.set('efetuar');
    this.tentativa = false;
    this.erro.set('');
  }

  escolherRedirecionar() {
    this.etapaManutencao.set('redirecionar');
    this.tentativa = false;
    this.erro.set('');
  }

  voltarEscolha() {
    this.etapaManutencao.set('escolha');
    this.tentativa = false;
  }

  confirmarManutencao() {
    this.tentativa = true;
    const atual = this.detalhe();
    if (!atual || this.salvando || !this.descricaoManutencao.trim() || !this.orientacoesCliente.trim()) {
      return;
    }
    this.executar(
      () => this.funcionarioService.efetuarManutencao(
        atual.id,
        this.descricaoManutencao.trim(),
        this.orientacoesCliente.trim(),
      ),
      'arrumada',
    );
  }

  confirmarRedirecionamento() {
    this.tentativa = true;
    const atual = this.detalhe();
    const destino = this.funcionariosDestino().find((item) => item.id === this.funcionarioDestinoId);
    if (!atual || !destino || this.salvando) {
      return;
    }
    this.executar(
      () => this.funcionarioService.redirecionar(atual.id, destino.nome),
      'redirecionada',
    );
  }

  confirmarFinalizacao() {
    const atual = this.detalhe();
    if (!atual || this.salvando) {
      return;
    }
    this.executar(() => this.funcionarioService.finalizar(atual.id), 'finalizada');
  }

  formatarDataHora = formatarDataHora;
  formatarMoeda = formatarMoeda;
  rotuloEstado = rotuloEstado;
  temaEstado = temaEstado;

  autorDoPasso(autor: string): string {
    const nome = this.detalhe()?.cliente?.nome || this.solicitacao()?.cliente.nome;
    return rotuloAutor(autor, nome);
  }

  valorInvalido() {
    return this.tentativa && this.valorNumerico() == null;
  }

  // Converte o texto digitado pelo funcionário no campo de orçamento (RF012)
  // para um número válido, aceitando tanto o formato brasileiro quanto o
  // americano:
  //   "1.234,56" (BR: ponto de milhar, vírgula decimal)
  //   "1234.56"  (US: sem separador de milhar, ponto decimal)
  // Primeiro remove tudo que não for dígito/vírgula/ponto/sinal. Se houver
  // vírgula, assumimos formato BR: os pontos são separador de milhar (somem)
  // e a vírgula vira o ponto decimal. Sem vírgula, o texto já está num
  // formato que o Number() do JS entende direto. Retorna null para texto
  // vazio, não numérico ou valor <= 0 (orçamento tem que ser positivo).
  private valorNumerico(): number | null {
    const texto = this.valorTexto.trim().replace(/[^\d,.-]/g, '');
    if (!texto) {
      return null;
    }
    const normalizado = texto.includes(',')
      ? texto.replace(/\./g, '').replace(',', '.')
      : texto;
    const valor = Number(normalizado);
    return Number.isFinite(valor) && valor > 0 ? valor : null;
  }

  private carregar(resumo: SolicitacaoFuncionario) {
    // Preenche a UI com o resumo já disponível (a tabela da lista) enquanto o
    // detalhe completo (histórico, defeito, etc.) e a lista de funcionários
    // para o redirecionamento chegam de forma assíncrona - assim o modal abre
    // instantâneo em vez de ficar em branco esperando as duas respostas.
    this.detalhe.set(resumo);
    this.funcionarioService.listarFuncionarios().subscribe((lista) => this.funcionarios.set(lista));
    this.funcionarioService.detalhar(resumo.id).subscribe({
      next: (detalhe) => this.detalhe.set(detalhe),
      error: () => this.erro.set('Nao foi possivel carregar os detalhes da solicitacao.'),
    });
  }

  private executar(
    acao: () => ReturnType<FuncionarioService['efetuarOrcamento']>,
    mensagem: MensagemAcao,
  ) {
    this.salvando = true;
    this.erro.set('');
    acao().subscribe({
      next: (detalhe) => {
        this.salvando = false;
        this.detalhe.set(detalhe);
        this.mensagem.set(mensagem);
        this.atualizou.emit(detalhe);
      },
      error: () => {
        this.salvando = false;
        this.erro.set('Nao foi possivel concluir a acao.');
      },
    });
  }

  private resetarUi(resumo: SolicitacaoFuncionario, modo: ModoDetalheFuncionario = 'visualizar') {
    this.detalhe.set(resumo);
    this.mensagem.set(null);
    this.etapaManutencao.set(modo === 'redirecionar' ? 'redirecionar' : 'escolha');
    this.valorTexto = '';
    this.descricaoManutencao = resumo.descricaoManutencao ?? '';
    this.orientacoesCliente = resumo.orientacoesCliente ?? '';
    this.funcionarioDestinoId = null;
    this.tentativa = false;
    this.salvando = false;
    this.erro.set('');
  }
}
