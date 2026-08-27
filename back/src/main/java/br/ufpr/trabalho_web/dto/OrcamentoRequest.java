// Arquivo: src/main/java/com/maintech/backend/dto/OrcamentoRequest.java
package br.ufpr.trabalho_web.dto;

import java.math.BigDecimal;

public class OrcamentoRequest {
    private Long solicitacaoId;
    private BigDecimal valor;

    // Getters e Setters
    public Long getSolicitacaoId() { return solicitacaoId; }
    public void setSolicitacaoId(Long solicitacaoId) { this.solicitacaoId = solicitacaoId; }
    
    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }
}