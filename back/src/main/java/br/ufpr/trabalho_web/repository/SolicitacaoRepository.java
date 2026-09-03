package br.ufpr.trabalho_web.repository;
import br.ufpr.trabalho_web.model.Cliente;

import br.ufpr.trabalho_web.model.EstadoSolicitacao;
import br.ufpr.trabalho_web.model.Funcionario;
import br.ufpr.trabalho_web.model.Solicitacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitacaoRepository extends JpaRepository<Solicitacao, Long> {

    List<Solicitacao> findByClienteOrderByDataHoraAberturaAsc(Cliente cliente);

    List<Solicitacao> findByEstado(EstadoSolicitacao estado);

    List<Solicitacao> findByCliente(Cliente cliente);

    boolean existsByEstado(EstadoSolicitacao estado);
}

//package br.ufpr.trabalho_web.repository;
//
//import br.ufpr.trabalho_web.model.Cliente;
//import br.ufpr.trabalho_web.model.EstadoSolicitacao;
//import br.ufpr.trabalho_web.model.Solicitacao;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//import org.springframework.stereotype.Repository;
//
//import java.time.LocalDateTime;
//import java.util.List;
//
///**
// * Repositório para persistência de Solicitacao e emissão de relatórios de receita (RF019, RF020).
// */
//@Repository
//public interface SolicitacaoRepository extends JpaRepository<Solicitacao, Long> {
//
//    List<Solicitacao> findByClienteOrderByDataHoraAberturaAsc(Cliente cliente);
//
//    List<Solicitacao> findByEstado(EstadoSolicitacao estado);
//
//    List<Solicitacao> findByCliente(Cliente cliente);
//
//    boolean existsByEstado(EstadoSolicitacao estado);
//
//    /**
//     * RF019: Consulta para relatório de receita agrupada por dia dentro de um período.
//     * Busca o histórico de transições para o estado 'PAGA' ou 'FINALIZADA'.
//     */
//    @Query("SELECT FUNCTION('DATE', h.dataHora), SUM(s.valorOrcamento) " +
//            "FROM HistoricoSolicitacao h " +
//            "JOIN h.solicitacao s " +
//            "WHERE h.estadoAlcancado = 'PAGA' " +
//            "AND h.dataHora BETWEEN :dataInicio AND :dataFim " +
//            "GROUP BY FUNCTION('DATE', h.dataHora) " +
//            "ORDER BY FUNCTION('DATE', h.dataHora) ASC")
//    List<Object[]> buscarReceitaPorDia(
//            @Param("dataInicio") LocalDateTime dataInicio,
//            @Param("dataFim") LocalDateTime dataFim
//    );
//
//    /**
//     * RF020: Consulta para relatório de receita agrupada por categoria de equipamento.
//     */
//    @Query("SELECT c.nome, SUM(s.valorOrcamento) " +
//            "FROM HistoricoSolicitacao h " +
//            "JOIN h.solicitacao s " +
//            "JOIN s.categoria c " +
//            "WHERE h.estadoAlcancado = 'PAGA' " +
//            "AND h.dataHora BETWEEN :dataInicio AND :dataFim " +
//            "GROUP BY c.nome " +
//            "ORDER BY SUM(s.valorOrcamento) DESC")
//    List<Object[]> buscarReceitaPorCategoria(
//            @Param("dataInicio") LocalDateTime dataInicio,
//            @Param("dataFim") LocalDateTime dataFim
//    );
//}