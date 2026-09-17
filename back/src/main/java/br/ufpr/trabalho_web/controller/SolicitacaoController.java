package br.ufpr.trabalho_web.controller;

import br.ufpr.trabalho_web.dto.SolicitacaoRequest;
import br.ufpr.trabalho_web.model.HistoricoSolicitacao;
import br.ufpr.trabalho_web.model.Solicitacao;
import br.ufpr.trabalho_web.service.SolicitacaoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/solicitacoes")
public class SolicitacaoController {

    private final SolicitacaoService solicitacaoService;

    public SolicitacaoController(SolicitacaoService solicitacaoService) {
        this.solicitacaoService = solicitacaoService;
    }

    @PostMapping
    public ResponseEntity<Solicitacao> criar(@Valid @RequestBody SolicitacaoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(solicitacaoService.criarSolicitacao(request));
    }

    @GetMapping("/abertas")
    public List<Solicitacao> listarAbertas() {
        return solicitacaoService.getSolicitacoesAbertas();
    }

    @GetMapping("/cliente/{clienteId}")
    public List<Solicitacao> listarDoCliente(@PathVariable Long clienteId) {
        return solicitacaoService.getSolicitacoesCliente(clienteId);
    }

    @GetMapping("/{id}/historico")
    public List<HistoricoSolicitacao> historico(@PathVariable Long id) {
        return solicitacaoService.getHistorico(id);
    }
}
