package br.ufpr.trabalho_web.service;

import br.ufpr.trabalho_web.dto.SolicitacaoRequest;
import br.ufpr.trabalho_web.exception.RegraNegocioException;
import br.ufpr.trabalho_web.model.Categoria;
import br.ufpr.trabalho_web.model.Cliente;
import br.ufpr.trabalho_web.model.EstadoSolicitacao;
import br.ufpr.trabalho_web.model.Funcionario;
import br.ufpr.trabalho_web.model.HistoricoSolicitacao;
import br.ufpr.trabalho_web.model.Solicitacao;
import br.ufpr.trabalho_web.model.Usuario;
import br.ufpr.trabalho_web.repository.CategoriaRepository;
import br.ufpr.trabalho_web.repository.FuncionarioRepository;
import br.ufpr.trabalho_web.repository.HistoricoSolicitacaoRepository;
import br.ufpr.trabalho_web.repository.SolicitacaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
public class SolicitacaoService {

    private final SolicitacaoRepository solicitacaoRepository;
    private final HistoricoSolicitacaoRepository historicoRepository;
    private final CategoriaRepository categoriaRepository;
    private final FuncionarioRepository funcionarioRepository;

    public SolicitacaoService(
            SolicitacaoRepository solicitacaoRepository,
            HistoricoSolicitacaoRepository historicoRepository,
            CategoriaRepository categoriaRepository,
            FuncionarioRepository funcionarioRepository
    ) {
        this.solicitacaoRepository = solicitacaoRepository;
        this.historicoRepository = historicoRepository;
        this.categoriaRepository = categoriaRepository;
        this.funcionarioRepository = funcionarioRepository;
    }

    @Transactional
    public Solicitacao criarSolicitacao(SolicitacaoRequest request, Cliente cliente) {
        if (cliente == null) {
            throw new RegraNegocioException("Cliente nao autenticado.");
        }
        Long categoriaId = request.getCategoriaIdResolvido();
        if (categoriaId == null) {
            throw new RegraNegocioException("A categoria do equipamento e obrigatoria.");
        }

        Categoria categoria = categoriaRepository.findById(categoriaId)
                .filter(cat -> Boolean.TRUE.equals(cat.getStatus()))
                .orElseThrow(() -> new RegraNegocioException("Categoria nao encontrada ou inativa."));

        Solicitacao solicitacao = new Solicitacao();
        solicitacao.setCliente(cliente);
        solicitacao.setCategoria(categoria);
        solicitacao.setDescricaoEquipamento(request.getDescricaoEquipamento().trim());
        solicitacao.setDescricaoDefeito(request.getDescricaoDefeito().trim());
        solicitacao.setEstadoAtual(EstadoSolicitacao.ABERTA);
        solicitacao.setDataHoraAbertura(LocalDateTime.now());
        solicitacao.setStatus(true);

        Solicitacao salva = solicitacaoRepository.save(solicitacao);
        registrarHistorico(salva, EstadoSolicitacao.ABERTA, null, null);
        return salva;
    }

    @Transactional
    public Solicitacao efetuarOrcamento(Long id, BigDecimal valor, Funcionario funcionario) {
        if (valor == null || valor.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RegraNegocioException("O valor do orcamento deve ser maior que zero.");
        }
        Solicitacao solicitacao = buscarPorId(id);
        validarEstado(solicitacao, EstadoSolicitacao.ABERTA);

        solicitacao.setValorOrcamento(valor);
        solicitacao.setFuncionarioResponsavel(funcionario);
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

        String motivoLimpo = limparTextoBruto(motivo);
        if (motivoLimpo.isBlank()) {
            throw new RegraNegocioException("O motivo da rejeicao e obrigatorio.");
        }

        solicitacao.setMotivoRejeicao(motivoLimpo);
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
        if (solicitacao.getEstadoAtual() != EstadoSolicitacao.APROVADA
                && solicitacao.getEstadoAtual() != EstadoSolicitacao.REDIRECIONADA) {
            throw new RegraNegocioException("A solicitacao nao esta num estado valido para manutencao.");
        }
        validarResponsavelSeRedirecionada(solicitacao, funcionario);

        if (descricao == null || descricao.isBlank()) {
            throw new RegraNegocioException("A descricao da manutencao e obrigatoria.");
        }
        if (orientacoes == null || orientacoes.isBlank()) {
            throw new RegraNegocioException("As orientacoes para o cliente sao obrigatorias.");
        }

        solicitacao.setDescricaoManutencao(descricao.trim());
        solicitacao.setOrientacoesCliente(orientacoes.trim());
        solicitacao.setFuncionarioResponsavel(funcionario);
        solicitacao.setEstadoAtual(EstadoSolicitacao.ARRUMADA);
        Solicitacao salva = solicitacaoRepository.save(solicitacao);

        registrarHistorico(salva, EstadoSolicitacao.ARRUMADA, funcionario, null);
        return salva;
    }

    @Transactional
    public Solicitacao redirecionarManutencao(Long id, Funcionario origem, Funcionario destinoParam) {
        if (destinoParam == null || destinoParam.getId() == null) {
            throw new RegraNegocioException("O funcionario de destino e obrigatorio.");
        }
        if (origem.getId().equals(destinoParam.getId())) {
            throw new RegraNegocioException("Nao e possivel redirecionar para o proprio funcionario.");
        }

        Funcionario destino = funcionarioRepository.findById(destinoParam.getId())
                .filter(func -> Boolean.TRUE.equals(func.getStatus()))
                .orElseThrow(() -> new RegraNegocioException("Funcionario de destino nao encontrado ou inativo."));

        Solicitacao solicitacao = buscarPorId(id);
        if (solicitacao.getEstadoAtual() != EstadoSolicitacao.APROVADA
                && solicitacao.getEstadoAtual() != EstadoSolicitacao.REDIRECIONADA) {
            throw new RegraNegocioException("Estado invalido para redirecionamento.");
        }
        validarResponsavelSeRedirecionada(solicitacao, origem);

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

        solicitacao.setFuncionarioResponsavel(funcionario);
        solicitacao.setEstadoAtual(EstadoSolicitacao.FINALIZADA);
        Solicitacao salva = solicitacaoRepository.save(solicitacao);

        registrarHistorico(salva, EstadoSolicitacao.FINALIZADA, funcionario, null);
        return salva;
    }

    @Transactional(readOnly = true)
    public List<Solicitacao> listarPorCliente(Cliente cliente) {
        return solicitacaoRepository.findByClienteOrderByDataHoraAberturaAsc(cliente);
    }

    @Transactional(readOnly = true)
    public List<Solicitacao> listarAbertas() {
        return solicitacaoRepository.findByEstadoAtualOrderByDataHoraAberturaAsc(EstadoSolicitacao.ABERTA);
    }

    @Transactional(readOnly = true)
    public List<Solicitacao> listarTodas() {
        return solicitacaoRepository.findAllByOrderByDataHoraAberturaAsc();
    }

    @Transactional(readOnly = true)
    public List<Solicitacao> listarParaFuncionario(
            Funcionario funcionario,
            String filtro,
            String dataInicio,
            String dataFim
    ) {
        if (funcionario == null) {
            return listarTodas();
        }

        if ("HOJE".equalsIgnoreCase(filtro)) {
            LocalDate hoje = LocalDate.now();
            return solicitacaoRepository.findVisiveisParaFuncionarioPorPeriodo(
                    funcionario.getId(),
                    hoje.atStartOfDay(),
                    hoje.atTime(LocalTime.MAX)
            );
        }

        if ((dataInicio != null && !dataInicio.isBlank()) || (dataFim != null && !dataFim.isBlank())) {
            LocalDate inicio = (dataInicio == null || dataInicio.isBlank())
                    ? LocalDate.of(2000, 1, 1)
                    : parseData(dataInicio, "data inicial");
            LocalDate fim = (dataFim == null || dataFim.isBlank())
                    ? LocalDate.now().plusYears(10)
                    : parseData(dataFim, "data final");

            if (inicio.isAfter(fim)) {
                throw new RegraNegocioException("A data inicial nao pode ser maior que a data final.");
            }

            return solicitacaoRepository.findVisiveisParaFuncionarioPorPeriodo(
                    funcionario.getId(),
                    inicio.atStartOfDay(),
                    fim.atTime(LocalTime.MAX)
            );
        }

        return solicitacaoRepository.findVisiveisParaFuncionario(funcionario.getId());
    }

    @Transactional(readOnly = true)
    public Solicitacao obterPorId(Long id, Usuario usuario) {
        Solicitacao solicitacao = buscarPorId(id);
        if (usuario instanceof Cliente cliente) {
            validarPertencimento(solicitacao, cliente);
        }
        return solicitacao;
    }

    @Transactional(readOnly = true)
    public List<HistoricoSolicitacao> listarHistorico(Long id, Usuario usuario) {
        Solicitacao solicitacao = buscarPorId(id);
        if (usuario instanceof Cliente cliente) {
            validarPertencimento(solicitacao, cliente);
        }
        return historicoRepository.findBySolicitacaoIdOrderByDataHoraAsc(id);
    }

    private void registrarHistorico(
            Solicitacao solicitacao,
            EstadoSolicitacao estado,
            Funcionario origem,
            Funcionario destino
    ) {
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
                .orElseThrow(() -> new RegraNegocioException("Solicitacao nao encontrada."));
    }

    private void validarEstado(Solicitacao solicitacao, EstadoSolicitacao estadoEsperado) {
        if (solicitacao.getEstadoAtual() != estadoEsperado) {
            throw new RegraNegocioException("Acao nao permitida para o estado atual da solicitacao.");
        }
    }

    private void validarPertencimento(Solicitacao solicitacao, Cliente cliente) {
        if (cliente == null || !solicitacao.getCliente().getId().equals(cliente.getId())) {
            throw new RegraNegocioException("Esta solicitacao nao pertence a este cliente.");
        }
    }

    private void validarResponsavelSeRedirecionada(Solicitacao solicitacao, Funcionario funcionario) {
        if (solicitacao.getEstadoAtual() == EstadoSolicitacao.REDIRECIONADA
                && solicitacao.getFuncionarioResponsavel() != null
                && (funcionario == null || !solicitacao.getFuncionarioResponsavel().getId().equals(funcionario.getId()))) {
            throw new RegraNegocioException("Apenas o funcionario destinatario pode atender esta solicitacao redirecionada.");
        }
    }

    private LocalDate parseData(String valor, String campo) {
        try {
            return LocalDate.parse(valor.trim());
        } catch (DateTimeParseException e) {
            throw new RegraNegocioException("Informe a " + campo + " no formato aaaa-mm-dd.");
        }
    }

    private String limparTextoBruto(String texto) {
        if (texto == null) {
            return "";
        }
        String limpo = texto.trim();
        if (limpo.length() >= 2 && limpo.startsWith("\"") && limpo.endsWith("\"")) {
            limpo = limpo.substring(1, limpo.length() - 1).trim();
        }
        return limpo;
    }
}