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
    public ResponseEntity<FuncionarioDTO> cadastrarFuncionario(@Valid @RequestBody FuncionarioDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(funcionarioService.cadastrarFuncionario(dto));
    }

    @GetMapping
    public List<FuncionarioDTO> listarFuncionariosAtivos() {
        return funcionarioService.listarFuncionariosAtivos();
    }

    @GetMapping("/{id}")
    public FuncionarioDTO buscarFuncionarioPorId(@PathVariable Long id) {
        return funcionarioService.buscarFuncionarioPorId(id);
    }

    @PutMapping("/{id}")
    public FuncionarioDTO atualizarFuncionario(@PathVariable Long id, @Valid @RequestBody FuncionarioDTO dto) {
        return funcionarioService.atualizarFuncionario(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativarFuncionario(@PathVariable Long id, Authentication authentication) {
        String emailLogado = authentication == null ? null : authentication.getName();
        funcionarioService.desativarFuncionario(id, emailLogado);
        return ResponseEntity.noContent().build();
    }
}