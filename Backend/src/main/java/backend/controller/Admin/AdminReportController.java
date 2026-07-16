package backend.controller.Admin;

import backend.model.Report;
import backend.model.enums.ReportStatus;
import backend.service.AdminReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class AdminReportController {

    private final AdminReportService service;

    @GetMapping
    public Page<Report> getReports(Pageable pageable) {
        return service.getAllReports(pageable);
    }

    @GetMapping("/{id}")
    public Report getReport(@PathVariable Long id) {
        return service.getReportById(id);
    }

    @PutMapping("/{id}/status")
    public void updateStatus(
            @PathVariable Long id,
            @RequestParam ReportStatus status,
            @RequestParam(required = false) String managerComment) {
        service.updateReportStatus(id, status, managerComment);
    }
}
