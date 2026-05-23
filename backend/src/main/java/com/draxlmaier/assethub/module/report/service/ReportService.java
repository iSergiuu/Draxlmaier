package com.draxlmaier.assethub.module.report.service;

import com.draxlmaier.assethub.module.report.dto.ReportRequestDTO;
import com.draxlmaier.assethub.module.report.service.format.ReportExporter;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.lang.reflect.Field;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final EntityManager entityManager;

    private final List<ReportExporter> exporters;

    public byte[] generateReport(ReportRequestDTO request) {
        ReportExporter selectedExporter = exporters.stream()
                .filter(exporter -> exporter.supportsFormat(request.getFormat()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Format de export nesuportat: " + request.getFormat()));

        String entityName = getEntityClassName(request.getEntityType());

        StringBuilder jpql = new StringBuilder("SELECT e FROM " + entityName + " e WHERE 1=1");

        Map<String, String> filters = request.getFilters();
        if (filters != null && !filters.isEmpty()) {
            for (String key : filters.keySet()) {
                jpql.append(" AND e.").append(key).append(" = :").append(key.replace(".", ""));
            }
        }

        if (request.getSortBy() != null && !request.getSortBy().isEmpty()) {
            String direction = "DESC".equalsIgnoreCase(request.getSortDirection()) ? "DESC" : "ASC";
            jpql.append(" ORDER BY e.").append(request.getSortBy()).append(" ").append(direction);
        }

        TypedQuery<Object> query = entityManager.createQuery(jpql.toString(), Object.class);
        if (filters != null && !filters.isEmpty()) {
            for (Map.Entry<String, String> entry : filters.entrySet()) {
                query.setParameter(entry.getKey().replace(".", ""), entry.getValue());
            }
        }

        List<Object> results = query.getResultList();

        List<Map<String, Object>> mappedData = new ArrayList<>();
        for (Object obj : results) {
            Map<String, Object> row = new HashMap<>();
            for (String col : request.getColumns()) {
                row.put(col, extractValue(obj, col));
            }
            mappedData.add(row);
        }

        return selectedExporter.export(mappedData, request.getColumns());
    }

    private String getEntityClassName(String entityType) {
        if ("ASSET".equalsIgnoreCase(entityType)) return "Asset";
        if ("COMPLAINT".equalsIgnoreCase(entityType)) return "Complaint";
        if ("EMPLOYEE".equalsIgnoreCase(entityType)) return "Employee";
        if ("DEPARTMENT".equalsIgnoreCase(entityType)) return "Department";
        throw new IllegalArgumentException("Tip de entitate necunoscut: " + entityType);
    }

    private Object extractValue(Object obj, String fieldName) {
        try {
            if (fieldName.contains(".")) {
                String[] parts = fieldName.split("\\.");
                Object current = obj;
                for (String part : parts) {
                    if (current == null) return null;
                    current = getFieldValue(current, part);
                }
                return current;
            }
            return getFieldValue(obj, fieldName);
        } catch (Exception e) {
            return null;
        }
    }

    private Object getFieldValue(Object obj, String fieldName) throws Exception {
        Field field = obj.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        return field.get(obj);
    }
}