package br.ufpr.trabalho_web.service;

import br.ufpr.trabalho_web.model.Categoria;
import br.ufpr.trabalho_web.repository.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class CategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepository;

    // Cadastrar nova categoria (RF017)
    public Categoria cadastrar(Categoria categoria) {

        // Validação de dados únicos
        if (categoriaRepository.existsByNome(categoria.getNome())) {
            throw new RuntimeException("Erro: A categoria informada já está cadastrada.");
        }

        if (categoria.getNome() == null || categoria.getNome().trim().isEmpty()){
            throw new RuntimeException("Erro: O nome da categoria não pode estar vazio.");
        }

        // Define a categoria como ativa por padrão
        categoria.setStatus(true);

        // Salva no banco de dados e retorna a categoria salva
        return categoriaRepository.save(categoria);
}

    // Listar todas as categorias ativas
    public List<Categoria> listarAtivas() {
        return categoriaRepository.findByStatusTrue();
    }

    // Buscar categoria por ID
    public Categoria buscarPorId(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Erro: Categoria não encontrada."));
    }

    // Atualizar categoria existente
    public Categoria atualizar(Long id, Categoria categoriaAtualizada) {
        Categoria categoria = buscarPorId(id);

        if (categoriaAtualizada.getNome() == null || categoriaAtualizada.getNome().trim().isEmpty()) {
            throw new RuntimeException("Erro: O nome da categoria não pode estar vazio.");
        }

        categoria.setNome(categoriaAtualizada.getNome());

        return categoriaRepository.save(categoria);
    }

    // Remover categoria (Desativação lógica)
    public void remover(Long id) {
        Categoria categoria = buscarPorId(id);
        categoria.setStatus(false);
        categoriaRepository.save(categoria);
    }
}