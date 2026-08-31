package br.ufpr.trabalho_web.controller;

import br.ufpr.trabalho_web.model.Categoria;
import br.ufpr.trabalho_web.service.CategoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categorias")
@CrossOrigin(origins = "")
public class CategoriaController {

    @Autowired
    private CategoriaService categoriaService;

    // POST http://localhost:8080/categorias
    @PostMapping
    public ResponseEntity<?> cadastrar(@RequestBody Categoria categoria) {
        try {
            Categoria novaCategoria = categoriaService.cadastrar(categoria);
            return ResponseEntity.status(HttpStatus.CREATED).body(novaCategoria);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET http://localhost:8080/categorias
    @GetMapping
    public ResponseEntity<List<Categoria>> listarAtivas() {
        return ResponseEntity.ok(categoriaService.listarAtivas());
    }

    // GET http://localhost:8080/categorias/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Long id) {
        try {
            Categoria categoria = categoriaService.buscarPorId(id);
            return ResponseEntity.ok(categoria);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT http://localhost:8080/categorias/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Categoria categoria) {
        try {
            Categoria atualizada = categoriaService.atualizar(id, categoria);
            return ResponseEntity.ok(atualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE http://localhost:8080/categorias/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> remover(@PathVariable Long id) {
        try {
            categoriaService.remover(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}