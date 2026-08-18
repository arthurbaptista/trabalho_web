package br.ufpr.trabalho_web.model;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import java.time.LocalDate;

@Entity
@DiscriminatorValue("FUNCIONARIO")
public class Funcionario extends Usuario {

    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;

    public Funcionario() {
    }

    // --- Getters e Setters ---

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }
}