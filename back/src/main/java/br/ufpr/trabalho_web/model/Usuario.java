package br.ufpr.trabalho_web.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "usuario")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(
        name = "tipo_usuario",
        discriminatorType = DiscriminatorType.STRING
)
public abstract class Usuario extends StatusBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String senha;

    public Usuario() {
    }

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

    @JsonIgnore
    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public Perfil getPerfil() {
        if (this instanceof Cliente) {
            return Perfil.CLIENTE;
        }

        if (this instanceof Funcionario) {
            return Perfil.FUNCIONARIO;
        }

        return null;
    }
}

/*
 * =====================================================================================
 * BLOCO DE COMENTÁRIOS EXPLICATIVOS - classe Usuario
 * =====================================================================================
 *
 * Visão geral
 * -----------
 * Esta é a classe base (abstrata) para os usuários do sistema. Ela concentra os
 * atributos e comportamentos que são comuns a QUALQUER tipo de usuário da aplicação,
 * como Cliente e Funcionario, que devem estender esta classe.
 *
 * Por ser "abstract", ela não pode ser instanciada diretamente (não existe um
 * "new Usuario()" sendo usado fora desta classe) — só faz sentido existir através
 * de uma subclasse concreta, como Cliente ou Funcionario.
 *
 * Ela também estende StatusBase, herdando o campo "status" (ativado/desativado),
 * que é um padrão reaproveitado por várias entidades do sistema.
 *
 * Imports
 * -------
 * - com.fasterxml.jackson.annotation.JsonIgnore: usado para controlar como o objeto
 *   é serializado em JSON nas respostas da API.
 * - jakarta.persistence.*: conjunto de anotações JPA que mapeiam esta classe Java
 *   para uma tabela do banco de dados (Object-Relational Mapping).
 *
 * Anotações de classe
 * --------------------
 * @Entity
 *   Marca esta classe como uma entidade JPA, ou seja, ela representa uma tabela do
 *   banco de dados. Cada instância dessa classe (em tempo de execução) corresponde
 *   a uma linha na tabela mapeada.
 *
 * @Table(name = "usuario")
 *   Define explicitamente o nome da tabela no banco de dados como "usuario". Se
 *   essa anotação não existisse, o JPA usaria o nome da classe por padrão.
 *
 * @Inheritance(strategy = InheritanceType.SINGLE_TABLE)
 *   Define como a herança Java (Usuario -> Cliente / Funcionario) é representada
 *   no banco relacional. Nessa estratégia, TODAS as subclasses (Cliente,
 *   Funcionario) são armazenadas em UMA ÚNICA tabela ("usuario"), e as colunas
 *   específicas de cada subclasse ficam com valor NULL quando não se aplicam
 *   àquela linha. É a estratégia mais simples e performática (evita JOINs), mas
 *   pode gerar tabelas mais "largas" com colunas nulas.
 *
 * @DiscriminatorColumn(name = "tipo_usuario", discriminatorType = DiscriminatorType.STRING)
 *   Como todas as subclasses moram na mesma tabela, o JPA precisa de uma coluna
 *   extra para saber "qual subtipo" aquela linha representa (Cliente ou
 *   Funcionario). Essa coluna se chama "tipo_usuario" e guarda um valor do tipo
 *   STRING (normalmente o nome da subclasse ou um valor definido via
 *   @DiscriminatorValue em cada subclasse concreta).
 *
 * Campos
 * ------
 * id
 *   @Id marca este atributo como a chave primária (PRIMARY KEY) da tabela.
 *   @GeneratedValue(strategy = GenerationType.IDENTITY) delega ao banco de dados a
 *   responsabilidade de gerar o valor do id automaticamente (auto-incremento),
 *   ou seja, cada novo Usuario inserido recebe um id sequencial gerado pelo SGBD.
 *
 * nome
 *   @Column(nullable = false, length = 100) mapeia o atributo para uma coluna do
 *   tipo VARCHAR(100) que não pode ser nula — ou seja, todo usuário é obrigado a
 *   ter um nome cadastrado, com no máximo 100 caracteres.
 *
 * email
 *   @Column(nullable = false, unique = true, length = 100): além de obrigatório,
 *   o e-mail precisa ser único na tabela inteira (constraint UNIQUE no banco), já
 *   que ele costuma ser usado como identificador de login do usuário.
 *
 * senha
 *   @JsonIgnore no campo evita que a senha seja incluída automaticamente quando
 *   o Jackson serializa o objeto. Isso é reforçado novamente no getter, para
 *   garantir que a senha NUNCA seja exposta nas respostas da API.
 *   @Column(nullable = false): a senha é obrigatória no cadastro do usuário.
 *   Observação de segurança: idealmente este campo deveria armazenar apenas o
 *   HASH da senha (ex.: BCrypt), nunca a senha em texto puro.
 *
 * Construtor
 * ----------
 * Usuario()
 *   Construtor padrão (sem argumentos), necessário para que o JPA/Hibernate
 *   consiga instanciar a entidade via reflection ao carregar dados do banco.
 *
 * Getters e Setters
 * ------------------
 * getId/setId, getNome/setNome, getEmail/setEmail
 *   Acesso de leitura e escrita convencional aos respectivos atributos.
 *
 * getSenha/setSenha
 *   O @JsonIgnore repetido diretamente no getter garante que, mesmo que alguma
 *   configuração do Jackson tente serializar por método (getter) em vez de
 *   campo, a senha continua sendo omitida do JSON de resposta. O setter
 *   continua público normalmente, pois é necessário para permitir que a senha
 *   seja definida/alterada (por exemplo, no cadastro ou troca de senha), mesmo
 *   que ela não seja exposta na leitura (getter).
 *
 * Método getPerfil()
 * -------------------
 * Este método NÃO é um campo persistido no banco (não é uma coluna da tabela) —
 * ele é calculado dinamicamente em tempo de execução, com base no tipo real
 * (runtime type) do objeto.
 *
 * Como a hierarquia usa SINGLE_TABLE com um discriminator (tipo_usuario), seria
 * possível obter essa informação diretamente da coluna do banco, mas aqui a
 * classe opta por resolver isso via "instanceof", verificando se o objeto atual
 * é uma instância de Cliente ou de Funcionario.
 *
 * Isso é útil, por exemplo, para expor no JSON de resposta da API um campo
 * "perfil" que indique claramente o papel do usuário (CLIENTE ou FUNCIONARIO),
 * sem precisar duplicar essa lógica em cada subclasse.
 *
 * Fluxo do método:
 * 1. Se o objeto "this" (a instância atual) for do tipo Cliente, retorna o
 *    valor correspondente do enum Perfil.CLIENTE.
 * 2. Se não for Cliente, verifica se é do tipo Funcionario e retorna
 *    Perfil.FUNCIONARIO.
 * 3. Caso não seja nenhum dos dois tipos conhecidos (situação que, na prática,
 *    não deveria ocorrer já que a classe é abstrata e só existem essas duas
 *    subclasses), o método retorna null como valor de segurança/fallback.
 * =====================================================================================
 */
