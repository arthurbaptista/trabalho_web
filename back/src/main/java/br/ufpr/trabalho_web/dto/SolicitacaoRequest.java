package br.ufpr.trabalho_web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class SolicitacaoRequest {

    @NotNull(message = "O cliente e obrigatorio.")
    private Long clienteId;

    @NotBlank(message = "A descricao do equipamento e obrigatoria.")
    @Size(max = 30, message = "A descricao do equipamento deve ter no maximo 30 caracteres.")
    private String descricaoEquipamento;

    @NotNull(message = "A categoria e obrigatoria.")
    private Long categoriaId;

    @NotBlank(message = "A descricao do defeito e obrigatoria.")
    private String descricaoDefeito;

    public Long getClienteId() {
        return clienteId;
    }

    public void setClienteId(Long clienteId) {
        this.clienteId = clienteId;
    }

    public String getDescricaoEquipamento() {
        return descricaoEquipamento;
    }

    public void setDescricaoEquipamento(String descricaoEquipamento) {
        this.descricaoEquipamento = descricaoEquipamento;
    }

    public Long getCategoriaId() {
        return categoriaId;
    }

    public void setCategoriaId(Long categoriaId) {
        this.categoriaId = categoriaId;
    }

    public String getDescricaoDefeito() {
        return descricaoDefeito;
    }

    public void setDescricaoDefeito(String descricaoDefeito) {
        this.descricaoDefeito = descricaoDefeito;
    }
}
