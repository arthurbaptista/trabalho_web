package br.ufpr.trabalho_web.config;

import br.ufpr.trabalho_web.model.Categoria;
import br.ufpr.trabalho_web.model.Cliente;
import br.ufpr.trabalho_web.model.Endereco;
import br.ufpr.trabalho_web.model.EstadoSolicitacao;
import br.ufpr.trabalho_web.model.Funcionario;
import br.ufpr.trabalho_web.model.Solicitacao;
import br.ufpr.trabalho_web.repository.CategoriaRepository;
import br.ufpr.trabalho_web.repository.ClienteRepository;
import br.ufpr.trabalho_web.repository.FuncionarioRepository;
import br.ufpr.trabalho_web.repository.SolicitacaoRepository;
import br.ufpr.trabalho_web.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@Order(2)
public class DadosIniciais implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final ClienteRepository clienteRepository;
    private final CategoriaRepository categoriaRepository;
    private final SolicitacaoRepository solicitacaoRepository;
    private final PasswordEncoder passwordEncoder;

    public DadosIniciais(
            UsuarioRepository usuarioRepository,
            FuncionarioRepository funcionarioRepository,
            ClienteRepository clienteRepository,
            CategoriaRepository categoriaRepository,
            SolicitacaoRepository solicitacaoRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.usuarioRepository = usuarioRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.clienteRepository = clienteRepository;
        this.categoriaRepository = categoriaRepository;
        this.solicitacaoRepository = solicitacaoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        criarFuncionario("Maria", "maria@manutencao.com", LocalDate.of(1990, 3, 12));
        criarFuncionario("Mario", "mario@manutencao.com", LocalDate.of(1988, 7, 25));

        Cliente joao = criarCliente("Joao", "joao@manutencao.com", "12345678901", "41999990001");
        Cliente jose = criarCliente("Jose", "jose@manutencao.com", "12345678902", "41999990002");
        Cliente joana = criarCliente("Joana", "joana@manutencao.com", "12345678903", "41999990003");
        Cliente joaquina = criarCliente("Joaquina", "joaquina@manutencao.com", "12345678904", "41999990004");

        if (solicitacaoRepository.count() > 0) {
            return;
        }

        Categoria notebook = categoria("Notebook");
        Categoria desktop = categoria("Desktop");
        Categoria impressora = categoria("Impressora");
        Categoria mouse = categoria("Mouse");
        Categoria teclado = categoria("Teclado");

        criarSolicitacao(joao, notebook, "Macbook M1 Pro", "Nao liga apos queda",
                LocalDateTime.of(2026, 2, 10, 9, 12), EstadoSolicitacao.ABERTA, null);
        criarSolicitacao(joao, notebook, "Macbook M1 Pro", "Tela com listras",
                LocalDateTime.of(2026, 2, 12, 11, 30), EstadoSolicitacao.APROVADA, "890.00");
        criarSolicitacao(joao, notebook, "Macbook M1 Pro", "Teclado com teclas falhando",
                LocalDateTime.of(2026, 2, 14, 15, 5), EstadoSolicitacao.ARRUMADA, "640.00");
        criarSolicitacao(joao, notebook, "Macbook M1 Pro", "Troca de bateria",
                LocalDateTime.of(2026, 2, 16, 18, 20), EstadoSolicitacao.FINALIZADA, "450.00");
        criarSolicitacao(joao, notebook, "Macbook M1 Pro", "Troca de SSD",
                LocalDateTime.of(2026, 2, 19, 19, 47), EstadoSolicitacao.ORCADA, "1250.00");
        criarSolicitacao(joao, desktop, "iMac 24", "Nao reconhece monitor",
                LocalDateTime.of(2026, 3, 2, 10, 15), EstadoSolicitacao.PAGA, "980.00");
        criarSolicitacao(joao, impressora, "HP LaserJet", "Atolamento constante",
                LocalDateTime.of(2026, 3, 8, 14, 40), EstadoSolicitacao.REDIRECIONADA, "320.00");
        criarSolicitacao(joao, mouse, "Logitech MX", "Scroll com falha",
                LocalDateTime.of(2026, 3, 11, 16, 22), EstadoSolicitacao.REJEITADA, "180.00");
        criarSolicitacao(joao, teclado, "Keychron K2", "Nao conecta no Bluetooth",
                LocalDateTime.of(2026, 3, 18, 9, 5), EstadoSolicitacao.ABERTA, null);
        criarSolicitacao(joao, desktop, "Dell Optiplex", "Superaquecimento",
                LocalDateTime.of(2026, 4, 1, 13, 50), EstadoSolicitacao.ORCADA, "760.00");

        criarSolicitacao(jose, desktop, "PC Gamer", "Nao da video",
                LocalDateTime.of(2026, 2, 5, 8, 40), EstadoSolicitacao.ABERTA, null);
        criarSolicitacao(jose, teclado, "Teclado mecanico", "Tecla W travando",
                LocalDateTime.of(2026, 2, 21, 17, 10), EstadoSolicitacao.ORCADA, "210.00");
        criarSolicitacao(jose, mouse, "Mouse sem fio", "Bateria nao carrega",
                LocalDateTime.of(2026, 3, 4, 12, 0), EstadoSolicitacao.APROVADA, "150.00");
        criarSolicitacao(jose, impressora, "Epson EcoTank", "Manchas na impressao",
                LocalDateTime.of(2026, 3, 15, 11, 25), EstadoSolicitacao.ARRUMADA, "390.00");

        criarSolicitacao(joana, notebook, "Dell XPS 13", "Dobradica quebrada",
                LocalDateTime.of(2026, 1, 20, 10, 0), EstadoSolicitacao.FINALIZADA, "1100.00");
        criarSolicitacao(joana, impressora, "Brother DCP", "Nao puxa papel",
                LocalDateTime.of(2026, 2, 8, 9, 45), EstadoSolicitacao.PAGA, "270.00");
        criarSolicitacao(joana, mouse, "Apple Magic Mouse", "Sensor falhando",
                LocalDateTime.of(2026, 3, 22, 19, 18), EstadoSolicitacao.REJEITADA, "240.00");
        criarSolicitacao(joana, teclado, "Logitech MX Keys", "Teclas apagadas",
                LocalDateTime.of(2026, 4, 3, 8, 30), EstadoSolicitacao.REDIRECIONADA, "330.00");

        criarSolicitacao(joaquina, notebook, "Lenovo ThinkPad", "Nao carrega",
                LocalDateTime.of(2026, 1, 12, 14, 10), EstadoSolicitacao.ABERTA, null);
        criarSolicitacao(joaquina, desktop, "HP Pavilion", "Barulho no cooler",
                LocalDateTime.of(2026, 2, 27, 16, 55), EstadoSolicitacao.ORCADA, "410.00");
        criarSolicitacao(joaquina, impressora, "Canon Pixma", "Cabeça de impressao",
                LocalDateTime.of(2026, 3, 29, 10, 8), EstadoSolicitacao.ARRUMADA, "520.00");
        criarSolicitacao(joaquina, notebook, "Acer Aspire", "Wifi instavel",
                LocalDateTime.of(2026, 4, 6, 15, 33), EstadoSolicitacao.FINALIZADA, "300.00");
    }

    private void criarFuncionario(String nome, String email, LocalDate nascimento) {
        if (usuarioRepository.existsByEmail(email)) {
            return;
        }
        Funcionario funcionario = new Funcionario();
        funcionario.setNome(nome);
        funcionario.setEmail(email);
        funcionario.setSenha(passwordEncoder.encode("1234"));
        funcionario.setStatus(true);
        funcionario.setDataNascimento(nascimento);
        funcionarioRepository.save(funcionario);
    }

    private Cliente criarCliente(String nome, String email, String cpf, String telefone) {
        Cliente existente = clienteRepository.findByEmail(email);
        if (existente != null) {
            return existente;
        }

        Cliente cliente = new Cliente();
        cliente.setNome(nome);
        cliente.setEmail(email);
        cliente.setSenha(passwordEncoder.encode("1234"));
        cliente.setStatus(true);
        cliente.setCpf(cpf);
        cliente.setTelefone(telefone);

        Endereco endereco = new Endereco();
        endereco.setCep("80010000");
        endereco.setLogradouro("Rua das Flores");
        endereco.setNumero("100");
        endereco.setBairro("Centro");
        endereco.setCidade("Curitiba");
        endereco.setEstado("PR");
        cliente.setEndereco(endereco);

        return clienteRepository.save(cliente);
    }

    private Categoria categoria(String nome) {
        return categoriaRepository.findByNomeIgnoreCase(nome)
                .orElseThrow(() -> new IllegalStateException("Categoria nao encontrada: " + nome));
    }

    private void criarSolicitacao(
            Cliente cliente,
            Categoria categoria,
            String descricaoEquipamento,
            String descricaoDefeito,
            LocalDateTime dataHora,
            EstadoSolicitacao estado,
            String valor
    ) {
        Solicitacao solicitacao = new Solicitacao();
        solicitacao.setCliente(cliente);
        solicitacao.setCategoria(categoria);
        solicitacao.setDescricaoEquipamento(descricaoEquipamento);
        solicitacao.setDescricaoDefeito(descricaoDefeito);
        solicitacao.setDataHoraAbertura(dataHora);
        solicitacao.setEstadoAtual(estado);
        solicitacao.setStatus(true);
        if (valor != null) {
            solicitacao.setValorOrcamento(new BigDecimal(valor));
        }
        solicitacaoRepository.save(solicitacao);
    }
}
