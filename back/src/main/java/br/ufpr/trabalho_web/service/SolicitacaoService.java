package br.ufpr.trabalho_web.service;

import br.ufpr.trabalho_web.exception.RegraNegocioException;
import br.ufpr.trabalho_web.model.*;
import br.ufpr.trabalho_web.repository.FuncionarioRepository;
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

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    public List<Solicitacao> buscarTodas() {
        return solicitacaoRepository.findAll();
    }

    public Solicitacao buscarPorId(Long id) {
        return solicitacaoRepository.findById(id)
                .orElseThrow(() -> new RegraNegocioException("Solicitação não encontrada."));
    }

    @Transactional
    public Solicitacao criarSolicitacao(Solicitacao solicitacao, Cliente cliente) {
        solicitacao.setCliente(cliente);
        solicitacao.setData(LocalDateTime.now());
        solicitacao.setStatus(EstadoSolicitacao.ABERTA);

        Solicitacao salva = solicitacaoRepository.save(solicitacao);
        registrarHistorico(salva, null, null, "Solicitação criada.");
        return salva;
    }

    @Transactional
    public Solicitacao efetuarOrcamento(Long id, BigDecimal valor, Funcionario funcionario) {
        Solicitacao solicitacao = buscarPorId(id);
        solicitacao.setStatus(EstadoSolicitacao.ORCADA);
        solicitacao.setValor(valor);
        solicitacaoRepository.save(solicitacao);

        registrarHistorico(solicitacao, funcionario, null, "Orçamento efetuado no valor de R$ " + valor);
        return solicitacao;
    }

    @Transactional
    public Solicitacao aprovarServico(Long id, Cliente cliente) {
        Solicitacao solicitacao = buscarPorId(id);
        solicitacao.setStatus(EstadoSolicitacao.APROVADA);
        solicitacaoRepository.save(solicitacao);

        registrarHistorico(solicitacao, null, null, "Serviço aprovado pelo cliente " + cliente.getNome());
        return solicitacao;
    }

    @Transactional
    public Solicitacao rejeitarServico(Long id, String motivo, Cliente cliente) {
        Solicitacao solicitacao = buscarPorId(id);
        solicitacao.setStatus(EstadoSolicitacao.REJEITADA);
        solicitacao.setMotivo(motivo);
        solicitacaoRepository.save(solicitacao);

        registrarHistorico(solicitacao, null, null, "Serviço rejeitado. Motivo: " + motivo);
        return solicitacao;
    }

    @Transactional
    public Solicitacao resgatarServico(Long id, Cliente cliente) {
        Solicitacao solicitacao = buscarPorId(id);
        solicitacao.setStatus(EstadoSolicitacao.APROVADA);
        solicitacaoRepository.save(solicitacao);

        registrarHistorico(solicitacao, null, null, "Serviço resgatado de rejeitada para aprovada.");
        return solicitacao;
    }

    @Transactional
    public Solicitacao efetuarManutencao(Long id, String descricao, String orientacoes, Funcionario funcionario) {
        Solicitacao solicitacao = buscarPorId(id);
        solicitacao.setStatus(EstadoSolicitacao.ARRUMADA);
        solicitacao.setDescricao(descricao);
        solicitacao.setOrientacoes(orientacoes);
        solicitacaoRepository.save(solicitacao);

        registrarHistorico(solicitacao, funcionario, null, "Manutenção efetuada.");
        return solicitacao;
    }

    @Transactional
    public Solicitacao redirecionarManutencao(Long id, Long origemId, Long destinoId) {
        if (origemId.equals(destinoId)) {
            throw new RegraNegocioException("Não é possível redirecionar a manutenção para si mesmo.");
        }

        Solicitacao solicitacao = buscarPorId(id);
        Funcionario origem = funcionarioRepository.findById(origemId)
                .orElseThrow(() -> new RegraNegocioException("Funcionário de origem não encontrado."));
        Funcionario destino = funcionarioRepository.findById(destinoId)
                .orElseThrow(() -> new RegraNegocioException("Funcionário de destino não encontrado."));

        solicitacao.setStatus(EstadoSolicitacao.REDIRECIONADA);
        solicitacaoRepository.save(solicitacao);

        registrarHistorico(solicitacao, origem, destino, "Solicitação redirecionada para " + destino.getNome());
        return solicitacao;
    }

    @Transactional
    public Solicitacao pagarServico(Long id, Cliente cliente) {
        Solicitacao solicitacao = buscarPorId(id);
        solicitacao.setStatus(EstadoSolicitacao.PAGA);
        solicitacaoRepository.save(solicitacao);

        registrarHistorico(solicitacao, null, null, "Pagamento do serviço confirmado pelo cliente.");
        return solicitacao;
    }

    @Transactional
    public Solicitacao finalizarSolicitacao(Long id, Funcionario funcionario) {
        Solicitacao solicitacao = buscarPorId(id);
        solicitacao.setStatus(EstadoSolicitacao.FINALIZADA);
        solicitacaoRepository.save(solicitacao);
k
        registrarHistorico(solicitacao, funcionario, null, "Solicitação finalizada.");
        return solicitacao;
    }

    private void registrarHistorico(Solicitacao solicitacao, Funcionario origem, Funcionario destino, String observacao) {
        HistoricoSolicitacao historico = new HistoricoSolicitacao();
        historico.setSolicitacao(solicitacao);
        historico.setDataHora(LocalDateTime.now());
        historico.setEstadoAlcancado(solicitacao.getStatus());

        if (origem != null) {
            historico.setFuncionarioOrigem(origem);
        }
        if (destino != null) {
            historico.setFuncionarioDestino(destino);
        }

        historico.setObservacao(observacao);
        historicoRepository.save(historico);
    }
}