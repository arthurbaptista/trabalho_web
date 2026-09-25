package br.ufpr.trabalho_web.controller;

import br.ufpr.trabalho_web.dto.FuncionarioDTO;
import br.ufpr.trabalho_web.service.FuncionarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/funcionarios")
public class FuncionarioController {

    private final FuncionarioService funcionarioService;

    public FuncionarioController(FuncionarioService funcionarioService) {
        this.funcionarioService = funcionarioService;
    }

    @PostMapping
    public ResponseEntity<FuncionarioDTO> cadastrar(@Valid @RequestBody FuncionarioDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(funcionarioService.cadastrar(dto));
    }

    @GetMapping
    public List<FuncionarioDTO> listar() {
        return funcionarioService.listarAtivos();
    }

    @GetMapping("/{id}")
    public FuncionarioDTO buscar(@PathVariable Long id) {
        return funcionarioService.buscarPorId(id);
    }

    @PutMapping("/{id}")
    public FuncionarioDTO atualizar(@PathVariable Long id, @Valid @RequestBody FuncionarioDTO dto) {
        return funcionarioService.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id, Authentication authentication) {
        String emailLogado = authentication == null ? null : authentication.getName();
        funcionarioService.remover(id, emailLogado);
        return ResponseEntity.noContent().build();
    }
}
