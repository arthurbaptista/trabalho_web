package br.ufpr.trabalho_web.service;

import br.ufpr.trabalho_web.dto.SolicitacaoRequest;
import br.ufpr.trabalho_web.exception.RegraNegocioException;
import br.ufpr.trabalho_web.model.Categoria;
import br.ufpr.trabalho_web.model.Cliente;
import br.ufpr.trabalho_web.model.EstadoSolicitacao;
import br.ufpr.trabalho_web.model.Funcionario;
import br.ufpr.trabalho_web.model.HistoricoSolicitacao;
import br.ufpr.trabalho_web.model.Solicitacao;
import br.ufpr.trabalho_web.repository.CategoriaRepository;
import br.ufpr.trabalho_web.repository.ClienteRepository;
import br.ufpr.trabalho_web.repository.FuncionarioRepository;
import br.ufpr.trabalho_web.repository.HistoricoSolicitacaoRepository;
import br.ufpr.trabalho_web.repository.SolicitacaoRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class SolicitacaoService {

    private final SolicitacaoRepository solicitacaoRepository;
    private final CategoriaRepository categoriaRepository;
    private final ClienteRepository clienteRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final HistoricoSolicitacaoRepository historicoRepository;

    public SolicitacaoService(
            SolicitacaoRepository solicitacaoRepository,
            CategoriaRepository categoriaRepository,
            ClienteRepository clienteRepository,
            FuncionarioRepository funcionarioRepository,
            HistoricoSolicitacaoRepository historicoRepository
    ) {
        this.solicitacaoRepository = solicitacaoRepository;
        this.categoriaRepository = categoriaRepository;
        this.clienteRepository = clienteRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.historicoRepository = historicoRepository;
    }

    public Solicitacao criarSolicitacao(SolicitacaoRequest request) {
        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new RegraNegocioException("Cliente nao encontrado"));
        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new RegraNegocioException("Categoria nao encontrada"));

        Solicitacao solicitacao = new Solicitacao();
        solicitacao.setCliente(cliente);
        solicitacao.setCategoria(categoria);
        solicitacao.setDescricaoEquipamento(limitarDescricao(request.getDescricaoEquipamento()));
        solicitacao.setDescricaoDefeito(request.getDescricaoDefeito().trim());
        solicitacao.setEstadoAtual(EstadoSolicitacao.ABERTA);
        solicitacao.setDataHoraAbertura(LocalDateTime.now());
        solicitacao.setStatus(true);

        Solicitacao salva = solicitacaoRepository.save(solicitacao);
        adicionarHistorico(salva, EstadoSolicitacao.ABERTA, null, null);
        return salva;
    }

    public List<Solicitacao> getSolicitacoesCliente(Long clienteId) {
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new RegraNegocioException("Cliente nao encontrado"));
        return solicitacaoRepository.findByClienteOrderByDataHoraAberturaAsc(cliente);
    }

    public List<Solicitacao> getSolicitacoesAbertas() {
        return solicitacaoRepository.findByEstadoAtual(EstadoSolicitacao.ABERTA);
    }

    public List<HistoricoSolicitacao> getHistorico(Long solicitacaoId) {
        buscarPorId(solicitacaoId);
        return historicoRepository.findBySolicitacaoIdOrderByDataHoraAsc(solicitacaoId);
    }

    public Solicitacao efetuarOrcamento(Long solicitacaoId, BigDecimal valor, Long funcionarioId) {
        if (valor == null || valor.signum() <= 0) {
            throw new RegraNegocioException("O valor do orcamento deve ser maior que zero");
        }

        Funcionario funcionario = buscarFuncionario(funcionarioId);
        Solicitacao solicitacao = exigirEstado(solicitacaoId, EstadoSolicitacao.ABERTA,
                "So e possivel orcar solicitacao no estado ABERTA");

        solicitacao.setValorOrcamento(valor);
        solicitacao.setEstadoAtual(EstadoSolicitacao.ORCADA);
        solicitacao.setFuncionarioResponsavel(funcionario);
        Solicitacao salva = solicitacaoRepository.save(solicitacao);
        adicionarHistorico(salva, EstadoSolicitacao.ORCADA, funcionario, null);
        return salva;
    }

    public Solicitacao aprovarServico(Long solicitacaoId) {
        Solicitacao solicitacao = exigirEstado(solicitacaoId, EstadoSolicitacao.ORCADA,
                "So e possivel aprovar solicitacao no estado ORCADA");

        solicitacao.setEstadoAtual(EstadoSolicitacao.APROVADA);
        Solicitacao salva = solicitacaoRepository.save(solicitacao);
        adicionarHistorico(salva, EstadoSolicitacao.APROVADA, null, null);
        return salva;
    }

    public Solicitacao rejeitarServico(Long solicitacaoId, String motivo) {
        if (motivo == null || motivo.isBlank()) {
            throw new RegraNegocioException("O motivo da rejeicao e obrigatorio");
        }

        Solicitacao solicitacao = exigirEstado(solicitacaoId, EstadoSolicitacao.ORCADA,
                "So e possivel rejeitar solicitacao no estado ORCADA");

        solicitacao.setMotivoRejeicao(motivo.trim());
        solicitacao.setEstadoAtual(EstadoSolicitacao.REJEITADA);
        Solicitacao salva = solicitacaoRepository.save(solicitacao);
        adicionarHistorico(salva, EstadoSolicitacao.REJEITADA, null, null);
        return salva;
    }

    public Solicitacao resgatarServico(Long solicitacaoId) {
        Solicitacao solicitacao = exigirEstado(solicitacaoId, EstadoSolicitacao.REJEITADA,
                "So e possivel resgatar solicitacao no estado REJEITADA");

        solicitacao.setEstadoAtual(EstadoSolicitacao.APROVADA);
        Solicitacao salva = solicitacaoRepository.save(solicitacao);
        adicionarHistorico(salva, EstadoSolicitacao.APROVADA, null, null);
        return salva;
    }

    public Solicitacao pagarServico(Long solicitacaoId) {
        Solicitacao solicitacao = exigirEstado(solicitacaoId, EstadoSolicitacao.ARRUMADA,
                "So e possivel pagar solicitacao no estado ARRUMADA");

        solicitacao.setEstadoAtual(EstadoSolicitacao.PAGA);
        Solicitacao salva = solicitacaoRepository.save(solicitacao);
        adicionarHistorico(salva, EstadoSolicitacao.PAGA, null, null);
        return salva;
    }

    public Solicitacao efetuarManutencao(
            Long solicitacaoId,
            Long funcionarioId,
            String descricaoManutencao,
            String orientacoesCliente
    ) {
        if (descricaoManutencao == null || descricaoManutencao.isBlank()) {
            throw new RegraNegocioException("A descricao da manutencao e obrigatoria");
        }
        if (orientacoesCliente == null || orientacoesCliente.isBlank()) {
            throw new RegraNegocioException("As orientacoes para o cliente sao obrigatorias");
        }

        Funcionario funcionario = buscarFuncionario(funcionarioId);
        Solicitacao solicitacao = buscarPorId(solicitacaoId);
        exigirEstadoDentre(solicitacao, "So e possivel efetuar manutencao em solicitacao APROVADA ou REDIRECIONADA",
                EstadoSolicitacao.APROVADA, EstadoSolicitacao.REDIRECIONADA);

        solicitacao.setDescricaoManutencao(descricaoManutencao.trim());
        solicitacao.setOrientacoesCliente(orientacoesCliente.trim());
        solicitacao.setEstadoAtual(EstadoSolicitacao.ARRUMADA);
        solicitacao.setFuncionarioResponsavel(funcionario);
        Solicitacao salva = solicitacaoRepository.save(solicitacao);
        adicionarHistorico(salva, EstadoSolicitacao.ARRUMADA, funcionario, null);
        return salva;
    }

    public Solicitacao redirecionarManutencao(Long solicitacaoId, Long funcionarioOrigemId, Long funcionarioDestinoId) {
        if (funcionarioOrigemId != null && funcionarioOrigemId.equals(funcionarioDestinoId)) {
            throw new RegraNegocioException("Nao e permitido redirecionar a solicitacao para o mesmo funcionario");
        }

        Funcionario origem = buscarFuncionario(funcionarioOrigemId);
        Funcionario destino = buscarFuncionario(funcionarioDestinoId);

        Solicitacao solicitacao = buscarPorId(solicitacaoId);
        exigirEstadoDentre(solicitacao, "So e possivel redirecionar solicitacao APROVADA ou REDIRECIONADA",
                EstadoSolicitacao.APROVADA, EstadoSolicitacao.REDIRECIONADA);

        solicitacao.setEstadoAtual(EstadoSolicitacao.REDIRECIONADA);
        solicitacao.setFuncionarioResponsavel(destino);
        Solicitacao salva = solicitacaoRepository.save(solicitacao);
        adicionarHistorico(salva, EstadoSolicitacao.REDIRECIONADA, origem, destino);
        return salva;
    }

    public Solicitacao finalizarServico(Long solicitacaoId, Long funcionarioId) {
        Funcionario funcionario = buscarFuncionario(funcionarioId);
        Solicitacao solicitacao = exigirEstado(solicitacaoId, EstadoSolicitacao.PAGA,
                "So e possivel finalizar solicitacao no estado PAGA");

        solicitacao.setEstadoAtual(EstadoSolicitacao.FINALIZADA);
        solicitacao.setFuncionarioResponsavel(funcionario);
        Solicitacao salva = solicitacaoRepository.save(solicitacao);
        adicionarHistorico(salva, EstadoSolicitacao.FINALIZADA, funcionario, null);
        return salva;
    }

    public List<Solicitacao> getSolicitacoesFuncionario(Long funcionarioId, String filtro, LocalDate dataInicio, LocalDate dataFim) {
        Funcionario funcionario = buscarFuncionario(funcionarioId);
        List<Solicitacao> solicitacoes = buscarPorFiltro(filtro, dataInicio, dataFim);

        return solicitacoes.stream()
                .filter(solicitacao -> podeSerVistaPeloFuncionario(solicitacao, funcionario))
                .toList();
    }

    public List<Solicitacao> getSolicitacoes() {
        return solicitacaoRepository.findAll();
    }

    private List<Solicitacao> buscarPorFiltro(String filtro, LocalDate dataInicio, LocalDate dataFim) {
        String filtroNormalizado = filtro == null ? "TODAS" : filtro.trim().toUpperCase();

        return switch (filtroNormalizado) {
            case "HOJE" -> solicitacaoRepository.findByDataHoraAberturaBetweenOrderByDataHoraAberturaAsc(
                    LocalDate.now().atStartOfDay(),
                    LocalDate.now().atTime(LocalTime.MAX)
            );
            case "PERIODO" -> {
                if (dataInicio == null || dataFim == null) {
                    throw new RegraNegocioException("Informe a data inicial e a data final do periodo");
                }
                yield solicitacaoRepository.findByDataHoraAberturaBetweenOrderByDataHoraAberturaAsc(
                        dataInicio.atStartOfDay(),
                        dataFim.atTime(LocalTime.MAX)
                );
            }
            case "TODAS" -> solicitacaoRepository.findAllByOrderByDataHoraAberturaAsc();
            default -> throw new RegraNegocioException("Filtro invalido. Utilize HOJE, PERIODO ou TODAS");
        };
    }

    private boolean podeSerVistaPeloFuncionario(Solicitacao solicitacao, Funcionario funcionario) {
        if (solicitacao.getEstadoAtual() != EstadoSolicitacao.REDIRECIONADA) {
            return true;
        }
        Funcionario destino = solicitacao.getFuncionarioResponsavel();
        return destino != null && destino.getId().equals(funcionario.getId());
    }

    private Solicitacao exigirEstado(Long solicitacaoId, EstadoSolicitacao estadoExigido, String mensagemErro) {
        Solicitacao solicitacao = buscarPorId(solicitacaoId);
        if (solicitacao.getEstadoAtual() != estadoExigido) {
            throw new RegraNegocioException(mensagemErro);
        }
        return solicitacao;
    }

    private void exigirEstadoDentre(Solicitacao solicitacao, String mensagemErro, EstadoSolicitacao... estadosPermitidos) {
        for (EstadoSolicitacao estado : estadosPermitidos) {
            if (solicitacao.getEstadoAtual() == estado) {
                return;
            }
        }
        throw new RegraNegocioException(mensagemErro);
    }

    private Solicitacao buscarPorId(Long id) {
        return solicitacaoRepository.findById(id)
                .orElseThrow(() -> new RegraNegocioException("Solicitacao nao encontrada"));
    }

    private Funcionario buscarFuncionario(Long id) {
        if (id == null) {
            throw new RegraNegocioException("O funcionario e obrigatorio");
        }
        return funcionarioRepository.findById(id)
                .orElseThrow(() -> new RegraNegocioException("Funcionario nao encontrado"));
    }

    private void adicionarHistorico(
            Solicitacao solicitacao,
            EstadoSolicitacao estadoNovo,
            Funcionario funcionarioOrigem,
            Funcionario funcionarioDestino
    ) {
        HistoricoSolicitacao historico = new HistoricoSolicitacao();
        historico.setSolicitacao(solicitacao);
        historico.setDataHora(LocalDateTime.now());
        historico.setEstadoAlcancado(estadoNovo);
        historico.setFuncionarioOrigem(funcionarioOrigem);
        historico.setFuncionarioDestino(funcionarioDestino);
        historicoRepository.save(historico);
    }

    private String limitarDescricao(String descricao) {
        String texto = descricao == null ? "" : descricao.trim();
        return texto.length() <= 30 ? texto : texto.substring(0, 30);
    }
}
