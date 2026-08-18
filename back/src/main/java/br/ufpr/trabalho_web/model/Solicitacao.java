package br.ufpr.trabalho_web.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "solicitacao")
public class Solicitacao extends StatusBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "data_hora_abertura", nullable = false)
    private LocalDateTime dataHoraAbertura;

    @Column(name = "descricao_equipamento", nullable = false, length = 30)
    private String descricaoEquipamento;

    @Column(name = "descricao_defeito", nullable = false, columnDefinition = "TEXT")
    private String descricaoDefeito;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_atual", nullable = false)
    private EstadoSolicitacao estadoAtual;

    @Column(name = "valor_orcamento")
    private BigDecimal valorOrcamento;

    @Column(name = "motivo_rejeicao", columnDefinition = "TEXT")
    private String motivoRejeicao;

    @Column(name = "descricao_manutencao", columnDefinition = "TEXT")
    private String descricaoManutencao;

    @Column(name = "orientacoes_cliente", columnDefinition = "TEXT")
    private String orientacoesCliente;


    // FKs

    @ManyToOne
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @ManyToOne
    @JoinColumn(name = "id_categoria", nullable = false)
    private Categoria categoria;

    @ManyToOne
    @JoinColumn(name = "id_funcionario_responsavel")
    private Funcionario funcionarioResponsavel;

    public Solicitacao() {
    }

    // Getters e Setters    (vou fazer no decorrer do trabalho)


}