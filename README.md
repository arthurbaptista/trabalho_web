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
- Login: func@func
- Senha: 1234

**Para Logar Como Cliente** 
- Login: cli@cli
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
