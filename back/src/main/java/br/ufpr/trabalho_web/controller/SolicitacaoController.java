package br.ufpr.trabalho_web.controller;

import br.ufpr.trabalho_web.dto.FinalizacaoRequest;
import br.ufpr.trabalho_web.dto.ManutencaoRequest;
import br.ufpr.trabalho_web.dto.RedirecionamentoRequest;
import br.ufpr.trabalho_web.dto.RejeicaoRequest;
import br.ufpr.trabalho_web.dto.SolicitacaoRequest;
import br.ufpr.trabalho_web.model.HistoricoSolicitacao;
import br.ufpr.trabalho_web.model.Solicitacao;
import br.ufpr.trabalho_web.service.SolicitacaoService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
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

    @GetMapping("/funcionario/{funcionarioId}")
    public List<Solicitacao> listarParaFuncionario(
            @PathVariable Long funcionarioId,
            @RequestParam(defaultValue = "TODAS") String filtro,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim
    ) {
        return solicitacaoService.getSolicitacoesFuncionario(funcionarioId, filtro, inicio, fim);
    }

    @GetMapping("/{id}/historico")
    public List<HistoricoSolicitacao> historico(@PathVariable Long id) {
        return solicitacaoService.getHistorico(id);
    }

    @PostMapping("/{id}/aprovar")
    public ResponseEntity<Solicitacao> aprovar(@PathVariable Long id) {
        return ResponseEntity.ok(solicitacaoService.aprovarServico(id));
    }

    @PostMapping("/{id}/rejeitar")
    public ResponseEntity<Solicitacao> rejeitar(@PathVariable Long id, @Valid @RequestBody RejeicaoRequest request) {
        return ResponseEntity.ok(solicitacaoService.rejeitarServico(id, request.getMotivo()));
    }

    @PostMapping("/{id}/resgatar")
    public ResponseEntity<Solicitacao> resgatar(@PathVariable Long id) {
        return ResponseEntity.ok(solicitacaoService.resgatarServico(id));
    }

    @PostMapping("/{id}/pagar")
    public ResponseEntity<Solicitacao> pagar(@PathVariable Long id) {
        return ResponseEntity.ok(solicitacaoService.pagarServico(id));
    }

    @PostMapping("/{id}/manutencao")
    public ResponseEntity<Solicitacao> efetuarManutencao(@PathVariable Long id, @Valid @RequestBody ManutencaoRequest request) {
        return ResponseEntity.ok(solicitacaoService.efetuarManutencao(
                id,
                request.getFuncionarioId(),
                request.getDescricaoManutencao(),
                request.getOrientacoesCliente()
        ));
    }

    @PostMapping("/{id}/redirecionar")
    public ResponseEntity<Solicitacao> redirecionar(@PathVariable Long id, @Valid @RequestBody RedirecionamentoRequest request) {
        return ResponseEntity.ok(solicitacaoService.redirecionarManutencao(
                id,
                request.getFuncionarioOrigemId(),
                request.getFuncionarioDestinoId()
        ));
    }

    @PostMapping("/{id}/finalizar")
    public ResponseEntity<Solicitacao> finalizar(@PathVariable Long id, @Valid @RequestBody FinalizacaoRequest request) {
        return ResponseEntity.ok(solicitacaoService.finalizarServico(id, request.getFuncionarioId()));
    }
}
