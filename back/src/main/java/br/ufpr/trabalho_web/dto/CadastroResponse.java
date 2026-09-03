package br.ufpr.trabalho_web.dto;

public record CadastroResponse(
        Long id,
        String nome,
        String email,
        String mensagem,
        boolean emailEnviado
) {
}
