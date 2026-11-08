package br.ufpr.trabalho_web.service;

import br.ufpr.trabalho_web.dto.RelatorioLinhaDTO;
import br.ufpr.trabalho_web.dto.RelatorioReceitaDTO;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;

public class RelatorioPdf {

    private RelatorioPdf() {
    }

    public static byte[] gerar(String titulo, String subtitulo, String colunaRotulo, RelatorioReceitaDTO relatorio) {
        ByteArrayOutputStream saida = new ByteArrayOutputStream();
        Document documento = new Document(PageSize.A4, 48, 48, 48, 48);
        try {
            PdfWriter.getInstance(documento, saida);
            documento.open();

            Font fonteTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font fonteTexto = FontFactory.getFont(FontFactory.HELVETICA, 11);
            Font fonteNegrito = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);

            Paragraph tituloPdf = new Paragraph(titulo, fonteTitulo);
            tituloPdf.setSpacingAfter(6);
            documento.add(tituloPdf);

            Paragraph subtituloPdf = new Paragraph(subtitulo, fonteTexto);
            subtituloPdf.setSpacingAfter(16);
            documento.add(subtituloPdf);

            PdfPTable tabela = new PdfPTable(new float[] {3f, 1.4f, 1.8f});
            tabela.setWidthPercentage(100);
            tabela.addCell(celula(colunaRotulo, fonteNegrito, Element.ALIGN_LEFT));
            tabela.addCell(celula("Quantidade", fonteNegrito, Element.ALIGN_RIGHT));
            tabela.addCell(celula("Receita", fonteNegrito, Element.ALIGN_RIGHT));

            List<RelatorioLinhaDTO> linhas = relatorio.getLinhas() == null ? List.of() : relatorio.getLinhas();
            for (RelatorioLinhaDTO linha : linhas) {
                tabela.addCell(celula(linha.getRotulo(), fonteTexto, Element.ALIGN_LEFT));
                tabela.addCell(celula(String.valueOf(linha.getQuantidade()), fonteTexto, Element.ALIGN_RIGHT));
                tabela.addCell(celula(moeda(linha.getTotal()), fonteTexto, Element.ALIGN_RIGHT));
            }

            tabela.addCell(celula("Total", fonteNegrito, Element.ALIGN_LEFT));
            tabela.addCell(celula(String.valueOf(relatorio.getQuantidade()), fonteNegrito, Element.ALIGN_RIGHT));
            tabela.addCell(celula(moeda(relatorio.getTotal()), fonteNegrito, Element.ALIGN_RIGHT));
            documento.add(tabela);
        } catch (DocumentException e) {
            throw new IllegalStateException("Nao foi possivel gerar o PDF.", e);
        } finally {
            if (documento.isOpen()) {
                documento.close();
            }
        }
        return saida.toByteArray();
    }

    private static PdfPCell celula(String texto, Font fonte, int alinhamento) {
        PdfPCell celula = new PdfPCell(new Phrase(texto == null ? "" : texto, fonte));
        celula.setPadding(6);
        celula.setHorizontalAlignment(alinhamento);
        return celula;
    }

    private static String moeda(BigDecimal valor) {
        NumberFormat formato = NumberFormat.getCurrencyInstance(Locale.of("pt", "BR"));
        return formato.format(valor == null ? BigDecimal.ZERO : valor);
    }
}
