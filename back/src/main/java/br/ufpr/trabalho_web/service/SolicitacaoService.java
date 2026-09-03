package br.ufpr.trabalho_web.service;

import br.ufpr.trabalho_web.dto.SolicitacaoRequest;
import br.ufpr.trabalho_web.exception.RegraNegocioException;
import br.ufpr.trabalho_web.model.*;
import br.ufpr.trabalho_web.repository.CategoriaRepository;
import br.ufpr.trabalho_web.repository.HistoricoSolicitacaoRepository;
import br.ufpr.trabalho_web.repository.SolicitacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class SolicitacaoService {

    @Autowired
    private SolicitacaoRepository solicitacaoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private HistoricoSolicitacaoRepository historicoRepository;

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

    // public List<Solicitacao> getSolicitacoesCliente() {
//        Usuario usuario = usuarioService.getUsuarioAtual();
//        if (!(usuario instanceof Cliente)) {
//            throw new RuntimeException("Apenas clientes podem ver suas solicitações");
//        }

//        Cliente cliente = (Cliente) usuario;
        //   return solicitacaoRepository.findByClienteOrderByDataHoraAberturaAsc(cliente);
        // }

    public List<Solicitacao> getSolicitacoesAbertas() {
        return solicitacaoRepository.findByEstado(EstadoSolicitacao.ABERTA);
    }

    public Solicitacao efetuarOrcamento(Long solicitacaoId, BigDecimal valor) {
        Solicitacao solicitacao = solicitacaoRepository.findById(solicitacaoId)
                .orElseThrow(() -> new RuntimeException("Solicitação não encontrada"));



        //  Funcionario funcionario = (Funcionario) usuario;

        solicitacao.setValorOrcamento(valor);
        solicitacao.setEstadoAtual(EstadoSolicitacao.ORÇADA);

        Solicitacao salva = solicitacaoRepository.save(solicitacao);
        return salva;
    }
    public List<Solicitacao> getSolicitacoes(){
        return solicitacaoRepository.findAll();
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