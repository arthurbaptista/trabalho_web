package br.ufpr.trabalho_web.repository;

import br.ufpr.trabalho_web.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    boolean existsByNome(String nome);

    boolean existsByNomeIgnoreCase(String nome);
    List<Categoria> findByStatusTrue();

}
