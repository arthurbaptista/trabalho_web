# TADS SYSTEM

**Gerenciamento de Manutenção de Equipamentos**

Trabalho final da disciplina Desenvolvimento Web II — Universidade Federal do Paraná (UFPR).

![Angular](https://img.shields.io/badge/Angular-22-dd0031)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1-6db33f)
![Java](https://img.shields.io/badge/Java-21-orange)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-banco-336791)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952b3)

## Sobre o projeto

O TADS SYSTEM controla as solicitações de manutenção de uma assistência técnica. O cliente se cadastra, abre uma solicitação descrevendo o equipamento e o defeito, e acompanha tudo até o pagamento. O funcionário recebe a solicitação, faz o orçamento, executa a manutenção e finaliza o atendimento.

Existem dois perfis de acesso, **Cliente** e **Funcionário**, cada um com as suas telas. O funcionário também gerencia categorias de equipamento, outros funcionários e consulta os relatórios de receita.

## Equipe

| Nome | GRR |
|------|-----|
| Arthur Dias Baptista | GRR20224100 |
| Eduardo Seiji Ishida | GRR20241969 |
| João Alberto François | GRR20211640 |
| Larissa Ribeiro Borges | GRR20204495 |
| Murilo Santana Cardoso | GRR20234187 |
| Nathaly Martins da Cunha | GRR20223387 |

## Usuários de teste

A senha de todos é `1234`.

| Perfil | Login |
|--------|-------|
| Funcionário | maria@manutencao.com |
| Funcionário | mario@manutencao.com |
| Cliente | joao@manutencao.com |
| Cliente | jose@manutencao.com |
| Cliente | joana@manutencao.com |
| Cliente | joaquina@manutencao.com |

## Fluxo de uma solicitação

Toda solicitação nasce como `ABERTA` e caminha por estados até ser `FINALIZADA`. Cliente e funcionário se alternam: cada um só consegue agir quando a solicitação está no estado certo.

### Passo a passo

1. **Abertura.** O cliente informa o equipamento, a categoria e o defeito. A solicitação fica `ABERTA`.
2. **Orçamento.** Um funcionário analisa e registra o valor. A solicitação passa para `ORCADA`.
3. **Decisão do cliente.** O cliente aprova (`APROVADA`) ou rejeita (`REJEITADA`). Para rejeitar, é obrigatório informar o motivo.
4. **Resgate.** Se o cliente rejeitou e mudou de ideia, ele pode resgatar a solicitação, que volta para `APROVADA`.
5. **Manutenção.** O funcionário executa o serviço, descreve o que foi feito e deixa orientações ao cliente. A solicitação fica `ARRUMADA`.
6. **Redirecionamento.** Em vez de fazer a manutenção, o funcionário pode passar a solicitação para outro funcionário (`REDIRECIONADA`). Quem recebe pode fazer a manutenção ou redirecionar outra vez.
7. **Pagamento.** Com o equipamento arrumado, o cliente paga. A solicitação fica `PAGA`.
8. **Finalização.** O funcionário encerra o atendimento e a solicitação fica `FINALIZADA`.

### Resumo das transições

| Ação | Quem faz | Estado exigido | Estado resultante |
|------|----------|----------------|-------------------|
| Abrir solicitação | Cliente | — | `ABERTA` |
| Orçar | Funcionário | `ABERTA` | `ORCADA` |
| Aprovar | Cliente | `ORCADA` | `APROVADA` |
| Rejeitar | Cliente | `ORCADA` | `REJEITADA` |
| Resgatar | Cliente | `REJEITADA` | `APROVADA` |
| Efetuar manutenção | Funcionário | `APROVADA` ou `REDIRECIONADA` | `ARRUMADA` |
| Redirecionar | Funcionário | `APROVADA` ou `REDIRECIONADA` | `REDIRECIONADA` |
| Pagar | Cliente | `ARRUMADA` | `PAGA` |
| Finalizar | Funcionário | `PAGA` | `FINALIZADA` |

Cada mudança de estado gera um registro no histórico da solicitação, com data, hora e o funcionário envolvido. Uma ação fora do estado correto é recusada pela API com a mensagem "Ação não permitida para o estado atual da solicitação."

## Funcionalidades

**Públicas**
- Login com e-mail e senha.
- Autocadastro de cliente, com senha gerada pelo sistema e enviada por e-mail.

**Cliente**
- Lista das próprias solicitações.
- Abertura de nova solicitação.
- Aprovação, rejeição e resgate de orçamento.
- Pagamento do serviço.
- Consulta ao histórico de cada solicitação.

**Funcionário**
- Lista de solicitações com filtros.
- Orçamento, manutenção, redirecionamento e finalização.
- Cadastro de categorias de equipamento.
- Cadastro de funcionários.
- Relatório de receitas por período e por categoria, com download em PDF.

## Tecnologias

| Camada | Tecnologia |
|--------|------------|
| Front-end | Angular 22 (standalone components) e Bootstrap 5.3.8 |
| Back-end | Spring Boot 4.1, Java 21, Spring Data JPA |
| Banco de dados | PostgreSQL |
| Autenticação | JWT, senhas com SHA-256 + SALT |
| Testes | Vitest (front) e JUnit (back) |
| Ambiente | Node.js 22 e Maven Wrapper |

## Como executar

**Pré-requisitos:** JDK 21, Node.js 22 e PostgreSQL.

1. Crie o banco `manutencao_db` no PostgreSQL.
2. Ajuste usuário e senha do banco em `back/src/main/resources/application.properties`.
3. Suba a API:

   ```bash
   cd back
   ./mvnw spring-boot:run      # Windows: mvnw.cmd spring-boot:run
   ```

4. Em outro terminal, suba o front:

   ```bash
   cd front
   npm install
   npm start                   # ou: npx ng serve
   ```

5. Acesse `http://localhost:4200/login` e entre com um dos usuários de teste.

A API roda em `http://localhost:8080`. As tabelas são criadas sozinhas na primeira execução, junto com os dados de teste.

## Dados de teste

Na primeira execução o sistema já vem populado:

| Dado | Quantidade | Detalhes |
|------|-----------|----------|
| Funcionários | 2 | Maria e Mario |
| Clientes | 4 | Joao, Jose, Joana e Joaquina |
| Categorias | 5 | Notebook, Desktop, Impressora, Mouse e Teclado |
| Solicitações | 20 | 4 por categoria, espalhadas por todos os estados |

Como há solicitações em todos os estados do fluxo, dá para testar cada tela e cada botão sem criar nada à mão. Para recarregar os dados do zero, recrie o banco `manutencao_db`.

## Estrutura do projeto

```text
trabalho_web/
├── back/                      # API Spring Boot
│   └── src/main/java/br/ufpr/trabalho_web/
│       ├── config/            # Segurança e dados iniciais
│       ├── controller/        # Endpoints REST
│       ├── dto/               # Requests e responses
│       ├── exception/         # Tratamento de erros
│       ├── model/             # Entidades JPA
│       ├── repository/        # Acesso a dados
│       ├── security/          # JWT e encoder de senha
│       └── service/           # Regras de negócio
└── front/                     # Aplicação Angular
    └── src/app/
        ├── auth/              # Login e autocadastro
        ├── cliente/           # Telas do cliente
        ├── funcionario/       # Telas do funcionário
        ├── shared/            # Componentes compartilhados
        └── core/              # Autenticação, guards e utilitários
```

## Rotas do front-end

| Rota | Acesso | Tela |
|------|--------|------|
| `/login` | Público | Login |
| `/cadastro` | Público | Autocadastro de cliente |
| `/cliente` | Cliente | Tela inicial do cliente |
| `/funcionario` | Funcionário | Gestão de solicitações |
| `/categorias` | Funcionário | Categorias |
| `/funcionarios` | Funcionário | Funcionários |
| `/relatorios/receitas` | Funcionário | Relatório de receitas |
| `/relatorios/receitas-categoria` | Funcionário | Receitas por categoria |
