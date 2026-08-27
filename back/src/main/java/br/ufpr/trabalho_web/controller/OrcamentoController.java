package br.ufpr.trabalho_web.controller;

import br.ufpr.trabalho_web.dto.OrcamentoRequest;
import br.ufpr.trabalho_web.model.Solicitacao;
import br.ufpr.trabalho_web.service.SolicitacaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/solicitacoes/{id}/efetuar-orcamento")
public class OrcamentoController {

    @Autowired
    private SolicitacaoService solicitacaoService;

    @PostMapping
    public ResponseEntity<?> efetuarOrcamento(@RequestBody OrcamentoRequest request) {
        try {
            Solicitacao solicitacao = solicitacaoService.efetuarOrcamento(
                request.getSolicitacaoId(), 
                request.getValor()
            );
            return ResponseEntity.ok(solicitacao);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}