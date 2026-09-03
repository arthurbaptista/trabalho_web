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
    }

    public CadastroResponse cadastrar(ClienteCadastroDTO dto) {
        String cpf = soDigitos(dto.cpf());
        String telefone = soDigitos(dto.telefone());
        String cep = soDigitos(dto.cep());
        String email = dto.email().trim().toLowerCase();

        if (clienteRepository.existsByCpf(cpf)) {
            throw new RegraNegocioException("Erro: O CPF informado ja esta cadastrado.");
        }
        if (usuarioRepository.existsByEmail(email)) {
            throw new RegraNegocioException("Erro: O E-mail informado ja esta cadastrado.");
        }

        String senhaAleatoria = gerarSenhaAleatoria();

        Cliente cliente = new Cliente();
        cliente.setNome(dto.nome().trim());
        cliente.setCpf(cpf);
        cliente.setEmail(email);
        cliente.setSenha(passwordEncoder.encode(senhaAleatoria));
        cliente.setTelefone(telefone);
        cliente.setStatus(true);

        Endereco endereco = new Endereco();
        endereco.setCep(cep);
        endereco.setLogradouro(dto.logradouro().trim());
        endereco.setNumero(dto.numero().trim());
        endereco.setComplemento(dto.complemento() == null ? null : dto.complemento().trim());
        endereco.setBairro(dto.bairro().trim());
        endereco.setCidade(dto.cidade().trim());
        endereco.setEstado(dto.estado().trim().toUpperCase());
        cliente.setEndereco(endereco);

        Cliente salvo = clienteRepository.save(cliente);
        boolean emailEnviado = emailService.enviarSenhaCadastro(salvo.getEmail(), senhaAleatoria);

        String mensagem = emailEnviado
                ? "Cadastro realizado. A senha foi enviada para o e-mail informado."
                : "Cadastro realizado. A senha de 4 digitos foi gerada; confira o terminal do backend se o e-mail nao chegou.";

        return new CadastroResponse(salvo.getId(), salvo.getNome(), salvo.getEmail(), mensagem, emailEnviado);
    }

    private String gerarSenhaAleatoria() {
        return String.format("%04d", new SecureRandom().nextInt(10000));
    }

    private String soDigitos(String valor) {
        return valor == null ? "" : valor.replaceAll("\\D", "");
    }
}
