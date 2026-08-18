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

    // Getters e Setters
}