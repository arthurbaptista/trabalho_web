package br.ufpr.trabalho_web.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

/**
 * Filtro responsável por interceptar cada requisição HTTP e validar o token JWT
 * enviado no cabeçalho "Authorization".
 *
 * <p>O filtro estende {@link OncePerRequestFilter}, garantindo que a lógica de
 * autenticação seja executada exatamente uma vez por requisição, mesmo que haja
 * múltiplos despachos internos (forward, include, etc).</p>
 *
 * <p>Fluxo executado a cada requisição:</p>
 * <ol>
 *     <li>Lê o cabeçalho "Authorization" da requisição.</li>
 *     <li>Verifica se ele começa com o prefixo "Bearer ".</li>
 *     <li>Extrai o token JWT (removendo o prefixo).</li>
 *     <li>Extrai o e-mail do usuário a partir do token.</li>
 *     <li>Valida o token e monta um objeto de autenticação do Spring Security.</li>
 *     <li>Registra a autenticação no {@link SecurityContextHolder}.</li>
 *     <li>Continua a cadeia de filtros.</li>
 * </ol>
 *
 * @author Equipe Trabalho Web
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    /**
     * Utilitário responsável por gerar, ler e validar tokens JWT.
     * É injetado automaticamente pelo Spring através do {@link Autowired}.
     */
    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Método principal do filtro. Executado uma única vez por requisição.
     *
     * @param request  requisição HTTP recebida.
     * @param response resposta HTTP que será devolvida.
     * @param chain    cadeia de filtros que deve continuar a execução.
     * @throws ServletException em caso de erro de servlet.
     * @throws IOException      em caso de erro de entrada/saída.
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        // Obtém o cabeçalho "Authorization" enviado pelo cliente.
        final String authorizationHeader = request.getHeader("Authorization");

        // Variáveis que irão armazenar o e-mail do usuário e o token JWT.
        String email = null;
        String jwt = null;

        // Verifica se o cabeçalho foi enviado e se segue o padrão "Bearer <token>".
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {

            // Remove o prefixo "Bearer " (7 caracteres) para obter apenas o token.
            jwt = authorizationHeader.substring(7);

            try {
                // Tenta extrair o e-mail (subject) do token JWT.
                email = jwtUtil.getEmailFromToken(jwt);
            } catch (Exception e) {
                // Caso o token esteja expirado, malformado ou com assinatura inválida,
                // apenas registra um aviso no log e segue o fluxo.
                logger.warn("Token JWT inválido ou expirado", e);
            }
        }

        // Se um e-mail foi extraído com sucesso E ainda não existe autenticação
        // registrada no contexto atual, tentamos autenticar o usuário.
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Valida o token antes de confiar nas informações contidas nele.
            if (jwtUtil.validateToken(jwt)) {

                // Recupera todas as claims (informações) do token.
                Claims claims = jwtUtil.getClaims(jwt);

                // Extrai o perfil do usuário (ex.: "ADMIN", "USER").
                String perfil = claims.get("perfil", String.class);

                // O Spring Security exige o prefixo "ROLE_" nas autoridades.
                List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                        new SimpleGrantedAuthority("ROLE_" + perfil)
                );

                // Cria o token de autenticação contendo o e-mail (principal),
                // credenciais nulas (não usamos senha aqui) e as autoridades.
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        email, null, authorities);

                // Adiciona detalhes da requisição (IP, session id, etc.) ao token.
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Registra a autenticação no contexto do Spring Security,
                // tornando o usuário "logado" durante esta requisição.
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // Continua a cadeia de filtros, permitindo que a requisição prossiga.
        chain.doFilter(request, response);
    }
}