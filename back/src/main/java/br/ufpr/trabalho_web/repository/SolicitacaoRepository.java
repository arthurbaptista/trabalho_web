package br.ufpr.trabalho_web.repository;

import br.ufpr.trabalho_web.model.EstadoSolicitacao;
import br.ufpr.trabalho_web.model.Funcionario;
import br.ufpr.trabalho_web.model.Solicitacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SolicitacaoRepository extends JpaRepository<Solicitacao, Long> {

    // RF003 - lista solicitacoes do cliente ordenadas por data
    List<Solicitacao> findByClienteIdOrderByDataHoraAberturaAsc(Long clienteId);

    // RF011 - lista solicitacoes abertas para funcionario
    List<Solicitacao> findByEstadoAtualOrderByDataHoraAberturaAsc(EstadoSolicitacao estadoAtual);

    // RF013 - lista todas as solicitacoes com filtro de data
    List<Solicitacao> findByDataHoraAberturaBetweenOrderByDataHoraAberturaAsc(
            LocalDateTime inicio, LocalDateTime fim);

    // RF013 - todas as solicitacoes ordenadas por data
    List<Solicitacao> findAllByOrderByDataHoraAberturaAsc();

    // RF013 - solicitacoes de um funcionario responsavel ou redirecionadas para ele
    List<Solicitacao> findByFuncionarioResponsavelOrderByDataHoraAberturaAsc(Funcionario funcionario);
}
