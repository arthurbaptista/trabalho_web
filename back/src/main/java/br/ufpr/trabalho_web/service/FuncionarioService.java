package br.ufpr.trabalho_web.service;

import br.ufpr.trabalho_web.dto.FuncionarioDTO;
import br.ufpr.trabalho_web.exception.RegraNegocioException;
import br.ufpr.trabalho_web.model.Funcionario;
import br.ufpr.trabalho_web.model.Usuario;
import br.ufpr.trabalho_web.repository.FuncionarioRepository;
import br.ufpr.trabalho_web.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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

    @Transactional
    public FuncionarioDTO cadastrarFuncionario(FuncionarioDTO dto) {
        String email = normalizarEmail(dto.getEmail());
        if (dto.getSenha() == null || dto.getSenha().isBlank()) {
            throw new RegraNegocioException("Erro: A senha e obrigatoria.");
        }
        validarDataNascimento(dto.getDataNascimento());

        Usuario existente = usuarioRepository.findByEmail(email);
        if (existente != null) {
            if (Boolean.TRUE.equals(existente.getStatus()) || !(existente instanceof Funcionario funcionarioInativo)) {
                throw new RegraNegocioException("Erro: O e-mail informado ja esta cadastrado.");
            }
            funcionarioInativo.setNome(dto.getNome().trim());
            funcionarioInativo.setDataNascimento(dto.getDataNascimento());
            funcionarioInativo.setSenha(passwordEncoder.encode(dto.getSenha()));
            funcionarioInativo.setStatus(true);
            return converterParaDto(funcionarioRepository.save(funcionarioInativo));
        }

        Funcionario funcionario = new Funcionario();
        funcionario.setNome(dto.getNome().trim());
        funcionario.setEmail(email);
        funcionario.setSenha(passwordEncoder.encode(dto.getSenha()));
        funcionario.setDataNascimento(dto.getDataNascimento());
        funcionario.setStatus(true);
        return converterParaDto(funcionarioRepository.save(funcionario));
    }

    @Transactional(readOnly = true)
    public List<FuncionarioDTO> listarFuncionariosAtivos() {
        return funcionarioRepository.findByStatusTrue().stream()
                .map(this::converterParaDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public FuncionarioDTO buscarFuncionarioPorId(Long id) {
        return converterParaDto(buscarFuncionarioAtivoPorId(id));
    }

    @Transactional
    public FuncionarioDTO atualizarFuncionario(Long id, FuncionarioDTO dto) {
        Funcionario funcionario = buscarFuncionarioAtivoPorId(id);
        String email = normalizarEmail(dto.getEmail());
        validarDataNascimento(dto.getDataNascimento());

        if (!email.equals(funcionario.getEmail()) && usuarioRepository.existsByEmail(email)) {
            throw new RegraNegocioException("Erro: O e-mail informado ja esta cadastrado.");
        }

        funcionario.setNome(dto.getNome().trim());
        funcionario.setEmail(email);
        funcionario.setDataNascimento(dto.getDataNascimento());
        if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
            funcionario.setSenha(passwordEncoder.encode(dto.getSenha()));
        }
        return converterParaDto(funcionarioRepository.save(funcionario));
    }

    @Transactional
    public void desativarFuncionario(Long id, String emailLogado) {
        Funcionario funcionario = buscarFuncionarioAtivoPorId(id);
        if (emailLogado != null && emailLogado.equalsIgnoreCase(funcionario.getEmail())) {
            throw new RegraNegocioException("Erro: O funcionario nao pode remover a si mesmo.");
        }
        if (funcionarioRepository.countByStatusTrue() <= 1) {
            throw new RegraNegocioException("Erro: Nao e possivel remover o unico funcionario ativo.");
        }
        funcionario.setStatus(false);
        funcionarioRepository.save(funcionario);
    }

    private void validarDataNascimento(LocalDate dataNascimento) {
        if (dataNascimento != null && dataNascimento.isAfter(LocalDate.now())) {
            throw new RegraNegocioException("Erro: A data de nascimento nao pode ser no futuro.");
        }
    }

    private Funcionario buscarFuncionarioAtivoPorId(Long id) {
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

    private FuncionarioDTO converterParaDto(Funcionario funcionario) {
        FuncionarioDTO dto = new FuncionarioDTO();
        dto.setId(funcionario.getId());
        dto.setNome(funcionario.getNome());
        dto.setEmail(funcionario.getEmail());
        dto.setDataNascimento(funcionario.getDataNascimento());
        return dto;
    }
}