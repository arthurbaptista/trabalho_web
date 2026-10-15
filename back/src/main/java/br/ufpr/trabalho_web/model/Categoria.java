package br.ufpr.trabalho_web.model;

import jakarta.persistence.*;

@Entity
@Table(name = "categoria")
public class Categoria extends StatusBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    // Construtor vazio
    public Categoria() {
    }

    // Getters e Setters
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
}

/*
 * ============================================================
 * SOBRE O PROJETO (trabalho_web - back-end)
 * ============================================================
 *
 * Este arquivo define a entidade Categoria, uma das pecas do
 * back-end do trabalho de Desenvolvimento Web (UFPR). O back-end
 * e uma API REST construida com Java e Spring Boot, que atende
 * o front-end da aplicacao.
 *
 * VISAO GERAL
 * -----------
 * O sistema gerencia solicitacoes de servico feitas por clientes
 * e atendidas por funcionarios. O cliente abre uma solicitacao,
 * o funcionario a analisa, envia um orcamento, e o cliente pode
 * aprovar ou rejeitar. Cada mudanca de situacao e registrada em
 * um historico, permitindo acompanhar todo o ciclo de vida.
 *
 * ARQUITETURA EM CAMADAS
 * ----------------------
 * O projeto segue a organizacao classica do Spring:
 *   - controller : recebe as requisicoes HTTP e devolve JSON.
 *   - service    : concentra as regras de negocio.
 *   - repository : acesso ao banco de dados via Spring Data JPA.
 *   - model      : entidades JPA mapeadas para tabelas.
 *   - dto        : objetos de entrada e saida da API.
 *   - security   : autenticacao, JWT e criptografia de senha.
 *   - exception  : excecoes de negocio e tratamento global.
 *   - config     : seguranca e carga de dados iniciais.
 *
 * ENTIDADES PRINCIPAIS
 * --------------------
 *   - Usuario     : dados de acesso comuns ao sistema.
 *   - Cliente     : usuario que abre solicitacoes; possui Endereco.
 *   - Funcionario : usuario que atende e orca solicitacoes.
 *   - Endereco    : dados de localizacao do cliente.
 *   - Categoria   : classifica o tipo de equipamento/servico.
 *   - Solicitacao : pedido aberto pelo cliente.
 *   - HistoricoSolicitacao : trilha de mudancas de situacao.
 *
 * SOBRE ESTA CLASSE
 * -----------------
 * Categoria possui apenas um identificador (id) e um nome de ate
 * 100 caracteres, obrigatorio. O id e gerado automaticamente pelo
 * banco (GenerationType.IDENTITY). A classe e mapeada para a
 * tabela "categoria" por meio das anotacoes @Entity e @Table.
 *
 * Ela estende StatusBase, classe base compartilhada que controla
 * o status do registro. Assim, uma categoria nao precisa ser
 * apagada fisicamente: pode ser apenas inativada, preservando as
 * solicitacoes antigas que ja a referenciam (exclusao logica).
 *
 * As categorias iniciais sao inseridas na subida da aplicacao
 * pela classe CategoriaDadosIniciais, para que o sistema ja
 * funcione sem cadastro manual previo.
 *
 * REGRAS DE NEGOCIO RELACIONADAS
 * ------------------------------
 *   - O nome da categoria e obrigatorio (nullable = false).
 *   - Nomes duplicados sao tratados na camada de service, que
 *     pode lancar RecursoDuplicadoException.
 *   - Violacoes de regra viram respostas HTTP padronizadas
 *     atraves do ApiExceptionHandler.
 *   - O acesso aos endpoints de categoria e controlado pelo
 *     SecurityConfig, conforme o perfil do usuario.
 *
 * SEGURANCA
 * ---------
 *   - Autenticacao por login e senha, com emissao de token JWT.
 *   - O JwtAuthenticationFilter valida o token a cada requisicao.
 *   - Senhas sao armazenadas com hash SHA-256 e salt, via
 *     Sha256SaltPasswordEncoder, nunca em texto puro.
 *   - Os perfis (cliente e funcionario) limitam o acesso aos
 *     endpoints de cada area.
 *
 * NOTIFICACOES
 * ------------
 *   - O EmailService envia mensagens por e-mail aos usuarios,
 *     por exemplo para informar dados de acesso.
 *
 * TESTES
 * ------
 *   - Os services possuem testes unitarios que cobrem os
 *     requisitos funcionais (RFs) do enunciado, como o fluxo
 *     de solicitacoes do funcionario.
 *
 * MANUTENCAO
 * ----------
 *   - Manter getters e setters simples; regras ficam no service.
 *   - Ao adicionar campos, atualizar DTOs e testes.
 *   - Preferir inativar categorias em vez de remove-las.
 *
 * OBSERVACOES FINAIS
 * ------------------
 *   - Categoria e referenciada por Solicitacao, entao mudancas
 *     nesta classe podem impactar o restante do dominio.
 *   - Alteracoes no mapeamento exigem conferir o banco de dados.
 *   - Documentar qualquer nova regra neste bloco de comentario.
 *
 * ============================================================
 */