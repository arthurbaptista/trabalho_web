package br.ufpr.trabalho_web.service;

import br.ufpr.trabalho_web.dto.CadastroResponse;
import br.ufpr.trabalho_web.dto.ClienteCadastroDTO;
import br.ufpr.trabalho_web.exception.RegraNegocioException;
import br.ufpr.trabalho_web.model.Cliente;
import br.ufpr.trabalho_web.model.Endereco;
import br.ufpr.trabalho_web.model.Usuario;
import br.ufpr.trabalho_web.repository.ClienteRepository;
import br.ufpr.trabalho_web.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public CadastroResponse cadastrarCliente(ClienteCadastroDTO dto) {
        String cpf = extrairApenasDigitos(dto.cpf());
        String telefone = extrairApenasDigitos(dto.telefone());
        String cep = extrairApenasDigitos(dto.cep());
        String email = dto.email().trim().toLowerCase();

        if (!validarCpf(cpf)) {
            throw new RegraNegocioException("Erro: O CPF informado e invalido.");
        }

        Cliente existentePorCpf = clienteRepository.findByCpf(cpf);
        Usuario usuarioPorEmail = usuarioRepository.findByEmail(email);

        if (existentePorCpf != null && Boolean.TRUE.equals(existentePorCpf.getStatus())) {
            throw new RegraNegocioException("Erro: O CPF informado ja esta cadastrado.");
        }

        if (usuarioPorEmail != null) {
            if (Boolean.TRUE.equals(usuarioPorEmail.getStatus()) || !(usuarioPorEmail instanceof Cliente)) {
                throw new RegraNegocioException("Erro: O E-mail informado ja esta cadastrado.");
            }
            if (existentePorCpf != null && !existentePorCpf.getId().equals(usuarioPorEmail.getId())) {
                throw new RegraNegocioException("Erro: CPF e E-mail pertencem a registros inativos distintos.");
            }
        }

        Cliente cliente = existentePorCpf != null
                ? existentePorCpf
                : (usuarioPorEmail instanceof Cliente c ? c : new Cliente());

        String senhaAleatoria = gerarSenhaAleatoria();

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

    private boolean validarCpf(String cpf) {
        if (cpf == null || cpf.length() != 11 || cpf.chars().distinct().count() == 1) {
            return false;
        }
        try {
            int soma1 = 0;
            int soma2 = 0;
            for (int i = 0; i < 9; i++) {
                int digito = cpf.charAt(i) - '0';
                soma1 += digito * (10 - i);
                soma2 += digito * (11 - i);
            }
            int resto1 = soma1 % 11;
            int dv1 = (resto1 < 2) ? 0 : 11 - resto1;
            if (cpf.charAt(9) - '0' != dv1) {
                return false;
            }

            soma2 += dv1 * 2;
            int resto2 = soma2 % 11;
            int dv2 = (resto2 < 2) ? 0 : 11 - resto2;
            return (cpf.charAt(10) - '0') == dv2;
        } catch (Exception e) {
            return false;
        }
    }

    private String gerarSenhaAleatoria() {
        return String.format("%04d", new SecureRandom().nextInt(10000));
    }

    private String extrairApenasDigitos(String valor) {
        return valor == null ? "" : valor.replaceAll("\\D", "");
    }
}