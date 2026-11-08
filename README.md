# Trabalho Final - TADS SYSTEM — Gerenciamento de Manutenção de Equipamentos

Este repositório contém o código e os materiais referentes ao **Trabalho Final** da disciplina Desenvolvimento Web II — Universidade Federal do Paraná (UFPR).

## Equipe

| Nome | GRR |
|------|-----|
| Arthur Dias Baptista | GRR20224100 |
| Eduardo Seiji Ishida | GRR20241969 |
| João Alberto François | GRR20211640 |
| Larissa Ribeiro Borges | GRR20204495 |
| Murilo Santana Cardoso | GRR20234187 |
| Nathaly Martins da Cunha | GRR20223387 |

## Descrição do Projeto

O **Sistema de Controle de Manutenção de Equipamentos** tem como objetivo gerenciar as solicitações de manutenção de equipamentos, permitindo que clientes registrem manutenções e que funcionários da empresa gerenciem essas solicitações. O sistema possui funcionalidades como autocadastro de clientes, login de usuários, registro de solicitações, aprovação de orçamentos, e gestão do estado das solicitações, com diferentes perfis de acesso (Cliente e Funcionário). O sistema também oferece relatórios financeiros e de categorias de equipamentos.

## Instruções de Execução

**Para Logar Como Funcionário** 
- Login: maria@manutencao.com
- Senha: 1234

- Login: mario@manutencao.com
- Senha: 1234

**Para Logar Como Cliente** 
- Login: joao@manutencao.com
- Senha: 1234
- Login: jose@manutencao.com
- Senha: 1234
- Login: joana@manutencao.com
- Senha: 1234
- Login: joaquina@manutencao.com
- Senha: 1234

## Tecnologias Utilizadas

- Angular 22.0.0
- Bootstrap v5.3.8
- Java 21.0.12
- Nodejs v22.22.3

## Arquitetura e Detalhes Técnicos

### Visão Geral
O projeto é dividido em duas aplicações independentes na mesma raiz:
- `front/`: aplicação Angular (standalone components) com Bootstrap.
- `back/`: API REST em Spring Boot 4.1 (Java 21) com Maven Wrapper.
- O front consome a API por HTTP e a autenticação é feita via token JWT.

### Estrutura do Back-end
O pacote base é `br.ufpr.trabalho_web`, organizado em camadas:
- `controller`: endpoints REST (Auth, Cliente, Funcionário, Categoria, Solicitação, Orçamento e Relatório).
- `service`: regras de negócio, como transições de estado e validações.
- `repository`: acesso a dados com Spring Data JPA.
- `model`: entidades JPA (Usuário, Cliente, Funcionário, Endereço, Categoria, Solicitação e Histórico).
- `dto`: objetos de entrada e saída da API.
- `security`: filtro JWT, utilitário de token e encoder de senha SHA-256 com SALT.
- `exception`: tratamento centralizado de erros (`ApiExceptionHandler`).
- `config`: configuração do Spring Security e carga dos dados iniciais.

### Estrutura do Front-end
Em `front/src/app` as telas ficam separadas por perfil de usuário:
- `auth`: login e autocadastro (telas públicas).
- `cliente`: tela inicial, nova solicitação e detalhe da solicitação.
- `funcionario`: solicitações, detalhe, categorias, funcionários, relatórios e sidebar.
- `shared`: logo e código de solicitação reaproveitado por cliente e funcionário.
- `core`: serviço de autenticação, guards (auth, cliente, funcionário) e utilitários da API.
- As rotas ficam em `app.routes.ts` e a configuração global em `app.config.ts`.

### Principais Endpoints da API
- `POST /auth/login`: autentica o usuário e retorna o token e o perfil.
- `POST /clientes/cadastro`: autocadastro de cliente.
- `GET/PUT/DELETE /categorias` e `/funcionarios`: CRUDs administrativos.
- `POST /api/solicitacoes/cliente`: abertura de solicitação pelo cliente.
- `PATCH /api/solicitacoes/{id}/orcar`: registra o orçamento.
- `PATCH /api/solicitacoes/{id}/aprovar` e `/rejeitar`: decisão do cliente sobre o orçamento.
- `PATCH /api/solicitacoes/{id}/resgatar`: reverte uma rejeição para aprovada.
- `PATCH /api/solicitacoes/{id}/manutencao`, `/redirecionar`, `/pagar` e `/finalizar`: demais etapas do fluxo.
- `GET /relatorios/receitas` e `/relatorios/receitas-categoria`: relatórios de receita.

### Regras de Negócio Importantes
- A remoção de funcionários e categorias é lógica (desativação), preservando o histórico.
- Um funcionário não pode remover a si mesmo.
- O último funcionário ativo do sistema não pode ser removido.
- Não é permitido cadastrar CPF ou e-mail duplicado (`RecursoDuplicadoException`).
- Violações de regra retornam erro tratado por `RegraNegocioException`.
- Toda mudança de estado de uma solicitação gera um registro no histórico.

### Como Executar
1. Crie o banco PostgreSQL `manutencao_db` e ajuste usuário e senha em `back/src/main/resources/application.properties`.
2. No diretório `back`, execute `./mvnw spring-boot:run` (a API sobe na porta 8080).
3. Em outro terminal, entre em `front`, rode `npm install` e depois `ng serve`.
4. Acesse `http://localhost:4200/login` e use as credenciais de teste listadas acima.
5. As tabelas são criadas automaticamente (`ddl-auto=update`) e os dados iniciais são carregados na primeira execução.
6. Para enviar e-mails reais com a senha gerada, descomente e configure as propriedades `spring.mail.*`; sem isso a senha aparece no log do back-end.

### Testes
- Back-end: `./mvnw test` executa os testes unitários e de serviço.
- Front-end: `ng test` executa os testes com Vitest.


## Máquina de Estados da Solicitação

Todas as transições são validadas em `SolicitacaoService`; uma ação fora do estado correto lança `RegraNegocioException`
("Ação não permitida para o estado atual da solicitação.").

| Ação | Quem executa | Estado exigido | Estado resultante |
|------|--------------|----------------|-------------------|
| Abrir solicitação | Cliente | — | `ABERTA` |
| Orçar (`/orcar`) | Funcionário | `ABERTA` | `ORCADA` |
| Aprovar (`/aprovar`) | Cliente | `ORCADA` | `APROVADA` |
| Rejeitar (`/rejeitar`) | Cliente | `ORCADA` | `REJEITADA` (exige motivo) |
| Resgatar (`/resgatar`) | Cliente | `REJEITADA` | `APROVADA` |
| Efetuar manutenção (`/manutencao`) | Funcionário | `APROVADA` ou `REDIRECIONADA` | `ARRUMADA` |
| Redirecionar (`/redirecionar`) | Funcionário | `APROVADA` ou `REDIRECIONADA` | `REDIRECIONADA` |
| Pagar (`/pagar`) | Cliente | `ARRUMADA` | `PAGA` |
| Finalizar (`/finalizar`) | Funcionário | `PAGA` | `FINALIZADA` |

Fluxo principal: `ABERTA → ORCADA → APROVADA → ARRUMADA → PAGA → FINALIZADA`.
Desvios: `ORCADA → REJEITADA → APROVADA` (resgate) e `APROVADA → REDIRECIONADA → ARRUMADA`.

## Modelo de Dados

- `usuario`: tabela única (`SINGLE_TABLE`) que armazena Cliente e Funcionário, diferenciados pelo perfil.
- `usuario.email` é único; `cliente.cpf` também é único.
- `solicitacao`: guarda descrição do equipamento (máx. 30 caracteres), descrição do defeito, estado atual,
  valor do orçamento, motivo de rejeição, descrição da manutenção e orientações ao cliente.
- `solicitacao` se relaciona com o cliente dono, a categoria do equipamento e o funcionário responsável.
- `historico_solicitacao`: uma linha por mudança de estado, com data/hora, estado alcançado, funcionário
  de origem e, no caso de redirecionamento, funcionário de destino.
- `categoria` e `funcionario` usam `StatusBase` para controlar o campo de ativo/inativo (remoção lógica).
- As tabelas são geradas pelo Hibernate (`ddl-auto=update`), então não há scripts SQL de migração.

## Autenticação e Segurança

- O login (`POST /auth/login`) devolve um token JWT e o perfil do usuário.
- O `JwtAuthenticationFilter` lê o token do cabeçalho `Authorization: Bearer <token>` e disponibiliza o usuário
  autenticado para os controllers (atributo de requisição `usuario`).
- No front, os guards `auth`, `cliente` e `funcionario` (em `front/src/app/core`) bloqueiam rotas por perfil.
- Senhas são salvas com SHA-256 + SALT (`Sha256SaltPasswordEncoder`), nunca em texto puro.
- O CORS permite apenas a origem `http://localhost:4200`.
- Atenção: o `SecurityConfig` atual libera todas as rotas (`anyRequest().permitAll()`); a restrição por perfil é
  feita pelos guards do front e pelas validações dos serviços. Para um ambiente real, as rotas deveriam
  exigir autenticação e papel (`hasRole`) também no back-end.

## Configuração do Ambiente

| Item | Valor padrão |
|------|--------------|
| Porta da API | `8080` |
| Porta do front | `4200` |
| Banco de dados | PostgreSQL em `localhost:5432`, banco `manutencao_db` |
| Usuário do banco | `postgres` (a senha fica em `application.properties`) |
| Fuso horário | `America/Sao_Paulo` |

- Altere `spring.datasource.username` e `spring.datasource.password` conforme o seu PostgreSQL local.
- Não publique senhas reais no repositório; use variáveis de ambiente em um cenário de produção.
- Pré-requisitos: JDK 21, Node.js 22 e PostgreSQL instalados.
- O Maven Wrapper (`mvnw` / `mvnw.cmd`) dispensa instalar o Maven.
- O log SQL está ativo (`show-sql=true`), o que ajuda a depurar mas deixa o terminal verboso.

## Estrutura de Pastas

```text
trabalho_web/
├── back/                      # API Spring Boot
│   ├── pom.xml
│   └── src/main/java/br/ufpr/trabalho_web/
│       ├── config/            # SecurityConfig e dados iniciais
│       ├── controller/        # Endpoints REST
│       ├── dto/               # Requests e responses
│       ├── exception/         # Tratamento de erros
│       ├── model/             # Entidades JPA
│       ├── repository/        # Spring Data JPA
│       ├── security/          # JWT e encoder de senha
│       └── service/           # Regras de negócio
└── front/                     # Aplicação Angular
    └── src/app/
        ├── auth/              # Login e autocadastro
        ├── cliente/           # Tela inicial, nova solicitação e detalhe
        ├── funcionario/       # Solicitações, categorias, funcionários e relatórios
        ├── shared/            # Logo e código de solicitação compartilhado
        └── core/              # Autenticação, guards e utilitários da API
```

## Problemas Comuns

- **Erro de conexão com o banco ao subir a API:** confirme que o PostgreSQL está rodando e que o banco
  `manutencao_db` existe (ele não é criado automaticamente, apenas as tabelas).
- **Erro de CORS no navegador:** o front precisa rodar em `http://localhost:4200`, a única origem liberada.
- **Senha do cadastro não chegou por e-mail:** sem `spring.mail.*` configurado, a senha é impressa no log da API.
- **Dados iniciais duplicados ou ausentes:** eles são carregados na primeira execução; para recarregar,
  esvazie as tabelas ou recrie o banco.
- **`ng` não encontrado:** use `npx ng serve` ou `npm start` dentro de `front`.

///////////////////////////////////////////






# TADS SYSTEM — Gerenciamento de Manutenção de Equipamentos

Sistema web para controle de solicitações de manutenção de equipamentos,
desenvolvido como trabalho da disciplina de Desenvolvimento Web II (UFPR).

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Pré-requisitos](#pré-requisitos)
- [Como rodar o frontend](#como-rodar-o-frontend)
- [Como rodar o backend](#como-rodar-o-backend)
- [Funcionalidades](#funcionalidades)
- [Padrão de branches](#padrão-de-branches)
- [Padrão de commits](#padrão-de-commits)
- [Equipe](#equipe)

## Sobre o projeto

O TADS SYSTEM permite que clientes abram solicitações de manutenção e que
funcionários acompanhem, orcem e finalizem essas solicitações. Cada
solicitação passa por um fluxo de estados (aberta, orçada, aprovada,
rejeitada, em execução, finalizada, paga), com histórico de alterações.

## Tecnologias

| Camada    | Tecnologia                                  |
|-----------|---------------------------------------------|
| Frontend  | Angular (standalone components, sem NgModule) |
| Backend   | Spring Boot                                 |
| Banco     | <PostgreSQL / H2 / MySQL>                   |
| Fonte     | Inter (Google Fonts)                        |
| Editor    | VS Code                                     |

## Estrutura do repositório
# TADS SYSTEM — Gerenciamento de Manutenção de Equipamentos

Sistema web para controle de solicitações de manutenção de equipamentos,
desenvolvido como trabalho da disciplina de Desenvolvimento Web II (UFPR).

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Pré-requisitos](#pré-requisitos)
- [Como rodar o frontend](#como-rodar-o-frontend)
- [Como rodar o backend](#como-rodar-o-backend)
- [Funcionalidades](#funcionalidades)
- [Padrão de branches](#padrão-de-branches)
- [Padrão de commits](#padrão-de-commits)
- [Equipe](#equipe)

## Sobre o projeto

O TADS SYSTEM permite que clientes abram solicitações de manutenção e que
funcionários acompanhem, orcem e finalizem essas solicitações. Cada
solicitação passa por um fluxo de estados (aberta, orçada, aprovada,
rejeitada, em execução, finalizada, paga), com histórico de alterações.

## Tecnologias

| Camada    | Tecnologia                                  |
|-----------|---------------------------------------------|
| Frontend  | Angular (standalone components, sem NgModule) |
| Backend   | Spring Boot                                 |
| Banco     | <PostgreSQL / H2 / MySQL>                   |
| Fonte     | Inter (Google Fonts)                        |
| Editor    | VS Code                                     |

## Estrutura do repositório

```text
trabalho_web/
├── back/    # API REST (Spring Boot, Java 21, Maven)
└── front/   # Aplicação web (Angular, Bootstrap)
```

## Pré-requisitos

- JDK 21
- Node.js 22 e npm
- PostgreSQL com o banco `manutencao_db` criado
- Git

## Como rodar o frontend

```bash
cd front
npm install
npm start        # ou: npx ng serve
```

- A aplicação fica disponível em `http://localhost:4200`.
- A rota inicial redireciona para `/login`.
- Testes: `npm test` (Vitest).

## Como rodar o backend

```bash
cd back
./mvnw spring-boot:run     # Windows: mvnw.cmd spring-boot:run
```

- A API sobe em `http://localhost:8080`.
- Ajuste usuário e senha do banco em `back/src/main/resources/application.properties`.
- Testes: `./mvnw test`.

## Funcionalidades

### Públicas
- Login com e-mail e senha (`/login`).
- Autocadastro de cliente (`/cadastro`), com senha gerada pelo sistema e enviada por e-mail.

### Perfil Cliente
- Tela inicial com a lista das próprias solicitações (`/cliente`).
- Abertura de solicitação de manutenção informando equipamento, categoria e defeito.
- Aprovação ou rejeição do orçamento (a rejeição exige motivo).
- Resgate de uma solicitação rejeitada.
- Pagamento do serviço após a manutenção.
- Consulta ao histórico de cada solicitação.

### Perfil Funcionário
- Lista de solicitações com filtros (`/funcionario`).
- Orçamento, manutenção, redirecionamento e finalização de solicitações.
- CRUD de categorias de equipamento (`/categorias`).
- CRUD de funcionários (`/funcionarios`).
- Relatório de receitas por período (`/relatorios/receitas`).
- Relatório de receitas por categoria (`/relatorios/receitas-categoria`).

## Rotas do Front-end

| Rota | Acesso | Tela |
|------|--------|------|
| `/login` | Público | Login |
| `/cadastro` | Público | Autocadastro de cliente |
| `/home` | Autenticado | Redireciona conforme o perfil |
| `/cliente` | Cliente | Tela inicial do cliente |
| `/funcionario` | Funcionário | Gestão de solicitações |
| `/categorias` | Funcionário | Categorias |
| `/funcionarios` | Funcionário | Funcionários |
| `/relatorios/receitas` | Funcionário | Relatório de receitas |
| `/relatorios/receitas-categoria` | Funcionário | Receitas por categoria |

## Padrão de branches

- `main`: versão estável do projeto; recebe alterações somente via Pull Request.
- `feature/<nome>`: novas funcionalidades (ex.: `feature/categoria-management`).
- `fix/<nome>`: correções de bugs.
- `refactor/<nome>`: mudanças de código ou layout sem alterar o comportamento.

## Padrão de commits

- Mensagens curtas, no imperativo e descrevendo o que mudou.
- Prefixos opcionais: `feat:`, `fix:`, `refactor:`, `docs:`.
- Exemplos: `fix: ajusta tela de login`, `refactor: atualiza layout das telas de funcionarios`.
- Cada Pull Request deve ser revisado por pelo menos um integrante antes do merge.

## Disciplina

- Desenvolvimento Web II — Universidade Federal do Paraná (UFPR).
