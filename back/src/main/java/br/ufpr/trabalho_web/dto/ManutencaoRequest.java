package br.ufpr.trabalho_web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ManutencaoRequest {

    @NotNull(message = "O funcionario e obrigatorio.")
    private Long funcionarioId;

    @NotBlank(message = "A descricao da manutencao e obrigatoria.")
    private String descricaoManutencao;

    @NotBlank(message = "As orientacoes para o cliente sao obrigatorias.")
    private String orientacoesCliente;

    public Long getFuncionarioId() { return funcionarioId; }
    public void setFuncionarioId(Long funcionarioId) { this.funcionarioId = funcionarioId; }

    public String getDescricaoManutencao() { return descricaoManutencao; }
    public void setDescricaoManutencao(String descricaoManutencao) { this.descricaoManutencao = descricaoManutencao; }

    public String getOrientacoesCliente() { return orientacoesCliente; }
    public void setOrientacoesCliente(String orientacoesCliente) { this.orientacoesCliente = orientacoesCliente; }
}
