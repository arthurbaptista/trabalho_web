package br.ufpr.trabalho_web.dto;

import java.math.BigDecimal;

public class RelatorioLinhaDTO {

    private String chave;
    private String rotulo;
    private int quantidade;
    private BigDecimal total;

    public RelatorioLinhaDTO() {
    }

    public RelatorioLinhaDTO(String chave, String rotulo, int quantidade, BigDecimal total) {
        this.chave = chave;
        this.rotulo = rotulo;
        this.quantidade = quantidade;
        this.total = total;
    }

    public String getChave() {
        return chave;
    }

    public void setChave(String chave) {
        this.chave = chave;
    }

    public String getRotulo() {
        return rotulo;
    }

    public void setRotulo(String rotulo) {
        this.rotulo = rotulo;
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
