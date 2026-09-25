package br.ufpr.trabalho_web.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SolicitacaoResumoDTO(
        Long id,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime dataHoraAbertura,
        String descricaoEquipamento,
        String categoria,
        String estado,
        BigDecimal valorOrcamento
) {}
