package br.ufpr.trabalho_web.model;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;

// todas as tabelas vão puxar o campo de status como padrão.

@MappedSuperclass
public abstract class StatusBase {

    @Column(nullable = false)
    private Boolean status = true; // true = ativado, false = desativado

    public StatusBase() {
    }

    public Boolean getStatus() {
        return status;
    }

    public void setStatus(Boolean status) {
        this.status = status;
    }
}