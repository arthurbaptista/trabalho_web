package br.ufpr.trabalho_web.controller;

import br.ufpr.trabalho_web.dto.RelatorioReceitaDTO;
import br.ufpr.trabalho_web.service.RelatorioService;
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
}
