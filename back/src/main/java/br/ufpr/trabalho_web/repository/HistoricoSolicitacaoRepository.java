package br.ufpr.trabalho_web.repository;

import br.ufpr.trabalho_web.model.HistoricoSolicitacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoricoSolicitacaoRepository extends JpaRepository<HistoricoSolicitacao, Long> {
    List<HistoricoSolicitacao> findBySolicitacaoIdOrderByDataHoraAsc(Long solicitacaoId);
}
