package br.ufpr.trabalho_web.dto;

public class SolicitacaoRequest {
    private String descricaoEquipamento;
    private Long categoriaId;
    private String descricaoDefeito;

    // Getters e Setters
    public String getDescricaoEquipamento() { return descricaoEquipamento; }
    public void setDescricaoEquipamento(String descricaoEquipamento) { this.descricaoEquipamento = descricaoEquipamento; }
    
    public Long getCategoriaId() { return categoriaId; }
    public void setCategoriaId(Long categoriaId) { this.categoriaId = categoriaId; }
    
    public String getDescricaoDefeito() { return descricaoDefeito; }
    public void setDescricaoDefeito(String descricaoDefeito) { this.descricaoDefeito = descricaoDefeito; }
}