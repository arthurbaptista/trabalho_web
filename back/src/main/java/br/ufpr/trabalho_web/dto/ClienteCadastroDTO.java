package br.ufpr.trabalho_web.dto;


public record ClienteCadastroDTO(
        String nome,
        String cpf,
        String email,
        String telefone,
        String cep,
        String logradouro,
        String numero,
        String complemento,
        String bairro,
        String cidade,
        String estado
) {
}