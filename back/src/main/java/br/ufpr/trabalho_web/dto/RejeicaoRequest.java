package br.ufpr.trabalho_web.dto;

import jakarta.validation.constraints.NotBlank;

public class RejeicaoRequest {

    @NotBlank(message = "O motivo da rejeicao e obrigatorio.")
    private String motivo;

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
}
