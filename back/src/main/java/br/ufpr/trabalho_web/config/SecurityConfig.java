package br.ufpr.trabalho_web.config;

import br.ufpr.trabalho_web.security.JwtAuthenticationFilter;
import br.ufpr.trabalho_web.security.Sha256SaltPasswordEncoder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter)
            throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/clientes/cadastro", "/auth/login").permitAll()

                        .requestMatchers(HttpMethod.GET, "/categorias", "/categorias/**").hasAnyRole("CLIENTE", "FUNCIONARIO")
                        .requestMatchers("/categorias/**").hasRole("FUNCIONARIO")

                        .requestMatchers("/funcionarios", "/funcionarios/**").hasRole("FUNCIONARIO")
                        .requestMatchers("/relatorios/**").hasRole("FUNCIONARIO")
                        .requestMatchers("/solicitacoes/*/orcamento").hasRole("FUNCIONARIO")

                        .requestMatchers("/api/solicitacoes/cliente").hasRole("CLIENTE")
                        .requestMatchers("/api/solicitacoes/*/aprovar").hasRole("CLIENTE")
                        .requestMatchers("/api/solicitacoes/*/rejeitar").hasRole("CLIENTE")
                        .requestMatchers("/api/solicitacoes/*/resgatar").hasRole("CLIENTE")
                        .requestMatchers("/api/solicitacoes/*/pagar").hasRole("CLIENTE")

                        .requestMatchers(HttpMethod.GET, "/api/solicitacoes").hasRole("FUNCIONARIO")
                        .requestMatchers("/api/solicitacoes/abertas").hasRole("FUNCIONARIO")
                        .requestMatchers("/api/solicitacoes/*/orcar").hasRole("FUNCIONARIO")
                        .requestMatchers("/api/solicitacoes/*/manutencao").hasRole("FUNCIONARIO")
                        .requestMatchers("/api/solicitacoes/*/redirecionar").hasRole("FUNCIONARIO")
                        .requestMatchers("/api/solicitacoes/*/finalizar").hasRole("FUNCIONARIO")

                        .requestMatchers(HttpMethod.GET, "/api/solicitacoes/*", "/api/solicitacoes/*/historico").hasAnyRole("CLIENTE", "FUNCIONARIO")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new Sha256SaltPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:4200"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}