package br.ufpr.trabalho_web.controller;

import br.ufpr.trabalho_web.dto.LoginRequest;
import br.ufpr.trabalho_web.dto.LoginResponse;
import br.ufpr.trabalho_web.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastrarCliente(@RequestBody CadastroClienteRequest request) {
        try {
            authService.cadastrarCliente(
                    request.getNome(),
                    request.getEmail(),
                    request.getCpf(),
                    request.getTelefone(),
                    request.getEndereco()
            );
            return ResponseEntity.ok().body("Cliente cadastrado com sucesso. Verifique seu e-mail para a senha.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            return ResponseEntity.ok(authService.login(request.getEmail(), request.getSenha()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}