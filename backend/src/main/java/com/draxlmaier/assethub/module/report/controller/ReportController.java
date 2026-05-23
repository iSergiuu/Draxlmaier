package com.draxlmaier.assethub.module.report.controller;

import com.draxlmaier.assethub.module.report.dto.ReportRequestDTO;
import com.draxlmaier.assethub.module.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping("/generate")
    public ResponseEntity<byte[]> generateReport(@RequestBody ReportRequestDTO request) {
        try {
            byte[] reportBytes = reportService.generateReport(request);

            String extension = request.getFormat().toLowerCase();
            if (extension.equals("excel")) {
                extension = "xlsx";
            }
            String fileName = "raport_" + request.getEntityType().toLowerCase() + "." + extension;

            MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
            if ("csv".equals(extension)) {
                mediaType = MediaType.parseMediaType("text/csv");
            } else if ("xlsx".equals(extension)) {
                mediaType = MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            } else if ("pdf".equals(extension)) {
                mediaType = MediaType.APPLICATION_PDF;
            } else if ("xml".equals(extension)) {
                mediaType = MediaType.APPLICATION_XML;
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(mediaType)
                    .body(reportBytes);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}