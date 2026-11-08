package br.ufpr.trabalho_web.controller;

import br.ufpr.trabalho_web.dto.RelatorioReceitaDTO;
import br.ufpr.trabalho_web.service.RelatorioService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/relatorios")
public class RelatorioController {

    private final RelatorioService relatorioService;

    public RelatorioController(RelatorioService relatorioService) {
        this.relatorioService = relatorioService;
    }

    @GetMapping("/receitas")
    public RelatorioReceitaDTO porPeriodo(
            @RequestParam(required = false) String dataInicio,
            @RequestParam(required = false) String dataFim
    ) {
        return relatorioService.porPeriodo(dataInicio, dataFim);
    }

    @GetMapping("/receitas-categoria")
    public RelatorioReceitaDTO porCategoria() {
        return relatorioService.porCategoria();
    }

    @GetMapping("/receitas/pdf")
    public ResponseEntity<byte[]> pdfPorPeriodo(
            @RequestParam(required = false) String dataInicio,
            @RequestParam(required = false) String dataFim
    ) {
        return pdf(relatorioService.pdfPorPeriodo(dataInicio, dataFim), "receitas.pdf");
    }

    @GetMapping("/receitas-categoria/pdf")
    public ResponseEntity<byte[]> pdfPorCategoria() {
        return pdf(relatorioService.pdfPorCategoria(), "receitas-categoria.pdf");
    }

    private ResponseEntity<byte[]> pdf(byte[] arquivo, String nome) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nome + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(arquivo);
    }
}
