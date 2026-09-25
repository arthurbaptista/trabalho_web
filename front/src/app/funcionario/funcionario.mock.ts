/*
 * Dados de demonstracao da tela do funcionario.
 * Este bloco nao altera o comportamento do codigo.
 * Serve apenas como documentacao do mock local.
 *
 * 01. O arquivo concentra clientes, funcionarios e solicitacoes ficticias.
 * 02. Os dados alimentam a listagem quando a API nao responde a tempo.
 * 03. Os nomes seguem a massa inicial usada no backend.
 * 04. Joao, Jose, Joana e Joaquina representam os clientes de teste.
 * 05. Maria e Mario representam os funcionarios de teste.
 * 06. Cada solicitacao possui estado, equipamento, defeito e historico.
 * 07. A descricao do equipamento fica limitada a 30 caracteres na tela.
 * 08. A data de abertura e usada nos filtros de hoje e periodo.
 * 09. O estado ABERTA permite efetuar orcamento.
 * 10. O estado ORCADA aguarda aprovacao ou rejeicao do cliente.
 * 11. O estado APROVADA permite manutencao ou redirecionamento.
 * 12. O estado REDIRECIONADA tambem permite manutencao.
 * 13. O estado ARRUMADA aguarda pagamento.
 * 14. O estado PAGA permite finalizar a solicitacao.
 * 15. O estado FINALIZADA encerra o fluxo.
 * 16. O estado REJEITADA aparece apenas na visao de todas.
 * 17. A visao de abertas mostra so o que ainda pode receber orcamento.
 * 18. A visao de todas aplica filtro de data quando solicitado.
 * 19. O historico registra a transicao entre estados.
 * 20. O valor do orcamento e opcional nas solicitacoes abertas.
 * 21. Categorias usadas: notebook, desktop, impressora, mouse e teclado.
 * 22. Os enderecos de teste apontam para o centro de Curitiba.
 * 23. Os e-mails seguem o padrao nome@manutencao.com.
 * 24. A senha de teste documentada no README e 1234.
 * 25. Nada neste comentario e executado em tempo de execucao.
 * 26. Nenhuma funcao, constante ou tipo e modificado por estas linhas.
 * 27. Imports, interfaces e objetos permanecem iguais abaixo.
 * 28. O mock continua sendo a fonte local de fallback da tela.
 * 29. Alteracoes visuais ou de regra devem ser feitas em outros arquivos.
 * 30. funcionario.ts controla filtros, acoes e abertura do detalhe.
 * 31. funcionario.html renderiza a tabela e os botoes por estado.
 * 32. funcionario.css define o layout escuro da pagina.
 * 33. funcionario.service.ts tenta a API e cai neste mock se falhar.
 * 34. funcionario.filtro.ts aplica vista, hoje e periodo.
 * 35. funcionario.models.ts descreve os tipos usados nestes objetos.
 * 36. O detalhe da solicitacao vive em componentes separados.
 * 37. A sidebar compartilhada troca entre abertas e todas.
 * 38. Esta documentacao existe so para leitura humana.
 * 39. Ela nao cria variavel, nao exporta simbolo e nao muda fluxo.
 * 40. Linhas restantes reforcam o mesmo aviso de nao impacto.
 * 41. Nao ha efeito colateral ao manter este comentario.
 * 42. Nao ha dependencia de compilacao nestas frases.
 * 43. O TypeScript ignora o bloco inteiro.
 * 44. O Angular tambem ignora o bloco inteiro.
 * 45. Testes nao leem este texto.
 * 46. O bundle final nao executa estas linhas.
 * 47. O arquivo segue com os mesmos objetos de antes.
 * 48. Clientes, funcionarios e solicitacoes continuam intactos.
 * 49. Qualquer ajuste de dado deve ocorrer fora deste comentario.
 * 50. Fim da documentacao local do mock do funcionario.
 * 51. Este arquivo permanece apenas com dados estaticos de exemplo.
 * 52. Nenhuma regra de negocio foi incluida neste bloco.
 * 53. Comentario encerrado sem mudanca no codigo executavel.
 *
 */

import { agoraIso, historicoPara, nomesIguais } from '../cliente/solicitacao.util';
import type { ClienteSolicitacao, FuncionarioResumo, SolicitacaoFuncionario } from './funcionario.models';

const JOAO: ClienteSolicitacao = {
  id: 1,
  nome: 'Joao',
  email: 'joao@manutencao.com',
  cpf: '123.456.789-01',
  telefone: '(41) 99999-0001',
  endereco: 'Rua das Flores, 100, Centro, Curitiba/PR, 80010-000',
};

const JOSE: ClienteSolicitacao = {
  id: 2,
  nome: 'Jose',
  email: 'jose@manutencao.com',
  cpf: '123.456.789-02',
  telefone: '(41) 99999-0002',
  endereco: 'Rua das Flores, 100, Centro, Curitiba/PR, 80010-000',
};

const JOANA: ClienteSolicitacao = {
  id: 3,
  nome: 'Joana',
  email: 'joana@manutencao.com',
  cpf: '123.456.789-03',
  telefone: '(41) 99999-0003',
  endereco: 'Rua das Flores, 100, Centro, Curitiba/PR, 80010-000',
};

const JOAQUINA: ClienteSolicitacao = {
  id: 4,
  nome: 'Joaquina',
  email: 'joaquina@manutencao.com',
  cpf: '123.456.789-04',
  telefone: '(41) 99999-0004',
  endereco: 'Rua das Flores, 100, Centro, Curitiba/PR, 80010-000',
};

export const CLIENTES_DEMO: ClienteSolicitacao[] = [JOAO, JOSE, JOANA, JOAQUINA];

export function clienteDemoPorNome(nome: string, email?: string): ClienteSolicitacao | undefined {
  const emailNorm = email?.trim().toLowerCase();
  return CLIENTES_DEMO.find((cliente) =>
    nomesIguais(cliente.nome, nome)
    || Boolean(emailNorm && cliente.email.toLowerCase() === emailNorm),
  );
}

export const FUNCIONARIOS_DEMO: FuncionarioResumo[] = [
  { id: 1, nome: 'Maria', email: 'maria@manutencao.com' },
  { id: 2, nome: 'Mario', email: 'mario@manutencao.com' },
];

type Base = Omit<SolicitacaoFuncionario, 'historico'> & { historico?: SolicitacaoFuncionario['historico'] };

const BASE: Base[] = [
  {
    id: 1,
    dataHoraAbertura: '2026-01-12T14:10:00',
    descricaoEquipamento: 'Lenovo ThinkPad',
    descricaoDefeito: 'Nao carrega mesmo ligado na tomada.',
    categoria: 'Notebook',
    estado: 'ABERTA',
    valorOrcamento: null,
    cliente: JOAQUINA,
    funcionarioDestino: null,
  },
  {
    id: 2,
    dataHoraAbertura: '2026-01-20T10:00:00',
    descricaoEquipamento: 'Dell XPS 13',
    descricaoDefeito: 'Dobradica quebrada apos queda.',
    categoria: 'Notebook',
    estado: 'FINALIZADA',
    valorOrcamento: 1100,
    cliente: JOANA,
    funcionarioDestino: null,
    descricaoManutencao: 'Troca da dobradica e alinhamento da tampa.',
    orientacoesCliente: 'Evitar abrir a tela alem de 120 graus.',
  },
  {
    id: 3,
    dataHoraAbertura: '2026-02-05T08:40:00',
    descricaoEquipamento: 'PC Gamer Ryzen',
    descricaoDefeito: 'Nao da video ao ligar.',
    categoria: 'Desktop',
    estado: 'ABERTA',
    valorOrcamento: null,
    cliente: JOSE,
    funcionarioDestino: null,
  },
  {
    id: 4,
    dataHoraAbertura: '2026-02-08T09:45:00',
    descricaoEquipamento: 'Brother DCP',
    descricaoDefeito: 'Nao puxa papel da bandeja.',
    categoria: 'Impressora',
    estado: 'PAGA',
    valorOrcamento: 270,
    cliente: JOANA,
    funcionarioDestino: null,
    descricaoManutencao: 'Limpeza do rolete e troca do kit de alimentacao.',
    orientacoesCliente: 'Usar papel dentro da gramatura recomendada.',
  },
  {
    id: 5,
    dataHoraAbertura: '2026-02-10T09:12:00',
    descricaoEquipamento: 'Macbook M1 Pro',
    descricaoDefeito: 'Nao liga apos queda.',
    categoria: 'Notebook',
    estado: 'ABERTA',
    valorOrcamento: null,
    cliente: JOAO,
    funcionarioDestino: null,
  },
  {
    id: 6,
    dataHoraAbertura: '2026-02-12T11:30:00',
    descricaoEquipamento: 'Macbook M1 Pro',
    descricaoDefeito: 'Tela com listras verticais.',
    categoria: 'Notebook',
    estado: 'APROVADA',
    valorOrcamento: 890,
    cliente: JOAO,
    funcionarioDestino: null,
  },
  {
    id: 7,
    dataHoraAbertura: '2026-02-14T15:05:00',
    descricaoEquipamento: 'Macbook M1 Pro',
    descricaoDefeito: 'Teclado com teclas falhando.',
    categoria: 'Notebook',
    estado: 'ARRUMADA',
    valorOrcamento: 640,
    cliente: JOAO,
    funcionarioDestino: null,
    descricaoManutencao: 'Substituicao do teclado e testes de teclas.',
    orientacoesCliente: 'Evitar liquidos sobre o teclado.',
  },
  {
    id: 8,
    dataHoraAbertura: '2026-02-16T18:20:00',
    descricaoEquipamento: 'Macbook M1 Pro',
    descricaoDefeito: 'Troca de bateria.',
    categoria: 'Notebook',
    estado: 'FINALIZADA',
    valorOrcamento: 450,
    cliente: JOAO,
    funcionarioDestino: null,
    descricaoManutencao: 'Troca da bateria original.',
    orientacoesCliente: 'Calibrar a carga nas primeiras 3 ciclos.',
  },
  {
    id: 9,
    dataHoraAbertura: '2026-02-19T19:47:00',
    descricaoEquipamento: 'Macbook M1 Pro',
    descricaoDefeito: 'Troca de SSD.',
    categoria: 'Notebook',
    estado: 'ORCADA',
    valorOrcamento: 1250,
    cliente: JOAO,
    funcionarioDestino: null,
  },
  {
    id: 10,
    dataHoraAbertura: '2026-02-21T17:10:00',
    descricaoEquipamento: 'Teclado mecanico',
    descricaoDefeito: 'Tecla W travando.',
    categoria: 'Teclado',
    estado: 'ORCADA',
    valorOrcamento: 210,
    cliente: JOSE,
    funcionarioDestino: null,
  },
  {
    id: 11,
    dataHoraAbertura: '2026-02-27T16:55:00',
    descricaoEquipamento: 'HP Pavilion',
    descricaoDefeito: 'Barulho constante no cooler.',
    categoria: 'Desktop',
    estado: 'ORCADA',
    valorOrcamento: 410,
    cliente: JOAQUINA,
    funcionarioDestino: null,
  },
  {
    id: 12,
    dataHoraAbertura: '2026-03-02T10:15:00',
    descricaoEquipamento: 'iMac 24',
    descricaoDefeito: 'Nao reconhece o monitor interno.',
    categoria: 'Desktop',
    estado: 'PAGA',
    valorOrcamento: 980,
    cliente: JOAO,
    funcionarioDestino: null,
    descricaoManutencao: 'Reparo da placa de video e testes de imagem.',
    orientacoesCliente: 'Atualizar o macOS apos a retirada.',
  },
  {
    id: 13,
    dataHoraAbertura: '2026-03-04T12:00:00',
    descricaoEquipamento: 'Mouse sem fio',
    descricaoDefeito: 'Bateria nao carrega.',
    categoria: 'Mouse',
    estado: 'APROVADA',
    valorOrcamento: 150,
    cliente: JOSE,
    funcionarioDestino: null,
  },
  {
    id: 14,
    dataHoraAbertura: '2026-03-08T14:40:00',
    descricaoEquipamento: 'HP LaserJet',
    descricaoDefeito: 'Atolamento constante de papel.',
    categoria: 'Impressora',
    estado: 'REDIRECIONADA',
    valorOrcamento: 320,
    cliente: JOAO,
    funcionarioDestino: 'Mario',
  },
  {
    id: 15,
    dataHoraAbertura: '2026-03-11T16:22:00',
    descricaoEquipamento: 'Logitech MX',
    descricaoDefeito: 'Scroll com falha intermitente.',
    categoria: 'Mouse',
    estado: 'REJEITADA',
    valorOrcamento: 180,
    cliente: JOAO,
    funcionarioDestino: null,
    motivoRejeicao: 'Valor acima do esperado para a peca.',
  },
  {
    id: 16,
    dataHoraAbertura: '2026-03-15T11:25:00',
    descricaoEquipamento: 'Epson EcoTank',
    descricaoDefeito: 'Manchas na impressao.',
    categoria: 'Impressora',
    estado: 'ARRUMADA',
    valorOrcamento: 390,
    cliente: JOSE,
    funcionarioDestino: null,
    descricaoManutencao: 'Limpeza dos cabecotes e alinhamento.',
    orientacoesCliente: 'Executar limpeza leve a cada 30 dias.',
  },
  {
    id: 17,
    dataHoraAbertura: '2026-03-18T09:05:00',
    descricaoEquipamento: 'Keychron K2',
    descricaoDefeito: 'Nao conecta no Bluetooth.',
    categoria: 'Teclado',
    estado: 'ABERTA',
    valorOrcamento: null,
    cliente: JOAO,
    funcionarioDestino: null,
  },
  {
    id: 18,
    dataHoraAbertura: '2026-03-22T19:18:00',
    descricaoEquipamento: 'Apple Magic Mouse',
    descricaoDefeito: 'Sensor falhando em superficies claras.',
    categoria: 'Mouse',
    estado: 'REJEITADA',
    valorOrcamento: 240,
    cliente: JOANA,
    funcionarioDestino: null,
    motivoRejeicao: 'Prefiro aguardar peca original.',
  },
  {
    id: 19,
    dataHoraAbertura: '2026-03-29T10:08:00',
    descricaoEquipamento: 'Canon Pixma',
    descricaoDefeito: 'Cabeca de impressao com falhas.',
    categoria: 'Impressora',
    estado: 'ARRUMADA',
    valorOrcamento: 520,
    cliente: JOAQUINA,
    funcionarioDestino: null,
    descricaoManutencao: 'Substituicao da cabeca e teste de cores.',
    orientacoesCliente: 'Nao deixar a impressora parada por longos periodos.',
  },
  {
    id: 20,
    dataHoraAbertura: '2026-04-01T13:50:00',
    descricaoEquipamento: 'Dell Optiplex',
    descricaoDefeito: 'Superaquecimento apos 20 minutos de uso.',
    categoria: 'Desktop',
    estado: 'ORCADA',
    valorOrcamento: 760,
    cliente: JOAO,
    funcionarioDestino: null,
  },
  {
    id: 21,
    dataHoraAbertura: '2026-04-03T08:30:00',
    descricaoEquipamento: 'Logitech MX Keys',
    descricaoDefeito: 'Teclas com iluminacao apagada.',
    categoria: 'Teclado',
    estado: 'REDIRECIONADA',
    valorOrcamento: 330,
    cliente: JOANA,
    funcionarioDestino: 'Maria',
  },
  {
    id: 22,
    dataHoraAbertura: '2026-04-06T15:33:00',
    descricaoEquipamento: 'Acer Aspire 5',
    descricaoDefeito: 'Wifi instavel em casa.',
    categoria: 'Notebook',
    estado: 'FINALIZADA',
    valorOrcamento: 300,
    cliente: JOAQUINA,
    funcionarioDestino: null,
    descricaoManutencao: 'Troca da antena wireless.',
    orientacoesCliente: 'Atualizar o driver de rede no Windows.',
  },
];

function comHistorico(item: Base): SolicitacaoFuncionario {
  const historico = item.historico ?? historicoPara(item.estado, item.dataHoraAbertura, item.cliente.nome, {
    funcionarioDestino: item.funcionarioDestino,
  });
  return { ...item, historico };
}

export const SOLICITACOES_FUNCIONARIO_DEMO: SolicitacaoFuncionario[] = [
  ...BASE.map(comHistorico),
  comHistorico({
    id: 23,
    dataHoraAbertura: agoraIso(),
    descricaoEquipamento: 'Notebook Dell Inspiron',
    descricaoDefeito: 'Nao inicia o sistema operacional.',
    categoria: 'Notebook',
    estado: 'ABERTA',
    valorOrcamento: null,
    cliente: JOAO,
    funcionarioDestino: null,
  }),
];
