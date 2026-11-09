package br.ufpr.trabalho_web.dto;

import br.ufpr.trabalho_web.model.Categoria;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SolicitacaoRequest {

    private Long id;

    private Long clienteId;

    @NotBlank(message = "A descricao do equipamento e obrigatoria.")
    @Size(max = 30, message = "A descricao do equipamento deve ter no maximo 30 caracteres.")
    private String descricaoEquipamento;

    private Long categoriaId;

    private Categoria categoria;

    @NotBlank(message = "A descricao do defeito e obrigatoria.")
    private String descricaoDefeito;

    private String descricaoManutencao;
    private String orientacoesCliente;
    private Long funcionarioDestinoId;

    public Long getCategoriaIdResolvido() {
        if (categoriaId != null) {
            return categoriaId;
        }
        if (categoria != null && categoria.getId() != null) {
            return categoria.getId();
        }
        return null;
    }

    public Long getFuncionarioDestinoIdResolvido() {
        if (funcionarioDestinoId != null) {
            return funcionarioDestinoId;
        }
        return id;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
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

    public Long getFuncionarioDestinoId() {
        return funcionarioDestinoId;
    }

    public void setFuncionarioDestinoId(Long funcionarioDestinoId) {
        this.funcionarioDestinoId = funcionarioDestinoId;
    }
}