package br.ufpr.trabalho_web.service;

import br.ufpr.trabalho_web.dto.LoginResponse;
import br.ufpr.trabalho_web.exception.RegraNegocioException;
import br.ufpr.trabalho_web.model.Usuario;
import br.ufpr.trabalho_web.repository.UsuarioRepository;
import br.ufpr.trabalho_web.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public LoginResponse login(String email, String senha) {
        String emailNorm = email == null ? "" : email.trim().toLowerCase();
        Usuario usuario = usuarioRepository.findByEmail(emailNorm);

        if (usuario == null
                || !Boolean.TRUE.equals(usuario.getStatus())
                || !passwordEncoder.matches(senha, usuario.getSenha())) {
            throw new RegraNegocioException("Email ou senha invalidos");
        }

        String perfil = usuario.getPerfil().name();
        String token = jwtUtil.generateToken(usuario.getEmail(), perfil, usuario.getNome());
        return new LoginResponse(token, perfil, usuario.getNome());
    }
}
