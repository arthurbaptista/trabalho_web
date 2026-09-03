package br.ufpr.trabalho_web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ClienteCadastroDTO(
        @NotBlank(message = "O nome e obrigatorio.")
        @Size(max = 100, message = "O nome deve ter no maximo 100 caracteres.")
        String nome,

        @NotBlank(message = "O CPF e obrigatorio.")
        @Pattern(regexp = "\\D*\\d{3}\\D*\\d{3}\\D*\\d{3}\\D*\\d{2}\\D*", message = "Informe um CPF com 11 digitos.")
        String cpf,

        @NotBlank(message = "O e-mail e obrigatorio.")
        @Email(message = "Informe um e-mail valido.")
        String email,

        @NotBlank(message = "O telefone e obrigatorio.")
        @Pattern(regexp = "\\D*\\d{10,11}\\D*", message = "Informe um telefone com DDD.")
        String telefone,

        @NotBlank(message = "O CEP e obrigatorio.")
        @Pattern(regexp = "\\D*\\d{5}\\D*\\d{3}\\D*", message = "Informe um CEP com 8 digitos.")
        String cep,

        @NotBlank(message = "O logradouro e obrigatorio.")
        String logradouro,

        @NotBlank(message = "O numero e obrigatorio.")
        String numero,

        String complemento,

        @NotBlank(message = "O bairro e obrigatorio.")
        String bairro,

        @NotBlank(message = "A cidade e obrigatoria.")
        String cidade,

        @NotBlank(message = "O estado e obrigatorio.")
        @Size(min = 2, max = 2, message = "Informe a UF com 2 letras.")
        String estado
) {
}
