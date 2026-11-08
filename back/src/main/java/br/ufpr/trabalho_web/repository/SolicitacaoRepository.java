package br.ufpr.trabalho_web.repository;

import br.ufpr.trabalho_web.model.Cliente;
import br.ufpr.trabalho_web.model.EstadoSolicitacao;
import br.ufpr.trabalho_web.model.Solicitacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SolicitacaoRepository extends JpaRepository<Solicitacao, Long> {

    @Query("SELECT s FROM Solicitacao s " +
            "JOIN FETCH s.cliente " +
            "JOIN FETCH s.categoria " +
            "LEFT JOIN FETCH s.funcionarioResponsavel " +
            "WHERE s.cliente = :cliente " +
            "ORDER BY s.dataHoraAbertura ASC")
    List<Solicitacao> findByClienteOrderByDataHoraAberturaAsc(@Param("cliente") Cliente cliente);

    @Query("SELECT s FROM Solicitacao s " +
            "JOIN FETCH s.cliente " +
            "JOIN FETCH s.categoria " +
            "LEFT JOIN FETCH s.funcionarioResponsavel " +
            "ORDER BY s.dataHoraAbertura ASC")
    List<Solicitacao> findAllByOrderByDataHoraAberturaAsc();

    @Query("SELECT s FROM Solicitacao s " +
            "JOIN FETCH s.cliente " +
            "JOIN FETCH s.categoria " +
            "LEFT JOIN FETCH s.funcionarioResponsavel " +
            "WHERE s.estadoAtual = :estadoAtual " +
            "ORDER BY s.dataHoraAbertura ASC")
    List<Solicitacao> findByEstadoAtualOrderByDataHoraAberturaAsc(@Param("estadoAtual") EstadoSolicitacao estadoAtual);

    @Query("SELECT s FROM Solicitacao s " +
            "JOIN FETCH s.cliente " +
            "JOIN FETCH s.categoria " +
            "LEFT JOIN FETCH s.funcionarioResponsavel " +
            "WHERE (s.estadoAtual <> br.ufpr.trabalho_web.model.EstadoSolicitacao.REDIRECIONADA " +
            "   OR s.funcionarioResponsavel.id = :funcionarioId) " +
            "ORDER BY s.dataHoraAbertura ASC")
    List<Solicitacao> findVisiveisParaFuncionario(@Param("funcionarioId") Long funcionarioId);

    @Query("SELECT s FROM Solicitacao s " +
            "JOIN FETCH s.cliente " +
            "JOIN FETCH s.categoria " +
            "LEFT JOIN FETCH s.funcionarioResponsavel " +
            "WHERE (s.estadoAtual <> br.ufpr.trabalho_web.model.EstadoSolicitacao.REDIRECIONADA " +
            "   OR s.funcionarioResponsavel.id = :funcionarioId) " +
            "AND s.dataHoraAbertura BETWEEN :inicio AND :fim " +
            "ORDER BY s.dataHoraAbertura ASC")
    List<Solicitacao> findVisiveisParaFuncionarioPorPeriodo(
            @Param("funcionarioId") Long funcionarioId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    List<Solicitacao> findByEstadoAtual(EstadoSolicitacao estadoAtual);

    List<Solicitacao> findByCliente(Cliente cliente);

    boolean existsByEstadoAtual(EstadoSolicitacao estadoAtual);
}