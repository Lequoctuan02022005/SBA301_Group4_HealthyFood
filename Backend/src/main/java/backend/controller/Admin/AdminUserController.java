package backend.controller.Admin;

import backend.model.User;
import backend.model.enums.Role;
import backend.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService service;

    @GetMapping("/kpis")
    public java.util.Map<String, Long> getKpis() {
        return service.getKpis();
    }

    @GetMapping
    public Page<User> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) backend.model.enums.UserStatus status,
            Pageable pageable) {

        return service.getUsers(keyword, status, pageable);
    }

    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {

        return service.getUser(id);
    }

    @PutMapping("/{id}/role")
    public void updateRole(
            @PathVariable Long id,
            @RequestParam Role role) {

        service.updateRole(id, role);
    }

    @PutMapping("/{id}/status")
    public void updateStatus(@PathVariable Long id) {

        service.updateStatus(id);
    }

    @PostMapping
    public User createUser(@RequestBody backend.dto.UserCreateDto dto) {
        return service.createUser(dto);
    }

    @ExceptionHandler(RuntimeException.class)
    public org.springframework.http.ResponseEntity<String> handleException(RuntimeException e) {
        return org.springframework.http.ResponseEntity.badRequest().body(e.getMessage());
    }
}