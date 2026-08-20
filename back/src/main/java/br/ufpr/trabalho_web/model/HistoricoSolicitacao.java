package br.ufpr.trabalho_web.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "historico_solicitacao")
public class HistoricoSolicitacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_alcancado", nullable = false)
    private EstadoSolicitacao estadoAlcancado;

    // FKs

    @ManyToOne
    @JoinColumn(name = "id_solicitacao", nullable = false)
    private Solicitacao solicitacao;

    @ManyToOne
    @JoinColumn(name = "id_funcionario_origem", nullable = false)
    private Funcionario funcionarioOrigem;

    @ManyToOne
    @JoinColumn(name = "id_funcionario_destino")
    private Funcionario funcionarioDestino; // vai ficar null quase sempre, só preenche se o func redirecionar a solicitação

    public HistoricoSolicitacao() {
    }

    //Getters e Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }

    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }

    public EstadoSolicitacao getEstadoAlcancado() {
        return estadoAlcancado;
    }

    public void setEstadoAlcancado(EstadoSolicitacao estadoAlcancado) {
        this.estadoAlcancado = estadoAlcancado;
    }

    public Solicitacao getSolicitacao() {
        return solicitacao;
    }

    public void setSolicitacao(Solicitacao solicitacao) {
        this.solicitacao = solicitacao;
    }

    public Funcionario getFuncionarioOrigem() {
        return funcionarioOrigem;
    }

    public void setFuncionarioOrigem(Funcionario funcionarioOrigem) {
        this.funcionarioOrigem = funcionarioOrigem;
    }

    public Funcionario getFuncionarioDestino() {
        return funcionarioDestino;
    }

    public void setFuncionarioDestino(Funcionario funcionarioDestino) {
        this.funcionarioDestino = funcionarioDestino;
    }
}