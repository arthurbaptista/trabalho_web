package br.ufpr.trabalho_web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class SolicitacaoRequest {

    @NotNull(message = "O cliente é obrigatório.")
    private Long clienteId;

    @NotBlank(message = "A descrição do equipamento é obrigatória.")
    @Size(max = 30, message = "A descrição do equipamento deve ter no máximo 30 caracteres.")
    private String descricaoEquipamento;

    @NotNull(message = "A categoria é obrigatória.")
    private Long categoriaId;

    @NotBlank(message = "A descrição do defeito é obrigatória.")
    private String descricaoDefeito;

    // Novos campos adicionados para a etapa de manutenção
    private String descricaoManutencao;
    private String orientacoesCliente;

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

    public String getDescricaoManutencao() {
        return descricaoManutencao;
    }

    public void setDescricaoManutencao(String descricaoManutencao) {
        this.descricaoManutencao = descricaoManutencao;
    }

    public String getOrientacoesCliente() {
        return orientacoesCliente;
    }

    public void setOrientacoesCliente(String orientacoesCliente) {
        this.orientacoesCliente = orientacoesCliente;
    }
}