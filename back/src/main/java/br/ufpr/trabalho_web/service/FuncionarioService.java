package br.ufpr.trabalho_web.service;

import br.ufpr.trabalho_web.exception.RegraNegocioException;
import br.ufpr.trabalho_web.model.Funcionario;
import br.ufpr.trabalho_web.repository.FuncionarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FuncionarioService {

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    public List<Funcionario> buscarTodos() {
        return funcionarioRepository.findAll();
    }

    public Funcionario buscarPorId(Long id) {
        return funcionarioRepository.findById(id)
                .orElseThrow(() -> new RegraNegocioException("Funcionário não encontrado."));
    }

    @Transactional
    public Funcionario inserir(Funcionario funcionario) {
        return funcionarioRepository.save(funcionario);
    }

    @Transactional
    public Funcionario atualizar(Long id, Funcionario dadosAtualizados) {
        Funcionario existente = buscarPorId(id);
        existente.setNome(dadosAtualizados.getNome());
        existente.setEmail(dadosAtualizados.getEmail());
        existente.setDataNascimento(dadosAtualizados.getDataNascimento());
        return funcionarioRepository.save(existente);
    }

    @Transactional
    public void remover(Long id, Long idFuncionarioLogado) {
        if (id.equals(idFuncionarioLogado)) {
            throw new RegraNegocioException("O funcionário não pode remover a si mesmo.");
        }

        long totalFuncionarios = funcionarioRepository.count();
        if (totalFuncionarios <= 1) {
            throw new RegraNegocioException("Não é possível remover o único funcionário do sistema.");
        }

        Funcionario funcionario = buscarPorId(id);
        funcionario.setAtivo(false);
        funcionarioRepository.save(funcionario);
    }
}