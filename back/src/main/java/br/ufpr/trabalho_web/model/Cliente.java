package br.ufpr.trabalho_web.model;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("CLIENTE")
public class Cliente extends Usuario {

    // CPF deve ser único para atender ao requisito de autocadastro
    @Column(unique = true, length = 14)
    private String cpf;

    @Column(length = 20)
    private String telefone;

    // Injeta os campos da classe Endereco (cep, rua, etc) diretamente na tabela usuario
    @Embedded
    private Endereco endereco;

    public Cliente() {
    }

    // --- Getters e Setters ---

    public String getCpf() {
        return cpf;
    }
    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getTelefone() {
        return telefone;
    }
    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public Endereco getEndereco() {
        return endereco;
    }
    public void setEndereco(Endereco endereco) {
        this.endereco = endereco;
    }
}
/*
 * ============================================================================
 * CLASSE: Cliente
 * ============================================================================
 *
 * 1. VISÃO GERAL
 * ----------------------------------------------------------------------------
 * Esta classe representa o perfil de CLIENTE dentro do sistema. Ela é uma
 * entidade JPA (@Entity) e, portanto, é mapeada para uma tabela do banco de
 * dados relacional. Um cliente é o usuário final que se cadastra sozinho
 * (autocadastro) para utilizar as funcionalidades da aplicação.
 *
 * 2. HERANÇA
 * ----------------------------------------------------------------------------
 * Cliente estende Usuario. Isso significa que ela herda todos os atributos
 * comuns a qualquer pessoa autenticada no sistema, como id, nome, e-mail,
 * senha e perfil. Aqui declaramos apenas o que é específico do cliente:
 * CPF, telefone e endereço.
 *
 * A estratégia de herança é definida na classe pai (Usuario). Pelo uso de
 * @DiscriminatorValue, sabemos que é a estratégia SINGLE_TABLE: todos os
 * tipos de usuário (cliente, funcionário, etc.) ficam em UMA única tabela.
 *
 * 3. DISCRIMINATOR VALUE
 * ----------------------------------------------------------------------------
 * A anotação @DiscriminatorValue("CLIENTE") define o valor gravado na coluna
 * discriminadora (por exemplo, "tipo") para as linhas que pertencem a esta
 * classe. Quando o Hibernate lê uma linha com valor "CLIENTE", ele sabe que
 * deve instanciar um objeto Cliente. Isso permite consultas polimórficas,
 * como buscar todos os Usuario e receber instâncias dos tipos corretos.
 *
 * 4. ATRIBUTOS
 * ----------------------------------------------------------------------------
 * a) cpf (String)
 *    - Mapeado com @Column(unique = true, length = 14).
 *    - A restrição de unicidade impede dois clientes com o mesmo CPF e
 *      atende ao requisito de autocadastro: uma pessoa, um cadastro.
 *    - O tamanho 14 comporta o CPF formatado (000.000.000-00), que possui
 *      11 dígitos mais 3 caracteres de pontuação.
 *    - Como a tabela é compartilhada, a coluna aceita NULL para as linhas de
 *      outros tipos de usuário, e a unicidade vale só para valores não nulos.
 *
 * b) telefone (String)
 *    - Mapeado com @Column(length = 20).
 *    - É String, e não número, para preservar zeros à esquerda, DDD, o sinal
 *      de "+" e eventuais máscaras de formatação.
 *    - O limite de 20 caracteres cobre números nacionais e internacionais.
 *
 * c) endereco (Endereco)
 *    - Mapeado com @Embedded.
 *    - Endereco é um objeto de valor, sem identidade própria nem tabela
 *      própria. Seus campos (cep, rua, número, cidade, etc.) são "injetados"
 *      como colunas diretamente na tabela de usuários.
 *    - Vantagem: o código fica organizado, com o endereço agrupado em uma
 *      classe, e o banco evita um JOIN extra para consultar o endereço.
 *    - Atenção: se não houver endereço preenchido, os campos ficam NULL.
 *
 * 5. CONSTRUTOR
 * ----------------------------------------------------------------------------
 * O construtor sem argumentos é obrigatório para a JPA. O Hibernate usa
 * reflexão para criar o objeto ao ler os dados do banco e só depois
 * preenche os atributos. Por isso ele precisa existir e ser acessível
 * (public ou protected). O corpo vazio é intencional: não há inicialização
 * especial necessária.
 *
 * 6. GETTERS E SETTERS
 * ----------------------------------------------------------------------------
 * Os métodos de acesso seguem o padrão JavaBeans. Eles são usados por:
 *   - o Hibernate (caso o acesso seja por propriedade);
 *   - o Jackson, que serializa/desserializa o objeto em JSON nas respostas
 *     e requisições dos controllers REST;
 *   - os serviços da aplicação, que leem e alteram os dados do cliente.
 * Não há regra de negócio nesses métodos; eles apenas leem e gravam valores.
 *
 * 7. PONTOS DE ATENÇÃO E MELHORIAS POSSÍVEIS
 * ----------------------------------------------------------------------------
 *   - A validação do CPF (dígitos verificadores) NÃO é feita aqui. Deve ser
 *     tratada na camada de serviço ou com Bean Validation (ex.: @CPF).
 *   - A unicidade é garantida pelo banco, mas a camada de serviço deve checar
 *     antes de salvar, para devolver uma mensagem de erro amigável em vez de
 *     uma exceção de violação de constraint.
 *   - Considere armazenar CPF e telefone apenas com dígitos, formatando só
 *     na apresentação, para simplificar buscas e comparações.
 *   - Considere anotar os campos com @NotBlank/@Size para validar a entrada
 *     já na borda da API.
 *   - Dados como CPF e endereço são pessoais (LGPD). Evite registrá-los em
 *     logs e restrinja o acesso a eles.
 *
 * 8. RESUMO
 * ----------------------------------------------------------------------------
 * Cliente = Usuario + CPF único + telefone + endereço embutido, gravado na
 * tabela única de usuários com o discriminador "CLIENTE".
 * ============================================================================
 */
