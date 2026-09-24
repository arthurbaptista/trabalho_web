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
}