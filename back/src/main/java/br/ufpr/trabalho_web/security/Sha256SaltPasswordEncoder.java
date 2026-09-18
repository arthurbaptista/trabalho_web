package br.ufpr.trabalho_web.security;

import org.springframework.security.crypto.password.PasswordEncoder;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HexFormat;

/**
 * Implementação de {@link PasswordEncoder} que utiliza o algoritmo SHA-256
 * combinado com um SALT aleatório por senha.
 *
 * <p>O resultado armazenado possui o formato:</p>
 * <pre>
 *     {saltHex}${hashHex}
 * </pre>
 *
 * <p>Onde:</p>
 * <ul>
 *     <li>{@code saltHex} é um valor aleatório de 16 bytes representado em hexadecimal.</li>
 *     <li>{@code hashHex} é o resultado do SHA-256 aplicado sobre {@code saltHex + senha}.</li>
 * </ul>
 *
 * <p>O uso de SALT garante que duas senhas iguais gerem hashes diferentes,
 * dificultando ataques de rainbow table e comparação direta entre usuários.</p>
 *
 * <p>A comparação é feita com {@link MessageDigest#isEqual(byte[], byte[])}
 * para evitar ataques de timing (comparação em tempo constante).</p>
 *
 * @author Equipe Trabalho Web
 */
public class Sha256SaltPasswordEncoder implements PasswordEncoder {

    /**
     * Caractere usado para separar o SALT do hash no valor codificado.
     */
    private static final String SEPARADOR = "$";

    /**
     * Tamanho em bytes do SALT gerado aleatoriamente.
     * 16 bytes = 128 bits de entropia, valor recomendado para SALT.
     */
    private static final int TAMANHO_SALT = 16;

    /**
     * Gerador de números aleatórios criptograficamente seguro.
     * Diferente de {@link java.util.Random}, o SecureRandom é adequado
     * para uso em contextos de segurança.
     */
    private final SecureRandom random = new SecureRandom();

    /**
     * Codifica uma senha em texto puro, gerando um SALT aleatório
     * e retornando a string no formato {@code salt$hash}.
     *
     * @param rawPassword senha em texto puro informada pelo usuário.
     * @return string codificada contendo SALT e hash separados por "$".
     */
    @Override
    public String encode(CharSequence rawPassword) {
        // Cria um array de bytes do tamanho definido para o SALT.
        byte[] salt = new byte[TAMANHO_SALT];

        // Preenche o array com bytes aleatórios seguros.
        random.nextBytes(salt);

        // Converte o SALT para representação hexadecimal (mais legível/armazenável).
        String saltHex = HexFormat.of().formatHex(salt);

        // Retorna "saltHex$hash", onde o hash é calculado sobre saltHex + senha.
        return saltHex + SEPARADOR + hash(saltHex, rawPassword.toString());
    }

    /**
     * Verifica se a senha em texto puro corresponde à senha codificada.
     *
     * <p>O método:</p>
     * <ol>
     *     <li>Valida se os parâmetros não são nulos.</li>
     *     <li>Divide a string codificada em SALT e hash usando o separador "$".</li>
     *     <li>Recalcula o hash usando o SALT extraído e a senha informada.</li>
     *     <li>Compara os hashes em tempo constante.</li>
     * </ol>
     *
     * @param rawPassword     senha em texto puro a ser verificada.
     * @param encodedPassword senha codificada previamente armazenada.
     * @return {@code true} se a senha corresponder, {@code false} caso contrário.
     */
    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {

        // Se qualquer um dos valores for nulo, não há como comparar.
        if (rawPassword == null || encodedPassword == null) {
            return false;
        }

        // Divide a string codificada em no máximo 2 partes, usando "$" como separador.
        // O segundo parâmetro (2) evita que o split gere mais partes caso o hash contenha "$".
        String[] partes = encodedPassword.split("\\$", 2);

        // Se não houver exatamente 2 partes, o formato está inválido.
        if (partes.length != 2) {
            return false;
        }

        // Recalcula o hash usando o SALT (partes[0]) e a senha informada.
        String calculado = hash(partes[0], rawPassword.toString());

        // Compara os hashes byte a byte em tempo constante para evitar timing attacks.
        return MessageDigest.isEqual(
                calculado.getBytes(StandardCharsets.UTF_8),
                partes[1].getBytes(StandardCharsets.UTF_8)
        );
    }

    /**
     * Gera o hash SHA-256 da concatenação {@code saltHex + senha}.
     *
     * @param saltHex SALT em formato hexadecimal.
     * @param senha   senha em texto puro.
     * @return hash SHA-256 em formato hexadecimal.
     * @throws IllegalStateException caso o algoritmo SHA-256 não esteja disponível
     *                               na JVM (situação que não deveria ocorrer).
     */
    private String hash(String saltHex, String senha) {
        try {
            // Obtém uma instância do MessageDigest para o algoritmo SHA-256.
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            // Concatena SALT + senha, converte para bytes UTF-8 e calcula o hash.
            byte[] bytes = digest.digest((saltHex + senha).getBytes(StandardCharsets.UTF_8));

            // Converte o resultado para hexadecimal e devolve.
            return HexFormat.of().formatHex(bytes);
        } catch (NoSuchAlgorithmException e) {
            // SHA-256 é obrigatório em toda JVM compatível; se cair aqui, é erro crítico.
            throw new IllegalStateException("SHA-256 nao disponivel", e);
        }
    }
}