package br.ufpr.trabalho_web.service;

import br.ufpr.trabalho_web.dto.SolicitacaoRequest;
import br.ufpr.trabalho_web.exception.RegraNegocioException;
import br.ufpr.trabalho_web.model.Categoria;
import br.ufpr.trabalho_web.model.Cliente;
import br.ufpr.trabalho_web.model.EstadoSolicitacao;
import br.ufpr.trabalho_web.model.HistoricoSolicitacao;
import br.ufpr.trabalho_web.model.Solicitacao;
import br.ufpr.trabalho_web.repository.CategoriaRepository;
import br.ufpr.trabalho_web.repository.ClienteRepository;
import br.ufpr.trabalho_web.repository.HistoricoSolicitacaoRepository;
import br.ufpr.trabalho_web.repository.SolicitacaoRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SolicitacaoService {

    private final SolicitacaoRepository solicitacaoRepository;
    private final CategoriaRepository categoriaRepository;
    private final ClienteRepository clienteRepository;
    private final HistoricoSolicitacaoRepository historicoRepository;

    public SolicitacaoService(
            SolicitacaoRepository solicitacaoRepository,
            CategoriaRepository categoriaRepository,
            ClienteRepository clienteRepository,
            HistoricoSolicitacaoRepository historicoRepository
    ) {
        this.solicitacaoRepository = solicitacaoRepository;
        this.categoriaRepository = categoriaRepository;
        this.clienteRepository = clienteRepository;
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
        adicionarHistorico(salva, EstadoSolicitacao.ABERTA);
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

    public Solicitacao efetuarOrcamento(Long solicitacaoId, BigDecimal valor) {
        if (valor == null || valor.signum() <= 0) {
            throw new RegraNegocioException("O valor do orcamento deve ser maior que zero");
        }

        Solicitacao solicitacao = buscarPorId(solicitacaoId);
        if (solicitacao.getEstadoAtual() != EstadoSolicitacao.ABERTA) {
            throw new RegraNegocioException("So e possivel orcar solicitacao no estado ABERTA");
        }

        solicitacao.setValorOrcamento(valor);
        solicitacao.setEstadoAtual(EstadoSolicitacao.ORCADA);
        Solicitacao salva = solicitacaoRepository.save(solicitacao);
        adicionarHistorico(salva, EstadoSolicitacao.ORCADA);
        return salva;
    }

    public List<Solicitacao> getSolicitacoes() {
        return solicitacaoRepository.findAll();
    }

    private Solicitacao buscarPorId(Long id) {
        return solicitacaoRepository.findById(id)
                .orElseThrow(() -> new RegraNegocioException("Solicitacao nao encontrada"));
    }

    private void adicionarHistorico(Solicitacao solicitacao, EstadoSolicitacao estadoNovo) {
        HistoricoSolicitacao historico = new HistoricoSolicitacao();
        historico.setSolicitacao(solicitacao);
        historico.setDataHora(LocalDateTime.now());
        historico.setEstadoAlcancado(estadoNovo);
        historicoRepository.save(historico);
    }

    private String limitarDescricao(String descricao) {
        String texto = descricao == null ? "" : descricao.trim();
        return texto.length() <= 30 ? texto : texto.substring(0, 30);
    }
}
