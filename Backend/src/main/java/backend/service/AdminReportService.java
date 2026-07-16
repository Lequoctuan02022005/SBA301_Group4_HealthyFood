package backend.service;

import backend.model.Report;
import backend.model.enums.ReportStatus;
import backend.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminReportService {

    private final ReportRepository reportRepository;

    public Page<Report> getAllReports(Pageable pageable) {
        return reportRepository.findAll(pageable);
    }

    public Report getReportById(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));
    }

    public void updateReportStatus(Long id, ReportStatus status, String managerComment) {
        Report report = getReportById(id);
        report.setStatus(status);
        if (managerComment != null && !managerComment.isEmpty()) {
            report.setManagerComment(managerComment);
        }
        if (status == ReportStatus.APPROVED || status == ReportStatus.REJECTED) {
            report.setResolvedAt(LocalDateTime.now());
        }
        reportRepository.save(report);
    }
}
