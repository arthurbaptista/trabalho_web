package br.ufpr.trabalho_web.service;

import br.ufpr.trabalho_web.dto.SolicitacaoRequest;
import br.ufpr.trabalho_web.dto.SolicitacaoResumoDTO;
import br.ufpr.trabalho_web.exception.RegraNegocioException;
import br.ufpr.trabalho_web.model.*;
import br.ufpr.trabalho_web.repository.CategoriaRepository;
import br.ufpr.trabalho_web.repository.ClienteRepository;
import br.ufpr.trabalho_web.repository.HistoricoSolicitacaoRepository;
import br.ufpr.trabalho_web.repository.SolicitacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SolicitacaoService {

    @Autowired
    private SolicitacaoRepository solicitacaoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private HistoricoSolicitacaoRepository historicoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    public Solicitacao criarSolicitacao(SolicitacaoRequest request) {
        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));


        Solicitacao solicitacao = new Solicitacao();
        solicitacao.setDescricaoEquipamento(request.getDescricaoEquipamento());
        solicitacao.setCategoria(categoria);
        solicitacao.setDescricaoDefeito(request.getDescricaoDefeito());
        solicitacao.setEstadoAtual(EstadoSolicitacao.ABERTA);

        Solicitacao salva = solicitacaoRepository.save(solicitacao);
        adicionarHistorico(salva, null, EstadoSolicitacao.ABERTA, "Solicitação criada");
        return salva;
    }

    public List<SolicitacaoResumoDTO> listarDoCliente(String email) {
        Cliente cliente = clienteRepository.findByEmail(email);
        if (cliente == null) {
            throw new RegraNegocioException("Apenas clientes podem ver a pagina inicial de solicitacoes.");
        }

        return solicitacaoRepository.findByClienteOrderByDataHoraAberturaAsc(cliente)
                .stream()
                .map(this::paraResumo)
                .toList();
    }

    public SolicitacaoResumoDTO criarDoCliente(String email, SolicitacaoRequest request) {
        Cliente cliente = clienteRepository.findByEmail(email);
        if (cliente == null) {
            throw new RegraNegocioException("Apenas clientes podem abrir solicitacoes.");
        }

        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new RegraNegocioException("Categoria nao encontrada."));

        String descricao = request.getDescricaoEquipamento() == null
                ? ""
                : request.getDescricaoEquipamento().trim();
        String defeito = request.getDescricaoDefeito() == null
                ? ""
                : request.getDescricaoDefeito().trim();

        if (descricao.isEmpty()) {
            throw new RegraNegocioException("Informe a descricao do equipamento.");
        }
        if (descricao.length() > 30) {
            descricao = descricao.substring(0, 30);
        }
        if (defeito.isEmpty()) {
            throw new RegraNegocioException("Informe a descricao do defeito.");
        }

        Solicitacao solicitacao = new Solicitacao();
        solicitacao.setCliente(cliente);
        solicitacao.setCategoria(categoria);
        solicitacao.setDescricaoEquipamento(descricao);
        solicitacao.setDescricaoDefeito(defeito);
        solicitacao.setDataHoraAbertura(LocalDateTime.now());
        solicitacao.setEstadoAtual(EstadoSolicitacao.ABERTA);
        solicitacao.setStatus(true);

        return paraResumo(solicitacaoRepository.save(solicitacao));
    }

    public List<Solicitacao> getSolicitacoesAbertas() {
        return solicitacaoRepository.findByEstadoAtual(EstadoSolicitacao.ABERTA);
    }

    public Solicitacao efetuarOrcamento(Long solicitacaoId, BigDecimal valor) {
        Solicitacao solicitacao = solicitacaoRepository.findById(solicitacaoId)
                .orElseThrow(() -> new RuntimeException("Solicitação não encontrada"));



        //  Funcionario funcionario = (Funcionario) usuario;

        solicitacao.setValorOrcamento(valor);
        solicitacao.setEstadoAtual(EstadoSolicitacao.ORCADA);

        Solicitacao salva = solicitacaoRepository.save(solicitacao);
        return salva;
    }
    public List<Solicitacao> getSolicitacoes(){
        return solicitacaoRepository.findAll();
    }

    private SolicitacaoResumoDTO paraResumo(Solicitacao solicitacao) {
        String descricao = solicitacao.getDescricaoEquipamento() == null
                ? ""
                : solicitacao.getDescricaoEquipamento();
        if (descricao.length() > 30) {
            descricao = descricao.substring(0, 30);
        }

        String categoria = solicitacao.getCategoria() == null ? "" : solicitacao.getCategoria().getNome();

        return new SolicitacaoResumoDTO(
                solicitacao.getId(),
                solicitacao.getDataHoraAbertura(),
                descricao,
                categoria,
                solicitacao.getEstadoAtual().name(),
                solicitacao.getValorOrcamento()
        );
    }

    private void adicionarHistorico(Solicitacao solicitacao, EstadoSolicitacao estadoAnterior,
                                    EstadoSolicitacao estadoNovo, String observacao) {
        HistoricoSolicitacao historico = new HistoricoSolicitacao();

        //        historico.setEstadoAnterior(estadoAnterior);
//         historico.setEstadoNovo(estadoNovo);
        //       historico.setObservacao(observacao);
        historicoRepository.save(historico);
    }

}