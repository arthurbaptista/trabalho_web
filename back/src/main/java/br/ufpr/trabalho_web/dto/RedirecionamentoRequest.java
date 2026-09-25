package br.ufpr.trabalho_web.dto;

import jakarta.validation.constraints.NotNull;

public class RedirecionamentoRequest {

    @NotNull(message = "O funcionario de origem e obrigatorio.")
    private Long funcionarioOrigemId;

    @NotNull(message = "O funcionario de destino e obrigatorio.")
    private Long funcionarioDestinoId;

    public Long getFuncionarioOrigemId() { return funcionarioOrigemId; }
    public void setFuncionarioOrigemId(Long funcionarioOrigemId) { this.funcionarioOrigemId = funcionarioOrigemId; }

    public Long getFuncionarioDestinoId() { return funcionarioDestinoId; }
    public void setFuncionarioDestinoId(Long funcionarioDestinoId) { this.funcionarioDestinoId = funcionarioDestinoId; }
}
