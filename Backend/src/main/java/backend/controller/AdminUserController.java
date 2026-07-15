package backend.controller;

import backend.model.User;
import backend.model.enums.Role;
import backend.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService service;

    @GetMapping

    public Page<User> getUsers(
            @RequestParam(required = false) String keyword,
            Pageable pageable){
        return service.getUsers(keyword,pageable);
    }
    @GetMapping("/{id}")
    public User getUser(
            @PathVariable Long id){
        return service.getUser(id);
    }

    @PutMapping("/{id}/role")
    public void updateRole(
            @PathVariable Long id,
            @RequestParam Role role){
        service.updateRole(id,role);
    }

    @PutMapping("/{id}/status")
    public void updateStatus(
            @PathVariable Long id){
        service.updateStatus(id);
    }
}
