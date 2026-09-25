package br.ufpr.trabalho_web.dto;

import jakarta.validation.constraints.NotNull;

public class FinalizacaoRequest {

    @NotNull(message = "O funcionario e obrigatorio.")
    private Long funcionarioId;

    public Long getFuncionarioId() { return funcionarioId; }
    public void setFuncionarioId(Long funcionarioId) { this.funcionarioId = funcionarioId; }
}
