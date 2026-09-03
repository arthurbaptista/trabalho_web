package br.ufpr.trabalho_web.config;

import br.ufpr.trabalho_web.model.Cliente;
import br.ufpr.trabalho_web.model.Endereco;
import br.ufpr.trabalho_web.model.Funcionario;
import br.ufpr.trabalho_web.repository.ClienteRepository;
import br.ufpr.trabalho_web.repository.FuncionarioRepository;
import br.ufpr.trabalho_web.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DadosIniciais implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final ClienteRepository clienteRepository;
    private final PasswordEncoder passwordEncoder;

    public DadosIniciais(
            UsuarioRepository usuarioRepository,
            FuncionarioRepository funcionarioRepository,
            ClienteRepository clienteRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.usuarioRepository = usuarioRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.clienteRepository = clienteRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        criarFuncionario("Maria", "maria@manutencao.com", LocalDate.of(1990, 3, 12));
        criarFuncionario("Mario", "mario@manutencao.com", LocalDate.of(1988, 7, 25));
        criarClienteTeste();
    }

    private void criarFuncionario(String nome, String email, LocalDate nascimento) {
        if (usuarioRepository.existsByEmail(email)) {
            return;
        }
        Funcionario funcionario = new Funcionario();
        funcionario.setNome(nome);
        funcionario.setEmail(email);
        funcionario.setSenha(passwordEncoder.encode("1234"));
        funcionario.setStatus(true);
        funcionario.setDataNascimento(nascimento);
        funcionarioRepository.save(funcionario);
    }

    private void criarClienteTeste() {
        String email = "joao@manutencao.com";
        if (usuarioRepository.existsByEmail(email)) {
            return;
        }
        Cliente cliente = new Cliente();
        cliente.setNome("Joao");
        cliente.setEmail(email);
        cliente.setSenha(passwordEncoder.encode("1234"));
        cliente.setStatus(true);
        cliente.setCpf("12345678901");
        cliente.setTelefone("41999990000");

        Endereco endereco = new Endereco();
        endereco.setCep("80010000");
        endereco.setLogradouro("Rua das Flores");
        endereco.setNumero("100");
        endereco.setBairro("Centro");
        endereco.setCidade("Curitiba");
        endereco.setEstado("PR");
        cliente.setEndereco(endereco);

        clienteRepository.save(cliente);
    }
}
