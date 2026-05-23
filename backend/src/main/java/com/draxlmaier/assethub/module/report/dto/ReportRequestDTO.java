package com.draxlmaier.assethub.module.report.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class ReportRequestDTO {

    private String entityType;
    private String format;
    private List<String> columns;
    private Map<String, String> filters;
    private String sortBy;
    private String sortDirection;
}
