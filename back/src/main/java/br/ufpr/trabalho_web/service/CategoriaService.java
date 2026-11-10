package br.ufpr.trabalho_web.service;

import br.ufpr.trabalho_web.dto.CategoriaRequest;
import br.ufpr.trabalho_web.exception.RegraNegocioException;
import br.ufpr.trabalho_web.model.Categoria;
import br.ufpr.trabalho_web.repository.CategoriaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional
    public Categoria cadastrarCategoria(CategoriaRequest request) {
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

    @Transactional(readOnly = true)
    public List<Categoria> listarCategoriasAtivas() {
        return categoriaRepository.findByStatusTrue();
    }

    @Transactional(readOnly = true)
    public Categoria buscarCategoriaPorId(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RegraNegocioException("Erro: Categoria nao encontrada."));
    }

    @Transactional
    public Categoria atualizarCategoria(Long id, CategoriaRequest request) {
        Categoria categoria = buscarCategoriaPorId(id);
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

    @Transactional
    public void desativarCategoria(Long id) {
        Categoria categoria = buscarCategoriaPorId(id);
        if (!Boolean.TRUE.equals(categoria.getStatus())) {
            throw new RegraNegocioException("Erro: Categoria ja esta desativada.");
        }
        categoria.setStatus(false);
        categoriaRepository.save(categoria);
    }
}