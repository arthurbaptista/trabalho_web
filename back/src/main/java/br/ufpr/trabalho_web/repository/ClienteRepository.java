package br.ufpr.trabalho_web.repository;

import br.ufpr.trabalho_web.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {


    Cliente findByEmail(String email);
    Cliente findByCpf(String cpf);

    boolean existsByCpf(String cpf);
    boolean existsByEmail(String email);
}