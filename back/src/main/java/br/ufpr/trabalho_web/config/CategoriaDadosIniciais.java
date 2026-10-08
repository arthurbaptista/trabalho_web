package br.ufpr.trabalho_web.config;

import br.ufpr.trabalho_web.model.Categoria;
import br.ufpr.trabalho_web.repository.CategoriaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Order(1)
public class CategoriaDadosIniciais implements CommandLineRunner {

    private final CategoriaRepository categoriaRepository;

    public CategoriaDadosIniciais(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @Override
    public void run(String... args) {
        for (String nome : List.of("Notebook", "Desktop", "Impressora", "Mouse", "Teclado")) {
            if (!categoriaRepository.existsByNomeIgnoreCase(nome)) {
                Categoria categoria = new Categoria();
                categoria.setNome(nome);
                categoria.setStatus(true);
                categoriaRepository.save(categoria);
            }
        }
    }
}
