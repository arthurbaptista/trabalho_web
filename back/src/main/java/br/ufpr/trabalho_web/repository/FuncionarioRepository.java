package br.ufpr.trabalho_web.repository;

import br.ufpr.trabalho_web.model.Funcionario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {

    boolean existsByEmail(String email);

    Optional<Funcionario> findByEmail(String email);

    List<Funcionario> findByStatusTrue();

    long countByStatusTrue();
}
