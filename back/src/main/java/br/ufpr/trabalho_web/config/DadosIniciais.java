package br.ufpr.trabalho_web.config;

import br.ufpr.trabalho_web.model.Categoria;
import br.ufpr.trabalho_web.model.Cliente;
import br.ufpr.trabalho_web.model.Endereco;
import br.ufpr.trabalho_web.model.EstadoSolicitacao;
import br.ufpr.trabalho_web.model.Funcionario;
import br.ufpr.trabalho_web.model.HistoricoSolicitacao;
import br.ufpr.trabalho_web.model.Solicitacao;
import br.ufpr.trabalho_web.repository.CategoriaRepository;
import br.ufpr.trabalho_web.repository.ClienteRepository;
import br.ufpr.trabalho_web.repository.FuncionarioRepository;
import br.ufpr.trabalho_web.repository.HistoricoSolicitacaoRepository;
import br.ufpr.trabalho_web.repository.SolicitacaoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@Order(2)
public class DadosIniciais implements CommandLineRunner {

    private static final String SENHA_TESTE = "1234";

    private final FuncionarioRepository funcionarioRepository;
    private final ClienteRepository clienteRepository;
    private final CategoriaRepository categoriaRepository;
    private final SolicitacaoRepository solicitacaoRepository;
    private final HistoricoSolicitacaoRepository historicoRepository;
    private final PasswordEncoder passwordEncoder;

    public DadosIniciais(
            FuncionarioRepository funcionarioRepository,
            ClienteRepository clienteRepository,
            CategoriaRepository categoriaRepository,
            SolicitacaoRepository solicitacaoRepository,
            HistoricoSolicitacaoRepository historicoRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.funcionarioRepository = funcionarioRepository;
        this.clienteRepository = clienteRepository;
        this.categoriaRepository = categoriaRepository;
        this.solicitacaoRepository = solicitacaoRepository;
        this.historicoRepository = historicoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        Funcionario maria = criarFuncionario("Maria", "maria@manutencao.com", LocalDate.of(1990, 3, 12));
        Funcionario mario = criarFuncionario("Mario", "mario@manutencao.com", LocalDate.of(1988, 7, 25));
        Cliente joao = criarCliente("Joao", "joao@manutencao.com", "12345678901", "41999990001", "100");
        Cliente jose = criarCliente("Jose", "jose@manutencao.com", "12345678902", "41999990002", "200");
        Cliente joana = criarCliente("Joana", "joana@manutencao.com", "12345678903", "41999990003", "300");
        Cliente joaquina = criarCliente("Joaquina", "joaquina@manutencao.com", "12345678904", "41999990004", "400");
        criarMassaSolicitacoes(joao, jose, joana, joaquina, maria, mario);
    }

    private Funcionario criarFuncionario(String nome, String email, LocalDate nascimento) {
        return funcionarioRepository.findByEmail(email).orElseGet(() -> {
            Funcionario funcionario = new Funcionario();
            funcionario.setNome(nome);
            funcionario.setEmail(email);
            funcionario.setSenha(passwordEncoder.encode(SENHA_TESTE));
            funcionario.setStatus(true);
            funcionario.setDataNascimento(nascimento);
            return funcionarioRepository.save(funcionario);
        });
    }

    private Cliente criarCliente(String nome, String email, String cpf, String telefone, String numero) {
        Cliente existente = clienteRepository.findByEmail(email);
        if (existente != null) {
            return existente;
        }
        Cliente cliente = new Cliente();
        cliente.setNome(nome);
        cliente.setEmail(email);
        cliente.setSenha(passwordEncoder.encode(SENHA_TESTE));
        cliente.setStatus(true);
        cliente.setCpf(cpf);
        cliente.setTelefone(telefone);
        cliente.setEndereco(endereco(numero));
        return clienteRepository.save(cliente);
    }

    private Endereco endereco(String numero) {
        Endereco endereco = new Endereco();
        endereco.setCep("80010000");
        endereco.setLogradouro("Rua das Flores");
        endereco.setNumero(numero);
        endereco.setBairro("Centro");
        endereco.setCidade("Curitiba");
        endereco.setEstado("PR");
        return endereco;
    }

    private void criarMassaSolicitacoes(
            Cliente joao,
            Cliente jose,
            Cliente joana,
            Cliente joaquina,
            Funcionario maria,
            Funcionario mario
    ) {
        if (solicitacaoRepository.count() > 0) {
            return;
        }

        LocalDateTime base = LocalDateTime.of(2026, 8, 3, 9, 0);
        seed(joao, "Notebook", "Dell Inspiron 15", "Nao liga", base, EstadoSolicitacao.ABERTA, null, maria, null);
        seed(jose, "Desktop", "PC gamer RGB", "Tela azul", base.plusDays(1), EstadoSolicitacao.ABERTA, null, maria, null);
        seed(joana, "Impressora", "HP DeskJet", "Atola papel", base.plusDays(2), EstadoSolicitacao.ABERTA, null, maria, null);
        seed(joaquina, "Mouse", "Logitech M185", "Botao travado", base.plusDays(3), EstadoSolicitacao.ORCADA, "80.00", maria, null);
        seed(joao, "Teclado", "Teclado mecanico", "Tecla W falha", base.plusDays(4), EstadoSolicitacao.ORCADA, "120.00", mario, null);
        seed(jose, "Notebook", "Lenovo IdeaPad", "Superaquece", base.plusDays(5), EstadoSolicitacao.APROVADA, "350.00", maria, null);
        seed(joana, "Desktop", "iMac 2017", "HD ruidoso", base.plusDays(6), EstadoSolicitacao.APROVADA, "480.00", mario, null);
        seed(joaquina, "Impressora", "Epson L3150", "Mancha tinta", base.plusDays(7), EstadoSolicitacao.REJEITADA, "220.00", maria, null);
        seed(joao, "Mouse", "Razer DeathAdder", "Sensor falha", base.plusDays(8), EstadoSolicitacao.REDIRECIONADA, "190.00", maria, mario);
        seed(jose, "Teclado", "Microsoft Wired", "Cabo solto", base.plusDays(9), EstadoSolicitacao.ARRUMADA, "95.00", maria, null);
        seed(joana, "Notebook", "Acer Aspire 5", "Tela quebrada", base.plusDays(10), EstadoSolicitacao.ARRUMADA, "640.00", mario, null);
        seed(joaquina, "Desktop", "Dell OptiPlex", "Sem video", base.plusDays(11), EstadoSolicitacao.PAGA, "410.00", maria, null);
        seed(joao, "Impressora", "Brother DCP", "Wifi cai", base.plusDays(12), EstadoSolicitacao.PAGA, "275.00", mario, null);
        seed(jose, "Mouse", "Apple Magic", "Nao conecta", base.plusDays(13), EstadoSolicitacao.FINALIZADA, "150.00", maria, null);
        seed(joana, "Teclado", "Keychron K2", "LED morto", base.plusDays(14), EstadoSolicitacao.FINALIZADA, "310.00", mario, null);
        seed(joaquina, "Notebook", "Samsung Book", "Bateria vicia", base.plusDays(15), EstadoSolicitacao.FINALIZADA, "520.00", maria, null);
        seed(joao, "Desktop", "Montado Ryzen", "Nao da boot", base.plusDays(16), EstadoSolicitacao.ABERTA, null, maria, null);
        seed(jose, "Impressora", "Canon G3110", "Erro 5B00", base.plusDays(17), EstadoSolicitacao.ORCADA, "180.00", mario, null);
        seed(joana, "Mouse", "Redragon Cobra", "Scroll preso", base.plusDays(18), EstadoSolicitacao.APROVADA, "70.00", maria, null);
        seed(joaquina, "Teclado", "Dell KB216", "Enter falha", base.plusDays(19), EstadoSolicitacao.REJEITADA, "55.00", mario, null);
    }

    private void seed(
            Cliente cliente,
            String categoriaNome,
            String equipamento,
            String defeito,
            LocalDateTime abertura,
            EstadoSolicitacao estado,
            String valor,
            Funcionario origem,
            Funcionario destino
    ) {
        Categoria categoria = categoriaRepository.findByNomeIgnoreCase(categoriaNome)
                .orElseThrow(() -> new IllegalStateException("Categoria nao encontrada: " + categoriaNome));

        Solicitacao solicitacao = new Solicitacao();
        solicitacao.setCliente(cliente);
        solicitacao.setCategoria(categoria);
        solicitacao.setDescricaoEquipamento(equipamento);
        solicitacao.setDescricaoDefeito(defeito);
        solicitacao.setDataHoraAbertura(abertura);
        solicitacao.setEstadoAtual(estado);
        solicitacao.setStatus(true);
        if (valor != null) {
            solicitacao.setValorOrcamento(new BigDecimal(valor));
        }
        if (estado == EstadoSolicitacao.REJEITADA) {
            solicitacao.setMotivoRejeicao("Valor acima do esperado.");
        }
        if (estado == EstadoSolicitacao.ARRUMADA
                || estado == EstadoSolicitacao.PAGA
                || estado == EstadoSolicitacao.FINALIZADA) {
            solicitacao.setDescricaoManutencao("Peca substituida e equipamento testado.");
            solicitacao.setOrientacoesCliente("Evitar queda e conservar em local seco.");
        }
        if (destino != null) {
            solicitacao.setFuncionarioResponsavel(destino);
        } else if (estado != EstadoSolicitacao.ABERTA) {
            solicitacao.setFuncionarioResponsavel(origem);
        }

        Solicitacao salva = solicitacaoRepository.save(solicitacao);
        LocalDateTime momento = abertura;
        for (EstadoSolicitacao passo : cadeia(estado)) {
            HistoricoSolicitacao historico = new HistoricoSolicitacao();
            historico.setSolicitacao(salva);
            historico.setDataHora(momento);
            historico.setEstadoAlcancado(passo);
            if (passo != EstadoSolicitacao.ABERTA
                    && passo != EstadoSolicitacao.APROVADA
                    && passo != EstadoSolicitacao.REJEITADA
                    && passo != EstadoSolicitacao.PAGA) {
                historico.setFuncionarioOrigem(origem);
            }
            if (passo == EstadoSolicitacao.REDIRECIONADA) {
                historico.setFuncionarioDestino(destino);
            }
            historicoRepository.save(historico);
            momento = momento.plusHours(6);
        }
    }

    private List<EstadoSolicitacao> cadeia(EstadoSolicitacao estado) {
        return switch (estado) {
            case ABERTA -> List.of(EstadoSolicitacao.ABERTA);
            case ORCADA -> List.of(EstadoSolicitacao.ABERTA, EstadoSolicitacao.ORCADA);
            case APROVADA -> List.of(
                    EstadoSolicitacao.ABERTA, EstadoSolicitacao.ORCADA, EstadoSolicitacao.APROVADA);
            case REJEITADA -> List.of(
                    EstadoSolicitacao.ABERTA, EstadoSolicitacao.ORCADA, EstadoSolicitacao.REJEITADA);
            case REDIRECIONADA -> List.of(
                    EstadoSolicitacao.ABERTA, EstadoSolicitacao.ORCADA,
                    EstadoSolicitacao.APROVADA, EstadoSolicitacao.REDIRECIONADA);
            case ARRUMADA -> List.of(
                    EstadoSolicitacao.ABERTA, EstadoSolicitacao.ORCADA,
                    EstadoSolicitacao.APROVADA, EstadoSolicitacao.ARRUMADA);
            case PAGA -> List.of(
                    EstadoSolicitacao.ABERTA, EstadoSolicitacao.ORCADA, EstadoSolicitacao.APROVADA,
                    EstadoSolicitacao.ARRUMADA, EstadoSolicitacao.PAGA);
            case FINALIZADA -> List.of(
                    EstadoSolicitacao.ABERTA, EstadoSolicitacao.ORCADA, EstadoSolicitacao.APROVADA,
                    EstadoSolicitacao.ARRUMADA, EstadoSolicitacao.PAGA, EstadoSolicitacao.FINALIZADA);
        };
    }
}
