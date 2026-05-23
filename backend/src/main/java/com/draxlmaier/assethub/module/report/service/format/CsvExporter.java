package com.draxlmaier.assethub.module.report.service.format;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Component
public class CsvExporter implements ReportExporter {

    @Override
    public boolean supportsFormat(String format) {
        return "CSV".equalsIgnoreCase(format);
    }

    @Override
    public byte[] export(List<Map<String, Object>> data, List<String> columns) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             CSVPrinter printer = new CSVPrinter(new PrintWriter(new OutputStreamWriter(out, StandardCharsets.UTF_8)), CSVFormat.DEFAULT)) {

            printer.printRecord(columns);

            for (Map<String, Object> row : data) {
                for (String col : columns) {
                    Object value = row.get(col);
                    printer.print(value != null ? value.toString() : "");
                }
                printer.println();
            }

            printer.flush();
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Eroare la generarea fișierului CSV: " + e.getMessage());
        }
    }
}