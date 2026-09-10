package br.ufpr.trabalho_web.service;

import br.ufpr.trabalho_web.dto.CategoriaRequest;
import br.ufpr.trabalho_web.exception.RegraNegocioException;
import br.ufpr.trabalho_web.model.Categoria;
import br.ufpr.trabalho_web.repository.CategoriaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    public Categoria cadastrar(CategoriaRequest request) {
        String nome = request.nome().trim();
        Optional<Categoria> existente = categoriaRepository.findByNomeIgnoreCase(nome);

        if (existente.isPresent()) {
            Categoria categoria = existente.get();
            if (Boolean.TRUE.equals(categoria.getStatus())) {
                throw new RegraNegocioException("Erro: A categoria informada ja esta cadastrada.");
            }
            categoria.setNome(nome);
            categoria.setStatus(true);
            return categoriaRepository.save(categoria);
        }

        Categoria categoria = new Categoria();
        categoria.setNome(nome);
        categoria.setStatus(true);
        return categoriaRepository.save(categoria);
    }

    public List<Categoria> listarAtivas() {
        return categoriaRepository.findByStatusTrue();
    }

    public Categoria buscarPorId(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RegraNegocioException("Erro: Categoria nao encontrada."));
    }

    public Categoria atualizar(Long id, CategoriaRequest request) {
        Categoria categoria = buscarPorId(id);
        if (!Boolean.TRUE.equals(categoria.getStatus())) {
            throw new RegraNegocioException("Erro: Categoria inativa nao pode ser atualizada.");
        }

        String nome = request.nome().trim();
        if (categoriaRepository.existsByNomeIgnoreCaseAndIdNot(nome, id)) {
            throw new RegraNegocioException("Erro: A categoria informada ja esta cadastrada.");
        }

        categoria.setNome(nome);
        return categoriaRepository.save(categoria);
    }

    public void remover(Long id) {
        Categoria categoria = buscarPorId(id);
        if (!Boolean.TRUE.equals(categoria.getStatus())) {
            throw new RegraNegocioException("Erro: Categoria ja esta desativada.");
        }
        categoria.setStatus(false);
        categoriaRepository.save(categoria);
    }
}
