package br.ufpr.trabalho_web.model;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("CLIENTE")
public class Cliente extends Usuario {

    // CPF deve ser único para atender ao requisito de autocadastro
    @Column(unique = true, length = 14)
    private String cpf;

    @Column(length = 20)
    private String telefone;

    // Injeta os campos da classe Endereco (cep, rua, etc) diretamente na tabela usuario
    @Embedded
    private Endereco endereco;

    public Cliente() {
    }

    // --- Getters e Setters ---

    public String getCpf() {
        return cpf;
    }
    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getTelefone() {
        return telefone;
    }
    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public Endereco getEndereco() {
        return endereco;
    }
    public void setEndereco(Endereco endereco) {
        this.endereco = endereco;
    }
}