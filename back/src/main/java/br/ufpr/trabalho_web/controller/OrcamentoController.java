package br.ufpr.trabalho_web.controller;

import br.ufpr.trabalho_web.dto.OrcamentoRequest;
import br.ufpr.trabalho_web.model.Funcionario;
import br.ufpr.trabalho_web.model.Solicitacao;
import br.ufpr.trabalho_web.service.SolicitacaoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/solicitacoes/{id}/orcamento")
public class OrcamentoController {

    private final SolicitacaoService solicitacaoService;

    public OrcamentoController(SolicitacaoService solicitacaoService) {
        this.solicitacaoService = solicitacaoService;
    }

    @PostMapping
    public ResponseEntity<Solicitacao> efetuarOrcamento(
            @PathVariable Long id,
            @RequestBody OrcamentoRequest request,
            @RequestAttribute("usuario") Funcionario funcionario
    ) {
        return ResponseEntity.ok(solicitacaoService.efetuarOrcamento(id, request.getValor(), funcionario));
    }
}