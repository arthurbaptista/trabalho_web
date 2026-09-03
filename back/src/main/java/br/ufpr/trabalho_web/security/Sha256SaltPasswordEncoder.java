package br.ufpr.trabalho_web.security;

import org.springframework.security.crypto.password.PasswordEncoder;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HexFormat;

/**
 * Hash SHA-256 com SALT aleatorio, no formato salt$hash.
 */
public class Sha256SaltPasswordEncoder implements PasswordEncoder {

    private static final String SEPARADOR = "$";
    private static final int TAMANHO_SALT = 16;
    private final SecureRandom random = new SecureRandom();

    @Override
    public String encode(CharSequence rawPassword) {
        byte[] salt = new byte[TAMANHO_SALT];
        random.nextBytes(salt);
        String saltHex = HexFormat.of().formatHex(salt);
        return saltHex + SEPARADOR + hash(saltHex, rawPassword.toString());
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        if (rawPassword == null || encodedPassword == null) {
            return false;
        }
        String[] partes = encodedPassword.split("\\$", 2);
        if (partes.length != 2) {
            return false;
        }
        String calculado = hash(partes[0], rawPassword.toString());
        return MessageDigest.isEqual(
                calculado.getBytes(StandardCharsets.UTF_8),
                partes[1].getBytes(StandardCharsets.UTF_8)
        );
    }

    private String hash(String saltHex, String senha) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest((saltHex + senha).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 nao disponivel", e);
        }
    }
}
