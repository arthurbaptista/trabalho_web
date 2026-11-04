package br.ufpr.trabalho_web.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public class OrcamentoRequest {

    private Long funcionarioId;

    @NotNull(message = "O valor do orcamento e obrigatorio.")
    @Positive(message = "O valor do orcamento deve ser maior que zero.")
    private BigDecimal valor;

    public Long getFuncionarioId() {
        return funcionarioId;
    }

    public void setFuncionarioId(Long funcionarioId) {
        this.funcionarioId = funcionarioId;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }
}