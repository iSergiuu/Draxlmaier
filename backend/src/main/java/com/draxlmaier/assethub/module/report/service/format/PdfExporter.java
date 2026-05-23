package com.draxlmaier.assethub.module.report.service.format;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Component;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;

@Component
public class PdfExporter implements ReportExporter {

    @Override
    public boolean supportsFormat(String format) {
        return "PDF".equalsIgnoreCase(format);
    }

    @Override
    public byte[] export(List<Map<String, Object>> data, List<String> columns) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, out);
            document.open();

            PdfPTable table = new PdfPTable(columns.size());
            table.setWidthPercentage(100);

            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
            headerFont.setColor(Color.WHITE);

            for (String column : columns) {
                PdfPCell cell = new PdfPCell(new Phrase(column.toUpperCase(), headerFont));
                cell.setBackgroundColor(Color.DARK_GRAY);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(8);
                table.addCell(cell);
            }

            Font rowFont = FontFactory.getFont(FontFactory.HELVETICA);

            for (Map<String, Object> row : data) {
                for (String col : columns) {
                    Object value = row.get(col);
                    String cellValue = (value != null) ? value.toString() : "";

                    PdfPCell cell = new PdfPCell(new Phrase(cellValue, rowFont));
                    cell.setPadding(5);
                    table.addCell(cell);
                }
            }

            document.add(table);
            document.close();

            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Eroare la generarea fișierului PDF: " + e.getMessage());
        }
    }
}