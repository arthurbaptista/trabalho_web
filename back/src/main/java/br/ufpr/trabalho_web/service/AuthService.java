package br.ufpr.trabalho_web.service;

import br.ufpr.trabalho_web.dto.LoginResponse;
import br.ufpr.trabalho_web.model.Cliente;
import br.ufpr.trabalho_web.model.Endereco;
import br.ufpr.trabalho_web.model.Usuario;
import br.ufpr.trabalho_web.repository.ClienteRepository;
import br.ufpr.trabalho_web.repository.UsuarioRepository;
import br.ufpr.trabalho_web.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class AuthService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public void cadastrarCliente(
            String nome,
            String email,
            String cpf,
            String telefone,
            Endereco endereco) {

        if (usuarioRepository.findByEmail(email) != null) {
            throw new RuntimeException("Email já cadastrado");
        }

        if (clienteRepository.findByCpf(cpf) != null) {
            throw new RuntimeException("CPF já cadastrado");
        }

        String senha = gerarSenhaAleatoria();

        Cliente cliente = new Cliente();
        cliente.setNome(nome);
        cliente.setEmail(email);
        cliente.setSenha(passwordEncoder.encode(senha));
        cliente.setStatus(true);
        cliente.setCpf(cpf);
        cliente.setTelefone(telefone);
        cliente.setEndereco(endereco);

        clienteRepository.save(cliente);
    }

    public LoginResponse login(String email, String senha) {

        Usuario usuario = usuarioRepository.findByEmail(email);

        if (usuario != null
                && passwordEncoder.matches(senha, usuario.getSenha())
                && usuario.getStatus()) {

            String token = jwtUtil.generateToken(
                    usuario.getEmail(),
                    usuario.getPerfil().name(),
                    usuario.getNome()
            );

            return new LoginResponse(
                    token,
                    usuario.getPerfil().name(),
                    usuario.getNome()
            );
        }

        throw new RuntimeException("Email ou senha inválidos");
    }

    private String gerarSenhaAleatoria() {
        Random random = new Random();
        int senhaNum = 1000 + random.nextInt(9000);

        return String.valueOf(senhaNum);
    }
}