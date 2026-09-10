package br.ufpr.trabalho_web.repository;

import br.ufpr.trabalho_web.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    boolean existsByNomeIgnoreCase(String nome);

    boolean existsByNomeIgnoreCaseAndIdNot(String nome, Long id);

    Optional<Categoria> findByNomeIgnoreCase(String nome);

    List<Categoria> findByStatusTrue();
}
