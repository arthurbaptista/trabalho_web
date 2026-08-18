package br.ufpr.trabalho_web.model;

import jakarta.persistence.*;

@Entity
@Table(name = "usuario")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE) // classes filhas (Cliente e Funcionario) na mesma tabela de usuario
@DiscriminatorColumn(name = "tipo_usuario", discriminatorType = DiscriminatorType.STRING) // coluna para diferenciar o perfil do usuario
public abstract class Usuario extends StatusBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    // O e-mail
    @Column(nullable = false, unique = true, length = 100)     // O e-mail é unico!
    private String email;

    @Column(nullable = false)
    private String senha;

    public Usuario() {
    }

    // getters e Setters

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }
    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }
    public void setSenha(String senha) {
        this.senha = senha;
    }
}