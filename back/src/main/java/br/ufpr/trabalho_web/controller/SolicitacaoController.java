package br.ufpr.trabalho_web.controller;

import br.ufpr.trabalho_web.dto.SolicitacaoRequest;
import br.ufpr.trabalho_web.model.Cliente;
import br.ufpr.trabalho_web.model.Funcionario;
import br.ufpr.trabalho_web.model.HistoricoSolicitacao;
import br.ufpr.trabalho_web.model.Solicitacao;
import br.ufpr.trabalho_web.service.SolicitacaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/solicitacoes")
public class SolicitacaoController {

    @Autowired
    private SolicitacaoService solicitacaoService;

    @GetMapping
    public List<Solicitacao> listarTodas() {
        return solicitacaoService.listarTodas();
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
    public Solicitacao buscar(@PathVariable Long id) {
        return solicitacaoService.obterPorId(id);
    }

    @GetMapping("/{id}/historico")
    public List<HistoricoSolicitacao> historico(@PathVariable Long id) {
        return solicitacaoService.listarHistorico(id);
    }

    @PostMapping("/cliente")
    public ResponseEntity<Solicitacao> criar(@RequestBody Solicitacao solicitacao, @RequestAttribute("usuario") Cliente cliente) {
        return ResponseEntity.status(HttpStatus.CREATED).body(solicitacaoService.criarSolicitacao(solicitacao, cliente));
    }

    @PatchMapping("/{id}/orcar")
    public ResponseEntity<Solicitacao> orcar(@PathVariable Long id, @RequestBody BigDecimal valor, @RequestAttribute("usuario") Funcionario funcionario) {
        return ResponseEntity.ok(solicitacaoService.efetuarOrcamento(id, valor, funcionario));
    }

    @PatchMapping("/{id}/aprovar")
    public ResponseEntity<Solicitacao> aprovar(@PathVariable Long id, @RequestAttribute("usuario") Cliente cliente) {
        return ResponseEntity.ok(solicitacaoService.aprovarServico(id, cliente));
    }

    @PatchMapping("/{id}/rejeitar")
    public ResponseEntity<Solicitacao> rejeitar(@PathVariable Long id, @RequestBody String motivo, @RequestAttribute("usuario") Cliente cliente) {
        return ResponseEntity.ok(solicitacaoService.rejeitarServico(id, motivo, cliente));
    }

    @PatchMapping("/{id}/resgatar")
    public ResponseEntity<Solicitacao> resgatar(@PathVariable Long id, @RequestAttribute("usuario") Cliente cliente) {
        return ResponseEntity.ok(solicitacaoService.resgatarServico(id, cliente));
    }

    @PatchMapping("/{id}/manutencao")
    public ResponseEntity<Solicitacao> manutencao(@PathVariable Long id, @RequestBody SolicitacaoRequest request, @RequestAttribute("usuario") Funcionario funcionario) {
        return ResponseEntity.ok(solicitacaoService.efetuarManutencao(id, request.getDescricaoManutencao(), request.getOrientacoesCliente(), funcionario));
    }

    @PatchMapping("/{id}/redirecionar")
    public ResponseEntity<Solicitacao> redirecionar(@PathVariable Long id, @RequestBody Funcionario destino, @RequestAttribute("usuario") Funcionario origem) {
        return ResponseEntity.ok(solicitacaoService.redirecionarManutencao(id, origem, destino));
    }

    @PatchMapping("/{id}/pagar")
    public ResponseEntity<Solicitacao> pagar(@PathVariable Long id, @RequestAttribute("usuario") Cliente cliente) {
        return ResponseEntity.ok(solicitacaoService.pagarServico(id, cliente));
    }

    @PatchMapping("/{id}/finalizar")
    public ResponseEntity<Solicitacao> finalizar(@PathVariable Long id, @RequestAttribute("usuario") Funcionario funcionario) {
        return ResponseEntity.ok(solicitacaoService.finalizarSolicitacao(id, funcionario));
    }
}