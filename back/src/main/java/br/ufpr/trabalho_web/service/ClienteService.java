package br.ufpr.trabalho_web.service;

import br.ufpr.trabalho_web.dto.ClienteCadastroDTO;
import br.ufpr.trabalho_web.model.Cliente;
import br.ufpr.trabalho_web.model.Endereco;
import br.ufpr.trabalho_web.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    public Cliente cadastrar(ClienteCadastroDTO dto) {

        // Validações de dados únicos (RF001)
        if (clienteRepository.existsByCpf(dto.cpf())) {
            throw new RuntimeException("Erro: O CPF informado já está cadastrado.");
        }
        if (clienteRepository.existsByEmail(dto.email())) {
            throw new RuntimeException("Erro: O E-mail informado já está cadastrado.");
        }

        // Gera senha aleatória de 4 números
        String senhaAleatoria = String.format("%04d", new Random().nextInt(10000));

        // Converte o DTO para a Entidade Cliente
        Cliente cliente = new Cliente();
        cliente.setNome(dto.nome());
        cliente.setCpf(dto.cpf());
        cliente.setEmail(dto.email());
        cliente.setSenha(senhaAleatoria);
        cliente.setTelefone(dto.telefone());

        Endereco endereco = new Endereco();
        endereco.setCep(dto.cep());
        endereco.setLogradouro(dto.logradouro());
        endereco.setNumero(dto.numero());
        endereco.setComplemento(dto.complemento());
        endereco.setBairro(dto.bairro());
        endereco.setCidade(dto.cidade());
        endereco.setEstado(dto.estado());

        cliente.setEndereco(endereco);

        // Salva no banco de dados e retornar o cliente salvo
        return clienteRepository.save(cliente);
    }
}