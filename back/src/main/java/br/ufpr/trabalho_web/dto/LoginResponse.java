package br.ufpr.trabalho_web.dto;

public class LoginResponse {
    private String token;
    private String tipo = "Bearer";
    private String perfil;
    private String nome;

    public LoginResponse(String token, String perfil, String nome) {
        this.token = token;
        this.perfil = perfil;
        this.nome = nome;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public String getPerfil() { return perfil; }
    public void setPerfil(String perfil) { this.perfil = perfil; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
}