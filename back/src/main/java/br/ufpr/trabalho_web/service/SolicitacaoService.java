package br.ufpr.trabalho_web.service;

import br.ufpr.trabalho_web.exception.RegraNegocioException;
import br.ufpr.trabalho_web.model.*;
import br.ufpr.trabalho_web.repository.HistoricoSolicitacaoRepository;
import br.ufpr.trabalho_web.repository.SolicitacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SolicitacaoService {

    @Autowired
    private SolicitacaoRepository solicitacaoRepository;

    @Autowired
    private HistoricoSolicitacaoRepository historicoRepository;

    @Transactional
    public Solicitacao criarSolicitacao(Solicitacao solicitacao, Cliente cliente) {
        solicitacao.setCliente(cliente);
        solicitacao.setEstadoAtual(EstadoSolicitacao.ABERTA);
        solicitacao.setDataHoraAbertura(LocalDateTime.now());
        Solicitacao salva = solicitacaoRepository.save(solicitacao);
        registrarHistorico(salva, EstadoSolicitacao.ABERTA, null, null);
        return salva;
    }

    @Transactional
    public Solicitacao efetuarOrcamento(Long id, BigDecimal valor, Funcionario funcionario) {
        Solicitacao solicitacao = buscarPorId(id);
        validarEstado(solicitacao, EstadoSolicitacao.ABERTA);

        solicitacao.setValorOrcamento(valor);
        solicitacao.setEstadoAtual(EstadoSolicitacao.ORCADA);
        Solicitacao salva = solicitacaoRepository.save(solicitacao);

        registrarHistorico(salva, EstadoSolicitacao.ORCADA, funcionario, null);
        return salva;
    }

    @Transactional
    public Solicitacao aprovarServico(Long id, Cliente cliente) {
        Solicitacao solicitacao = buscarPorId(id);
        validarPertencimento(solicitacao, cliente);
        validarEstado(solicitacao, EstadoSolicitacao.ORCADA);

        solicitacao.setEstadoAtual(EstadoSolicitacao.APROVADA);
        Solicitacao salva = solicitacaoRepository.save(solicitacao);

        registrarHistorico(salva, EstadoSolicitacao.APROVADA, null, null);
        return salva;
    }

    @Transactional
    public Solicitacao rejeitarServico(Long id, String motivo, Cliente cliente) {
        Solicitacao solicitacao = buscarPorId(id);
        validarPertencimento(solicitacao, cliente);
        validarEstado(solicitacao, EstadoSolicitacao.ORCADA);

        solicitacao.setMotivoRejeicao(motivo);
        solicitacao.setEstadoAtual(EstadoSolicitacao.REJEITADA);
        Solicitacao salva = solicitacaoRepository.save(solicitacao);

        registrarHistorico(salva, EstadoSolicitacao.REJEITADA, null, null);
        return salva;
    }

    @Transactional
    public Solicitacao resgatarServico(Long id, Cliente cliente) {
        Solicitacao solicitacao = buscarPorId(id);
        validarPertencimento(solicitacao, cliente);
        validarEstado(solicitacao, EstadoSolicitacao.REJEITADA);

        solicitacao.setEstadoAtual(EstadoSolicitacao.APROVADA);
        Solicitacao salva = solicitacaoRepository.save(solicitacao);

        registrarHistorico(salva, EstadoSolicitacao.APROVADA, null, null);
        return salva;
    }

    @Transactional
    public Solicitacao efetuarManutencao(Long id, String descricao, String orientacoes, Funcionario funcionario) {
        Solicitacao solicitacao = buscarPorId(id);
        if (solicitacao.getEstadoAtual() != EstadoSolicitacao.APROVADA && solicitacao.getEstadoAtual() != EstadoSolicitacao.REDIRECIONADA) {
            throw new RegraNegocioException("A solicitação não está num estado válido para manutenção.");
        }

        solicitacao.setDescricaoManutencao(descricao);
        solicitacao.setOrientacoesCliente(orientacoes);
        solicitacao.setEstadoAtual(EstadoSolicitacao.ARRUMADA);
        Solicitacao salva = solicitacaoRepository.save(solicitacao);

        registrarHistorico(salva, EstadoSolicitacao.ARRUMADA, funcionario, null);
        return salva;
    }

    @Transactional
    public Solicitacao redirecionarManutencao(Long id, Funcionario origem, Funcionario destino) {
        if (origem.getId().equals(destino.getId())) {
            throw new RegraNegocioException("Não é possível redirecionar para o próprio utilizador.");
        }
        Solicitacao solicitacao = buscarPorId(id);
        if (solicitacao.getEstadoAtual() != EstadoSolicitacao.APROVADA && solicitacao.getEstadoAtual() != EstadoSolicitacao.REDIRECIONADA) {
            throw new RegraNegocioException("Estado inválido para redirecionamento.");
        }

        solicitacao.setFuncionarioResponsavel(destino);
        solicitacao.setEstadoAtual(EstadoSolicitacao.REDIRECIONADA);
        Solicitacao salva = solicitacaoRepository.save(solicitacao);

        registrarHistorico(salva, EstadoSolicitacao.REDIRECIONADA, origem, destino);
        return salva;
    }

    @Transactional
    public Solicitacao pagarServico(Long id, Cliente cliente) {
        Solicitacao solicitacao = buscarPorId(id);
        validarPertencimento(solicitacao, cliente);
        validarEstado(solicitacao, EstadoSolicitacao.ARRUMADA);

        solicitacao.setEstadoAtual(EstadoSolicitacao.PAGA);
        Solicitacao salva = solicitacaoRepository.save(solicitacao);

        registrarHistorico(salva, EstadoSolicitacao.PAGA, null, null);
        return salva;
    }

    @Transactional
    public Solicitacao finalizarSolicitacao(Long id, Funcionario funcionario) {
        Solicitacao solicitacao = buscarPorId(id);
        validarEstado(solicitacao, EstadoSolicitacao.PAGA);

        solicitacao.setEstadoAtual(EstadoSolicitacao.FINALIZADA);
        Solicitacao salva = solicitacaoRepository.save(solicitacao);

        registrarHistorico(salva, EstadoSolicitacao.FINALIZADA, funcionario, null);
        return salva;
    }

    private void registrarHistorico(Solicitacao solicitacao, EstadoSolicitacao estado, Funcionario origem, Funcionario destino) {
        HistoricoSolicitacao historico = new HistoricoSolicitacao();
        historico.setSolicitacao(solicitacao);
        historico.setEstadoAlcancado(estado);
        historico.setDataHora(LocalDateTime.now());
        historico.setFuncionarioOrigem(origem);
        historico.setFuncionarioDestino(destino);
        historicoRepository.save(historico);
    }

    private Solicitacao buscarPorId(Long id) {
        return solicitacaoRepository.findById(id)
                .orElseThrow(() -> new RegraNegocioException("Solicitação não encontrada."));
    }

    private void validarEstado(Solicitacao solicitacao, EstadoSolicitacao estadoEsperado) {
        if (solicitacao.getEstadoAtual() != estadoEsperado) {
            throw new RegraNegocioException("Ação não permitida para o estado atual da solicitação.");
        }
    }

    private void validarPertencimento(Solicitacao solicitacao, Cliente cliente) {
        if (!solicitacao.getCliente().getId().equals(cliente.getId())) {
            throw new RegraNegocioException("Esta solicitação não pertence a este cliente.");
        }
    }

    public List<Solicitacao> listarPorCliente(Cliente cliente) {
        return solicitacaoRepository.findByClienteOrderByDataHoraAberturaAsc(cliente);
    }

    public List<Solicitacao> listarAbertas() {
        return solicitacaoRepository.findByEstadoAtual(EstadoSolicitacao.ABERTA);
    }

    public List<Solicitacao> listarTodas() {
        return solicitacaoRepository.findAllByOrderByDataHoraAberturaAsc();
    }

    public Solicitacao obterPorId(Long id) {
        return buscarPorId(id);
    }

    public List<HistoricoSolicitacao> listarHistorico(Long id) {
        buscarPorId(id);
        return historicoRepository.findBySolicitacaoIdOrderByDataHoraAsc(id);
    }
}


/**
 * ============================================================================
 * NOTAS DA ARQUITETURA DO BACKEND E FLUXO DE SOLICITAÇÕES
 * ============================================================================
 *
 * Este documento resume o funcionamento interno da API para facilitar a
 * manutenção das regras de negócio e integração com o banco de dados.
 *
 * ----------------------------------------------------------------------------
 * 1. AUTENTICAÇÃO E SEGURANÇA (pacotes security e config)
 * ----------------------------------------------------------------------------
 * O controle de acesso não usa o BCrypt padrão do Spring, mas sim uma
 * implementação própria para atender aos requisitos da disciplina:
 *
 * - Sha256SaltPasswordEncoder: Gera um salt aleatório para cada usuário no
 *   momento do cadastro e aplica o hash SHA-256 concatenado.
 * - No autocadastro do cliente (ClienteService), uma senha numérica de 4
 *   dígitos é gerada automaticamente e enviada por e-mail (EmailService).
 * - O login (AuthController / AuthService) valida o e-mail e a senha usando
 *   o salt salvo no banco e devolve um token JWT (gerado pelo JwtUtil).
 * - O JwtAuthenticationFilter intercepta todas as rotas protegidas, lê o
 *   header Authorization (Bearer), valida o token e injeta o perfil do
 *   usuário (CLIENTE ou FUNCIONARIO) no contexto do Spring Security.
 *
 * ----------------------------------------------------------------------------
 * 2. MODELAGEM DE DADOS E HERANÇA (pacote model)
 * ----------------------------------------------------------------------------
 * Para evitar duplicação de colunas de login, a modelagem de usuários foi
 * dividida usando relacionamento com a entidade base:
 *
 * - Usuario: Guarda os dados de credenciais (id, email, senhaHash, salt,
 *   nome, perfil e status ativo/inativo).
 * - Cliente: Vinculado ao Usuario, guarda CPF, telefone e o Endereco
 *   (CEP, logradouro, bairro, cidade, UF, número e complemento).
 * - Funcionario: Vinculado ao Usuario, guarda a data de nascimento e
 *   controla quem pode executar orçamentos e manutenções.
 *   Obs: Um funcionário não pode excluir a si mesmo nem ser o único do sistema.
 * - Categoria: Tabela simples com flag de ativo/inativo (soft delete) para
 *   não quebrar a chave estrangeira das solicitações antigas.
 *
 * ----------------------------------------------------------------------------
 * 3. MÁQUINA DE ESTADOS DA SOLICITAÇÃO (SolicitacaoService)
 * ----------------------------------------------------------------------------
 * Toda ação sobre um chamado altera o enum EstadoSolicitacao e grava um
 * registro na tabela HistoricoSolicitacao para manter a trilha de auditoria
 * (data/hora da mudança, estado anterior, estado novo e funcionário).
 *
 * Transições permitidas no código:
 *
 * [ABERTA]
 *   -> Criada pelo cliente informando descrição do equipamento, categoria e
 *      descrição do defeito.
 *   -> Próximo passo: Funcionário assume e registra um valor em OrcamentoController.
 *
 * [ORCADA]
 *   -> A solicitação já possui valor de orçamento e funcionário vinculado.
 *   -> Aqui a decisão volta para a tela do cliente:
 *      a) Se aprovar: muda para APROVADA.
 *      b) Se rejeitar: muda para REJEITADA (exige salvar o motivo da rejeição).
 *
 * [REJEITADA]
 *   -> O cliente não aceitou o valor. O equipamento fica aguardando resgate.
 *   -> Quando o cliente retira ou clica em resgatar, o estado volta para ABERTA
 *      ou segue o fluxo definido na regra de resgate.
 *
 * [APROVADA] e [REDIRECIONADA]
 *   -> Serviço liberado para conserto técnico.
 *   -> O funcionário responsável pode fazer duas coisas:
 *      a) Executar a manutenção: preenche a descrição do serviço realizado e
 *         as orientações para o cliente -> estado vai para ARRUMADA.
 *      b) Redirecionar: caso não saiba consertar, escolhe outro funcionário de
 *         destino -> estado vai para REDIRECIONADA.
 *   -> Detalhe importante: uma solicitação REDIRECIONADA só pode ser manipulada
 *      pelo funcionário de destino para quem ela foi encaminhada.
 *
 * [ARRUMADA]
 *   -> Conserto finalizado na bancada. O cliente visualiza as orientações e
 *      realiza a confirmação do pagamento.
 *   -> Ao confirmar pagamento: registra a data/hora do pagamento e muda o
 *      estado para PAGA.
 *
 * [PAGA]
 *   -> O serviço já foi quitado pelo cliente, restando apenas a entrega física.
 *   -> O funcionário aciona a finalização do chamado -> estado vai para
 *      FINALIZADA, registrando a data/hora de encerramento.
 *
 * [FINALIZADA]
 *   -> Estado terminal. Não permite novas transições ou edições.
 *
 * ----------------------------------------------------------------------------
 * 4. TRATAMENTO DE ERROS E VALIDAÇÕES (pacote exception)
 * ----------------------------------------------------------------------------
 * Para não retornar stacktrace puro para o Angular, o ApiExceptionHandler
 * captura as exceções customizadas e formata um JSON limpo:
 *
 * - RecursoDuplicadoException (HTTP 409 Conflict): Disparada quando tentam
 *   cadastrar CPF, e-mail ou nome de categoria que já existe no banco.
 * - RegraNegocioException (HTTP 400 Bad Request / 422): Disparada quando
 *   tentam pular etapas da solicitação (ex: tentar pagar uma solicitação que
 *   ainda está ABERTA, ou redirecionar para o próprio funcionário logado).
 *
 * ----------------------------------------------------------------------------
 * 5. CONSULTAS DE RELATÓRIO E CARGA INICIAL (RelatorioService / DadosIniciais)
 * ----------------------------------------------------------------------------
 * Os relatórios financeiros consideram apenas solicitações que já passaram
 * pela etapa de pagamento (estados PAGA ou FINALIZADA):
 *
 * - Receitas por período: Filtra pela data de pagamento (dataInicio e dataFim)
 *   e agrupa os valores somados por dia no RelatorioReceitaDTO.
 * - Receitas por categoria: Agrupa todas as solicitações pagas pelo nome da
 *   Categoria do equipamento para mostrar quais itens dão mais retorno.
 *
 * Carga Inicial (CommandLineRunner):
 * - Sempre que o Spring Boot sobe com o banco vazio, as classes DadosIniciais
 *   e CategoriaDadosIniciais verificam se já existem registros.
 * - Se não existirem, criam automaticamente as 5 categorias base (Notebook,
 *   Desktop, Impressora, Mouse, Teclado), os funcionários padrão (ex: Maria e
 *   Mário) e os clientes de teste com senhas já criptografadas em SHA-256,
 *   garantindo que o ambiente esteja pronto para avaliação sem precisar rodar
 *   scripts SQL manualmente por fora.
 *
 * ============================================================================
 */