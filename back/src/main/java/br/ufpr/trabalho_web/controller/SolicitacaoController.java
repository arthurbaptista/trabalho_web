package br.ufpr.trabalho_web.controller;

import br.ufpr.trabalho_web.dto.SolicitacaoRequest;
import br.ufpr.trabalho_web.dto.SolicitacaoResumoDTO;
import br.ufpr.trabalho_web.exception.RegraNegocioException;
import br.ufpr.trabalho_web.service.SolicitacaoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
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

    @GetMapping
    public ResponseEntity<List<SolicitacaoResumoDTO>> listarMinhas(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new RegraNegocioException("Sessao expirada. Faca login novamente.");
        }

        return ResponseEntity.ok(solicitacaoService.listarDoCliente(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<SolicitacaoResumoDTO> criar(
            @RequestBody SolicitacaoRequest request,
            Authentication authentication
    ) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new RegraNegocioException("Sessao expirada. Faca login novamente.");
        }

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(solicitacaoService.criarDoCliente(authentication.getName(), request));
    }
}
