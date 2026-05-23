package com.draxlmaier.assethub.module.report.service.format;

import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class XmlExporter implements ReportExporter {

    @Override
    public boolean supportsFormat(String format) {
        return "XML".equalsIgnoreCase(format);
    }

    @Override
    public byte[] export(List<Map<String, Object>> data, List<String> columns) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            XmlMapper xmlMapper = new XmlMapper();

            List<Map<String, Object>> formattedData = new ArrayList<>();

            for (Map<String, Object> row : data) {
                Map<String, Object> xmlRow = new LinkedHashMap<>();
                for (String col : columns) {
                    String xmlTagName = col.replace(".", "_");
                    Object value = row.get(col);
                    xmlRow.put(xmlTagName, value != null ? value.toString() : "");
                }
                formattedData.add(xmlRow);
            }

            Map<String, Object> rootStructure = new LinkedHashMap<>();
            rootStructure.put("item", formattedData);

            xmlMapper.writerWithDefaultPrettyPrinter()
                    .withRootName("report")
                    .writeValue(out, rootStructure);

            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Eroare la generarea fișierului XML: " + e.getMessage());
        }
    }
}