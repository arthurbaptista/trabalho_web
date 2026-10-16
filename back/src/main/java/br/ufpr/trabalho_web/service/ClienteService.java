package br.ufpr.trabalho_web.service;

import br.ufpr.trabalho_web.dto.CadastroResponse;
import br.ufpr.trabalho_web.dto.ClienteCadastroDTO;
import br.ufpr.trabalho_web.exception.RegraNegocioException;
import br.ufpr.trabalho_web.model.Cliente;
import br.ufpr.trabalho_web.model.Endereco;
import br.ufpr.trabalho_web.repository.ClienteRepository;
import br.ufpr.trabalho_web.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public ClienteService(
            ClienteRepository clienteRepository,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService
    ) {
        this.clienteRepository = clienteRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }package br.ufpr.trabalho_web.service;

import br.ufpr.trabalho_web.exception.RegraNegocioException;
import br.ufpr.trabalho_web.model.Cliente;
import br.ufpr.trabalho_web.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;

    @Service
    public class ClienteService {

        @Autowired
        private ClienteRepository clienteRepository;

        public List<Cliente> buscarTodos() {
            return clienteRepository.findAll();
        }

        public Cliente buscarPorId(Long id) {
            return clienteRepository.findById(id)
                    .orElseThrow(() -> new RegraNegocioException("Cliente não encontrado."));
        }

        @Transactional
        public Cliente autocadastro(Cliente cliente) {
            String senhaAleatoria = String.format("%04d", new Random().nextInt(10000));
            cliente.setSenha(senhaAleatoria);

            Cliente salvo = clienteRepository.save(cliente);

            return salvo;
        }

        @Transactional
        public Cliente atualizar(Long id, Cliente dadosAtualizados) {
            Cliente existente = buscarPorId(id);
            existente.setNome(dadosAtualizados.getNome());
            existente.setTelefone(dadosAtualizados.getTelefone());
            return clienteRepository.save(existente);
        }
    }