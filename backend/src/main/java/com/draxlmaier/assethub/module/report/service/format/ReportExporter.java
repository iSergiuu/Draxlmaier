package com.draxlmaier.assethub.module.report.service.format;

import java.util.List;
import java.util.Map;

public interface ReportExporter {

    boolean supportsFormat(String format);

    byte[] export(List<Map<String, Object>> data, List<String> columns);
}