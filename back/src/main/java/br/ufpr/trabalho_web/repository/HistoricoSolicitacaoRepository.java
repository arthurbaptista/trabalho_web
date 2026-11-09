package br.ufpr.trabalho_web.repository;

import br.ufpr.trabalho_web.model.EstadoSolicitacao;
import br.ufpr.trabalho_web.model.HistoricoSolicitacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoricoSolicitacaoRepository extends JpaRepository<HistoricoSolicitacao, Long> {

    @Query("SELECT h FROM HistoricoSolicitacao h " +
            "JOIN FETCH h.solicitacao s " +
            "JOIN FETCH s.categoria " +
            "LEFT JOIN FETCH h.funcionarioOrigem " +
            "LEFT JOIN FETCH h.funcionarioDestino " +
            "WHERE s.id = :solicitacaoId " +
            "ORDER BY h.dataHora ASC")
    List<HistoricoSolicitacao> findBySolicitacaoIdOrderByDataHoraAsc(@Param("solicitacaoId") Long solicitacaoId);

    @Query("SELECT h FROM HistoricoSolicitacao h " +
            "JOIN FETCH h.solicitacao s " +
            "JOIN FETCH s.categoria " +
            "LEFT JOIN FETCH h.funcionarioOrigem " +
            "LEFT JOIN FETCH h.funcionarioDestino " +
            "WHERE h.estadoAlcancado = :estadoAlcancado " +
            "ORDER BY h.dataHora ASC")
    List<HistoricoSolicitacao> findByEstadoAlcancadoOrderByDataHoraAsc(@Param("estadoAlcancado") EstadoSolicitacao estadoAlcancado);
}