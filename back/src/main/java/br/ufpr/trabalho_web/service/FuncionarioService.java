package br.ufpr.trabalho_web.service;

import br.ufpr.trabalho_web.dto.FuncionarioDTO;
import br.ufpr.trabalho_web.exception.RegraNegocioException;
import br.ufpr.trabalho_web.model.Funcionario;
import br.ufpr.trabalho_web.repository.FuncionarioRepository;
import br.ufpr.trabalho_web.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FuncionarioService {

    private final FuncionarioRepository funcionarioRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public FuncionarioService(
            FuncionarioRepository funcionarioRepository,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.funcionarioRepository = funcionarioRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public FuncionarioDTO cadastrar(FuncionarioDTO dto) {
        String email = normalizarEmail(dto.getEmail());
        if (usuarioRepository.existsByEmail(email)) {
            throw new RegraNegocioException("Erro: O e-mail informado ja esta cadastrado.");
        }
        if (dto.getSenha() == null || dto.getSenha().isBlank()) {
            throw new RegraNegocioException("Erro: A senha e obrigatoria.");
        }

        Funcionario funcionario = new Funcionario();
        funcionario.setNome(dto.getNome().trim());
        funcionario.setEmail(email);
        funcionario.setSenha(passwordEncoder.encode(dto.getSenha()));
        funcionario.setDataNascimento(dto.getDataNascimento());
        funcionario.setStatus(true);
        return toDto(funcionarioRepository.save(funcionario));
    }

    public List<FuncionarioDTO> listarAtivos() {
        return funcionarioRepository.findByStatusTrue().stream().map(this::toDto).toList();
    }

    public FuncionarioDTO buscarPorId(Long id) {
        return toDto(buscarAtivo(id));
    }

    public FuncionarioDTO atualizar(Long id, FuncionarioDTO dto) {
        Funcionario funcionario = buscarAtivo(id);
        String email = normalizarEmail(dto.getEmail());

        if (!email.equals(funcionario.getEmail()) && usuarioRepository.existsByEmail(email)) {
            throw new RegraNegocioException("Erro: O e-mail informado ja esta cadastrado.");
        }

        funcionario.setNome(dto.getNome().trim());
        funcionario.setEmail(email);
        funcionario.setDataNascimento(dto.getDataNascimento());
        if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
            funcionario.setSenha(passwordEncoder.encode(dto.getSenha()));
        }
        return toDto(funcionarioRepository.save(funcionario));
    }

    public void remover(Long id, String emailLogado) {
        Funcionario funcionario = buscarAtivo(id);
        if (emailLogado != null && emailLogado.equalsIgnoreCase(funcionario.getEmail())) {
            throw new RegraNegocioException("Erro: O funcionario nao pode remover a si mesmo.");
        }
        if (funcionarioRepository.countByStatusTrue() <= 1) {
            throw new RegraNegocioException("Erro: Nao e possivel remover o unico funcionario ativo.");
        }
        funcionario.setStatus(false);
        funcionarioRepository.save(funcionario);
    }

    private Funcionario buscarAtivo(Long id) {
        Funcionario funcionario = funcionarioRepository.findById(id)
                .orElseThrow(() -> new RegraNegocioException("Erro: Funcionario nao encontrado."));
        if (!Boolean.TRUE.equals(funcionario.getStatus())) {
            throw new RegraNegocioException("Erro: Funcionario nao encontrado.");
        }
        return funcionario;
    }

    private String normalizarEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private FuncionarioDTO toDto(Funcionario funcionario) {
        FuncionarioDTO dto = new FuncionarioDTO();
        dto.setId(funcionario.getId());
        dto.setNome(funcionario.getNome());
        dto.setEmail(funcionario.getEmail());
        dto.setDataNascimento(funcionario.getDataNascimento());
        return dto;
    }
}
