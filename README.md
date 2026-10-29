# Trabalho Final

Este repositório contém o código e os materiais referentes ao **Trabalho Final** da disciplina WEB II

## Integrantes do Grupo

- **Arthur Dias Baptista**  
  GRR20224100

- **Eduardo Seiji Ishida**  
  GRR20241969
  
- **João Alberto François**  
  GRR20211640
  
- **Larissa Ribeiro Borges**  
  GRR20204495
  
- **Murilo Santana Cardoso**  
  GRR20234187

- **Nathaly Martins da Cunha**  
  GRR20223387

## Descrição do Projeto

O **Sistema de Controle de Manutenção de Equipamentos** tem como objetivo gerenciar as solicitações de manutenção de equipamentos, permitindo que clientes registrem manutenções e que funcionários da empresa gerenciem essas solicitações. O sistema possui funcionalidades como autocadastro de clientes, login de usuários, registro de solicitações, aprovação de orçamentos, e gestão do estado das solicitações, com diferentes perfis de acesso (Cliente e Funcionário). O sistema também oferece relatórios financeiros e de categorias de equipamentos.

## Instruções de Execução

**Para Logar Como Funcionário** 
- Login: maria@manutencao.com
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

  
Funcionalidades do Sistema

O sistema foi desenvolvido para atender dois tipos principais de usuários: Clientes e Funcionários.

Cada perfil possui funcionalidades específicas de acordo com suas responsabilidades dentro do fluxo de manutenção.

Funcionalidades do Cliente

O cliente pode realizar seu autocadastro no sistema.

Após o cadastro, o cliente pode realizar login utilizando suas credenciais.

O cliente pode cadastrar novas solicitações de manutenção.

Cada solicitação está associada a um equipamento que necessita de manutenção.

O cliente pode acompanhar o andamento das solicitações cadastradas.

As solicitações possuem diferentes estados durante o processo de manutenção.

Quando um orçamento é disponibilizado, o cliente pode consultar seu valor.

O cliente pode aprovar ou rejeitar o orçamento apresentado.

Após a conclusão do serviço, o cliente pode visualizar o resultado da manutenção.

O histórico permite acompanhar solicitações realizadas anteriormente.

Funcionalidades do Funcionário

O funcionário possui acesso a uma área específica do sistema.

Nesta área é possível visualizar as solicitações de manutenção cadastradas pelos clientes.

O funcionário pode analisar cada solicitação recebida.

Também é possível alterar o estado de uma solicitação conforme o andamento do atendimento.

O funcionário pode elaborar um orçamento para a manutenção solicitada.

O orçamento fica disponível para análise do cliente.

Após a aprovação do orçamento, a manutenção pode seguir para as próximas etapas.

O funcionário pode registrar a execução do serviço.

Também é possível registrar a conclusão da manutenção.

O sistema mantém as informações necessárias para acompanhamento do processo.

Fluxo de uma Solicitação

O processo começa quando o cliente registra uma nova solicitação de manutenção.

A solicitação é disponibilizada para análise dos funcionários.

Um funcionário analisa o equipamento e a descrição do problema informado.

Após a análise, pode ser elaborado um orçamento para o serviço.

O orçamento é encaminhado para aprovação do cliente.

O cliente pode aceitar ou rejeitar o orçamento.

Caso o orçamento seja aprovado, a solicitação continua no fluxo de manutenção.

O funcionário realiza ou registra a execução do serviço.

Durante o processo, o estado da solicitação é atualizado.

Ao final da manutenção, a solicitação é marcada como concluída.

Dessa forma, o sistema mantém todo o ciclo da manutenção organizado.

Perfis de Acesso

O sistema utiliza diferentes perfis de acesso para separar as responsabilidades dos usuários.

O perfil Cliente possui acesso às funcionalidades relacionadas às suas próprias solicitações.

O perfil Funcionário possui acesso às funcionalidades administrativas e operacionais.

Essa separação permite controlar quais operações cada usuário pode executar.

Também evita que clientes tenham acesso às funcionalidades internas destinadas aos funcionários.

Interface

A interface foi desenvolvida utilizando Angular.

O Bootstrap é utilizado para auxiliar na construção do layout e dos componentes visuais.

O NG Bootstrap permite utilizar componentes integrados ao ecossistema Angular.

O FontAwesome é utilizado para disponibilizar ícones na interface.

O objetivo da interface é oferecer uma navegação simples entre as funcionalidades do sistema.

Relatórios

O sistema possui funcionalidades relacionadas à geração e visualização de relatórios.

Entre os dados disponíveis estão informações financeiras das manutenções.

Também podem ser analisadas informações relacionadas às categorias dos equipamentos.

Esses dados auxiliam no acompanhamento das solicitações registradas no sistema.

Organização do Projeto

O projeto segue a estrutura padrão utilizada por aplicações Angular.

Os componentes representam diferentes partes da interface da aplicação.

Os serviços são responsáveis por centralizar regras e operações compartilhadas.

As rotas controlam a navegação entre as páginas do sistema.

Os modelos representam as principais entidades utilizadas pela aplicação.

Essa organização facilita a manutenção e evolução do código.

Objetivo Acadêmico

Este projeto foi desenvolvido como Trabalho Final da disciplina WEB II.

O trabalho tem como objetivo aplicar os conceitos estudados durante a disciplina.

Entre eles estão desenvolvimento de aplicações web, criação de componentes e organização de interfaces.

Também são aplicados conceitos relacionados a rotas, formulários e gerenciamento de dados.

O projeto busca integrar esses conhecimentos em uma aplicação funcional.

Observações

As credenciais apresentadas neste README são destinadas exclusivamente à execução e avaliação acadêmica do projeto.

O sistema foi desenvolvido para fins educacionais.

As funcionalidades implementadas seguem os requisitos definidos para o Trabalho Final da disciplina.

Funcionalidades do Sistema
O sistema atende dois perfis: Cliente e Funcionário, cada um com telas e ações próprias.
O acesso exige login, com exceção do autocadastro de clientes e da própria tela de login.
O cliente se cadastra informando CPF, nome, e-mail, telefone e endereço completo.
O CEP preenche o endereço automaticamente pela API ViaCEP, e todos os dados são armazenados.
Após o cadastro, uma senha numérica de 4 dígitos é gerada e enviada por e-mail.
O login identifica o perfil automaticamente e redireciona o usuário para a tela inicial correspondente.
A tela inicial do cliente lista todas as suas solicitações, em ordem crescente de data e hora.
Cada linha mostra descrição do equipamento (até 30 caracteres), data/hora, categoria e estado.
Há um botão para visualizar a solicitação, com dados completos e histórico de atualizações.
As ações mudam conforme o estado: aprovar/rejeitar, resgatar, pagar ou apenas visualizar.
O cliente registra uma nova manutenção informando equipamento, categoria e descrição do defeito.
A solicitação é criada no estado ABERTA, com data e hora do registro.
Quando o serviço é orçado, o cliente vê o valor em destaque e pode aprovar ou rejeitar.
A aprovação muda o estado para APROVADA; a rejeição exige motivo e passa para REJEITADA.
Uma solicitação rejeitada pode ser resgatada, voltando para APROVADA e registrando o histórico.
Quando o equipamento está ARRUMADA, o cliente confirma o pagamento e a data/hora é gravada.
O funcionário vê primeiro as solicitações ABERTAS, que precisam de orçamento imediato.
Na listagem geral, o funcionário filtra por hoje, período ou todas, em ordem de data/hora.
As cores indicam o estado: cinza, marrom, vermelho, amarelo, roxo, azul, laranja e verde.
O funcionário efetua o orçamento, registra valor, data/hora e o responsável, e o estado vira ORÇADA.
Depois pode efetuar a manutenção, redirecionar para outro funcionário ou finalizar o pedido.
O redirecionamento não pode ser feito para si mesmo e fica registrado no histórico.
O funcionário também mantém o CRUD de categorias de equipamento e o CRUD de funcionários.
Relatórios de receita podem ser gerados por período (agrupado por dia) e por categoria.
Estados possíveis: ABERTA, ORÇADA, APROVADA, REJEITADA, REDIRECIONADA, ARRUMADA, PAGA e FINALIZADA.
A interface do front segue o visual das telas de login e autocadastro, em tema escuro.
As telas autenticadas usam barra lateral, listagens e modais para criação e detalhe da solicitação.
O front é Angular (standalone) e o back é Spring Boot com API REST e PostgreSQL.
As senhas são armazenadas com hash SHA-256 e SALT; as remoções desativam o registro.
Datas e valores monetários são exibidos no formato brasileiro.
Dados iniciais para teste: 2 funcionários (Maria e Mário) e 4 clientes (João, José, Joana e Joaquina).
Há 5 categorias: Notebook, Desktop, Impressora, Mouse e Teclado.
Uma massa de solicitações cobre estados, datas e clientes diferentes para avaliação dos requisitos.
Login de funcionário: maria@manutencao.com / senha 1234.
Login de cliente: joao@manutencao.com / senha 1234.
Também existem jose@manutencao.com, joana@manutencao.com e joaquina@manutencao.com, senha 1234.
Para executar o back, configure o PostgreSQL e suba a API Spring Boot na porta 8080.
Para executar o front, entre na pasta front e rode o servidor Angular (ng serve), em geral na porta 4200.
Com o front no ar, a rota /login abre o acesso; /cadastro abre o autocadastro.
Após o login, o cliente vai para /cliente e o funcionário para a área operacional correspondente.
Se a API estiver fora, a tela do cliente ainda pode ser vista com dados de exemplo no front.
O botão Nova Solicitação abre um modal para cadastrar equipamento, categoria e defeito.
A confirmação inclui a solicitação na lista no estado Aberta, mesmo sem o backend respondendo.
O projeto foi feito para o Trabalho Final de WEB II (UFPR/SEPT/TADS).
Os requisitos funcionais principais cobertos incluem RF001 a RF018, além dos relatórios RF019 e RF020.
RF001 e RF002 tratam de autocadastro e login; RF003 a RF010 cobrem o fluxo do cliente.
RF011 a RF016 cobrem a operação do funcionário; RF017 e RF018 são os CRUDs administrativos.
O leiaute, a validação de campos e o uso de Angular + Spring + REST seguem os requisitos da disciplina.
As credenciais deste README servem apenas para execução e avaliação acadêmica do sistema.


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
Em `front/src/app` as telas ficam separadas por domínio:
- `home`, `cliente`, `funcionario`, `categoria`, `solicitacao` e `relatorio`.
- `componentes` e `shared` reúnem elementos reutilizáveis.
- `core` concentra serviços, guards (auth, cliente, funcionário) e stores compartilhados.
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
        ├── home/              # Login e autocadastro
        ├── cliente/           # Tela inicial do cliente
        ├── funcionario/       # Gestão de funcionários
        ├── categoria/         # CRUD de categorias
        ├── relatorio/         # Relatórios de receita
        ├── componentes/       # Modais e sidebar
        └── core/              # Serviços, guards e stores
```

## Problemas Comuns

- **Erro de conexão com o banco ao subir a API:** confirme que o PostgreSQL está rodando e que o banco
  `manutencao_db` existe (ele não é criado automaticamente, apenas as tabelas).
- **Erro de CORS no navegador:** o front precisa rodar em `http://localhost:4200`, a única origem liberada.
- **Senha do cadastro não chegou por e-mail:** sem `spring.mail.*` configurado, a senha é impressa no log da API.
- **Dados iniciais duplicados ou ausentes:** eles são carregados na primeira execução; para recarregar,
  esvazie as tabelas ou recrie o banco.
- **`ng` não encontrado:** use `npx ng serve` ou `npm start` dentro de `front`.

## Possíveis Melhorias Futuras

- Proteger as rotas no back-end por papel de usuário (Spring Security).
- Mover credenciais e segredo do JWT para variáveis de ambiente.
- Adotar BCrypt no lugar de SHA-256 com SALT.
- Adicionar migrações versionadas (Flyway) em vez de `ddl-auto=update`.
- Documentar a API com OpenAPI/Swagger.
- Incluir paginação nas listagens de solicitações.
- Criar um `docker-compose.yml` com PostgreSQL, API e front para subir tudo com um comando.
