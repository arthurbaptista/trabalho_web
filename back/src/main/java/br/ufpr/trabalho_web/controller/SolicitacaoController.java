package br.ufpr.trabalho_web.controller;

import br.ufpr.trabalho_web.dto.SolicitacaoRequest;
import br.ufpr.trabalho_web.model.Cliente;
import br.ufpr.trabalho_web.model.Funcionario;
import br.ufpr.trabalho_web.model.HistoricoSolicitacao;
import br.ufpr.trabalho_web.model.Solicitacao;
import br.ufpr.trabalho_web.model.Usuario;
import br.ufpr.trabalho_web.service.SolicitacaoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/solicitacoes")
public class SolicitacaoController {

    private final SolicitacaoService solicitacaoService;

    public SolicitacaoController(SolicitacaoService solicitacaoService) {
        this.solicitacaoService = solicitacaoService;
    }

    @GetMapping
    public List<Solicitacao> listarTodas(
            @RequestAttribute(value = "usuario", required = false) Funcionario funcionario,
            @RequestParam(required = false) String filtro,
            @RequestParam(required = false) String dataInicio,
            @RequestParam(required = false) String dataFim
    ) {
        return solicitacaoService.listarParaFuncionario(funcionario, filtro, dataInicio, dataFim);
    }

    @GetMapping("/abertas")
    public List<Solicitacao> listarAbertas() {
        return solicitacaoService.listarAbertas();
    }

    @GetMapping("/cliente")
    public List<Solicitacao> listarDoCliente(@RequestAttribute("usuario") Cliente cliente) {
        return solicitacaoService.listarPorCliente(cliente);
    }

    @GetMapping("/{id}")
    public Solicitacao buscar(
            @PathVariable Long id,
            @RequestAttribute(value = "usuario", required = false) Usuario usuario
    ) {
        return solicitacaoService.obterPorId(id, usuario);
    }

    @GetMapping("/{id}/historico")
    public List<HistoricoSolicitacao> historico(
            @PathVariable Long id,
            @RequestAttribute(value = "usuario", required = false) Usuario usuario
    ) {
        return solicitacaoService.listarHistorico(id, usuario);
    }

    @PostMapping("/cliente")
    public ResponseEntity<Solicitacao> criar(
            @Valid @RequestBody SolicitacaoRequest request,
            @RequestAttribute("usuario") Cliente cliente
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(solicitacaoService.criarSolicitacao(request, cliente));
    }

    @PatchMapping("/{id}/orcar")
    public ResponseEntity<Solicitacao> orcar(
            @PathVariable Long id,
            @RequestBody(required = false) BigDecimal valor,
            @RequestAttribute("usuario") Funcionario funcionario
    ) {
        return ResponseEntity.ok(solicitacaoService.efetuarOrcamento(id, valor, funcionario));
    }

    @PatchMapping("/{id}/aprovar")
    public ResponseEntity<Solicitacao> aprovar(
            @PathVariable Long id,
            @RequestAttribute("usuario") Cliente cliente
    ) {
        return ResponseEntity.ok(solicitacaoService.aprovarServico(id, cliente));
    }

    @PatchMapping("/{id}/rejeitar")
    public ResponseEntity<Solicitacao> rejeitar(
            @PathVariable Long id,
            @RequestBody(required = false) String motivo,
            @RequestAttribute("usuario") Cliente cliente
    ) {
        return ResponseEntity.ok(solicitacaoService.rejeitarServico(id, motivo, cliente));
    }

    @PatchMapping("/{id}/resgatar")
    public ResponseEntity<Solicitacao> resgatar(
            @PathVariable Long id,
            @RequestAttribute("usuario") Cliente cliente
    ) {
        return ResponseEntity.ok(solicitacaoService.resgatarServico(id, cliente));
    }

    @PatchMapping("/{id}/manutencao")
    public ResponseEntity<Solicitacao> manutencao(
            @PathVariable Long id,
            @RequestBody(required = false) SolicitacaoRequest request,
            @RequestAttribute("usuario") Funcionario funcionario
    ) {
        String descricao = request == null ? null : request.getDescricaoManutencao();
        String orientacoes = request == null ? null : request.getOrientacoesCliente();
        return ResponseEntity.ok(solicitacaoService.efetuarManutencao(id, descricao, orientacoes, funcionario));
    }

    @PatchMapping("/{id}/redirecionar")
    public ResponseEntity<Solicitacao> redirecionar(
            @PathVariable Long id,
            @RequestBody(required = false) SolicitacaoRequest request,
            @RequestAttribute("usuario") Funcionario origem
    ) {
        Long destinoId = request == null ? null : request.getFuncionarioDestinoIdResolvido();
        return ResponseEntity.ok(solicitacaoService.redirecionarManutencao(id, origem, destinoId));
    }

    @PatchMapping("/{id}/pagar")
    public ResponseEntity<Solicitacao> pagar(
            @PathVariable Long id,
            @RequestAttribute("usuario") Cliente cliente
    ) {
        return ResponseEntity.ok(solicitacaoService.pagarServico(id, cliente));
    }

    @PatchMapping("/{id}/finalizar")
    public ResponseEntity<Solicitacao> finalizar(
            @PathVariable Long id,
            @RequestAttribute("usuario") Funcionario funcionario
    ) {
        return ResponseEntity.ok(solicitacaoService.finalizarSolicitacao(id, funcionario));
    }
}