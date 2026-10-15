package br.ufpr.trabalho_web.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class RelatorioReceitaDTO {

    private List<RelatorioLinhaDTO> linhas = new ArrayList<>();
    private int quantidade;
    private BigDecimal total = BigDecimal.ZERO;

    public RelatorioReceitaDTO() {
    }

    public RelatorioReceitaDTO(List<RelatorioLinhaDTO> linhas, int quantidade, BigDecimal total) {
        this.linhas = linhas;
        this.quantidade = quantidade;
        this.total = total;
    }

    public List<RelatorioLinhaDTO> getLinhas() {
        return linhas;
    }

    public void setLinhas(List<RelatorioLinhaDTO> linhas) {
        this.linhas = linhas;
    }

    public int getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(int quantidade) {
        this.quantidade = quantidade;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }
}
