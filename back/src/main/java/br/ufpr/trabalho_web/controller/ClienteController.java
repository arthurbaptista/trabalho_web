package br.ufpr.trabalho_web.controller;

import br.ufpr.trabalho_web.dto.ClienteCadastroDTO;
import br.ufpr.trabalho_web.model.Cliente;
import br.ufpr.trabalho_web.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/clientes")
@CrossOrigin(origins = "") public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    // POST http://localhost:8080/clientes/cadastro
    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastrar(@RequestBody ClienteCadastroDTO dto) {
        try {
            Cliente novoCliente = clienteService.cadastrar(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(novoCliente);
        } catch (RuntimeException e) {
            // Se cair nas validações de CPF/Email, devolve erro 400 com a mensagem
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}