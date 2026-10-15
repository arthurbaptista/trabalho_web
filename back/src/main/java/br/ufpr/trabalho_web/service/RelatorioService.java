package br.ufpr.trabalho_web.service;

import br.ufpr.trabalho_web.dto.RelatorioLinhaDTO;
import br.ufpr.trabalho_web.dto.RelatorioReceitaDTO;
import br.ufpr.trabalho_web.exception.RegraNegocioException;
import br.ufpr.trabalho_web.model.EstadoSolicitacao;
import br.ufpr.trabalho_web.model.HistoricoSolicitacao;
import br.ufpr.trabalho_web.model.Solicitacao;
import br.ufpr.trabalho_web.repository.HistoricoSolicitacaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class RelatorioService {

    private static final DateTimeFormatter DIA_ISO = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter DIA_BR = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final HistoricoSolicitacaoRepository historicoRepository;

    public RelatorioService(HistoricoSolicitacaoRepository historicoRepository) {
        this.historicoRepository = historicoRepository;
    }

    @Transactional(readOnly = true)
    public RelatorioReceitaDTO porPeriodo(String dataInicio, String dataFim) {
        LocalDate inicio = parseData(dataInicio, "data inicial");
        LocalDate fim = parseData(dataFim, "data final");
        if (inicio != null && fim != null && inicio.isAfter(fim)) {
            throw new RegraNegocioException("Erro: A data inicial nao pode ser maior que a data final.");
        }

        Map<String, RelatorioLinhaDTO> agrupado = new LinkedHashMap<>();
        for (HistoricoSolicitacao pagamento : pagamentos()) {
            LocalDate dia = pagamento.getDataHora().toLocalDate();
            if (inicio != null && dia.isBefore(inicio)) {
                continue;
            }
            if (fim != null && dia.isAfter(fim)) {
                continue;
            }
            BigDecimal valor = valor(pagamento.getSolicitacao());
            if (valor.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }
            String chave = dia.format(DIA_ISO);
            RelatorioLinhaDTO linha = agrupado.get(chave);
            if (linha == null) {
                linha = new RelatorioLinhaDTO(chave, dia.format(DIA_BR), 0, BigDecimal.ZERO);
                agrupado.put(chave, linha);
            }
            somar(linha, valor);
        }
        return resumir(agrupado.values().stream()
                .sorted(Comparator.comparing(RelatorioLinhaDTO::getChave))
                .toList());
    }

    @Transactional(readOnly = true)
    public RelatorioReceitaDTO porCategoria() {
        Map<String, RelatorioLinhaDTO> agrupado = new LinkedHashMap<>();
        for (HistoricoSolicitacao pagamento : pagamentos()) {
            BigDecimal valor = valor(pagamento.getSolicitacao());
            if (valor.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }
            String categoria = pagamento.getSolicitacao().getCategoria() == null
                    ? "Sem categoria"
                    : pagamento.getSolicitacao().getCategoria().getNome();
            RelatorioLinhaDTO linha = agrupado.get(categoria);
            if (linha == null) {
                linha = new RelatorioLinhaDTO(categoria, categoria, 0, BigDecimal.ZERO);
                agrupado.put(categoria, linha);
            }
            somar(linha, valor);
        }
        return resumir(agrupado.values().stream()
                .sorted(Comparator.comparing(RelatorioLinhaDTO::getRotulo, String.CASE_INSENSITIVE_ORDER))
                .toList());
    }

    private List<HistoricoSolicitacao> pagamentos() {
        return historicoRepository.findByEstadoAlcancadoOrderByDataHoraAsc(EstadoSolicitacao.PAGA);
    }

    private LocalDate parseData(String valor, String campo) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(valor.trim(), DIA_ISO);
        } catch (DateTimeParseException e) {
            throw new RegraNegocioException("Erro: Informe a " + campo + " no formato aaaa-mm-dd.");
        }
    }

    private BigDecimal valor(Solicitacao solicitacao) {
        if (solicitacao == null || solicitacao.getValorOrcamento() == null) {
            return BigDecimal.ZERO;
        }
        return solicitacao.getValorOrcamento();
    }

    private void somar(RelatorioLinhaDTO linha, BigDecimal valor) {
        linha.setQuantidade(linha.getQuantidade() + 1);
        linha.setTotal(linha.getTotal().add(valor));
    }

    private RelatorioReceitaDTO resumir(List<RelatorioLinhaDTO> linhas) {
        int quantidade = 0;
        BigDecimal total = BigDecimal.ZERO;
        for (RelatorioLinhaDTO linha : linhas) {
            quantidade += linha.getQuantidade();
            total = total.add(linha.getTotal());
        }
        return new RelatorioReceitaDTO(linhas, quantidade, total);
    }
}
