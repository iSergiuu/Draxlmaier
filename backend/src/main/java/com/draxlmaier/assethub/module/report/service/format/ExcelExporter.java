package com.draxlmaier.assethub.module.report.service.format;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;

@Component
public class ExcelExporter implements ReportExporter {

    @Override
    public boolean supportsFormat(String format) {
        return "EXCEL".equalsIgnoreCase(format);
    }

    @Override
    public byte[] export(List<Map<String, Object>> data, List<String> columns) {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Raport AssetHub");

            Row headerRow = sheet.createRow(0);
            for (int colIdx = 0; colIdx < columns.size(); colIdx++) {
                Cell cell = headerRow.createCell(colIdx);
                cell.setCellValue(columns.get(colIdx).toUpperCase());
            }

            int rowIdx = 1;
            for (Map<String, Object> rowData : data) {
                Row row = sheet.createRow(rowIdx++);
                for (int colIdx = 0; colIdx < columns.size(); colIdx++) {
                    Cell cell = row.createCell(colIdx);

                    Object value = rowData.get(columns.get(colIdx));

                    if (value != null) {
                        cell.setCellValue(value.toString());
                    } else {
                        cell.setCellValue("");
                    }
                }
            }

            for (int colIdx = 0; colIdx < columns.size(); colIdx++) {
                sheet.autoSizeColumn(colIdx);
            }

            workbook.write(out);
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Eroare la generarea fișierului Excel: " + e.getMessage());
        }
    }
}