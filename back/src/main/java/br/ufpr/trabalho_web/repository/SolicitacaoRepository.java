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