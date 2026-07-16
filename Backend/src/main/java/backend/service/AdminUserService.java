package backend.service;

import backend.model.User;
import backend.model.enums.Role;
import backend.model.enums.UserStatus;
import backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminUserService {
    
    private static final String FIXED_ADMIN_EMAIL = "admin@healthyfood.com";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Map<String, Long> getKpis() {
        Map<String, Long> m = new HashMap<>();
        m.put("totalUsers", userRepository.count());
        m.put("totalSellers", userRepository.countByRole(Role.SELLER));
        m.put("totalCustomers", userRepository.countByRole(Role.CUSTOMER));
        return m;
    }

    public Page<User> getUsers(String keyword, UserStatus status, Pageable pageable) {
        return userRepository.search(keyword, status, pageable);
    }

    public User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public void updateRole(Long id, Role role) {
        User user = getUser(id);
        
        if (user.getRole() == Role.ADMIN && role != Role.ADMIN) {
            throw new RuntimeException("Cannot change role of an ADMIN account.");
        }
        if (FIXED_ADMIN_EMAIL.equalsIgnoreCase(user.getEmail()) && role != Role.ADMIN) {
            throw new RuntimeException("Cannot change role of the fixed admin account.");
        }
        if (!FIXED_ADMIN_EMAIL.equalsIgnoreCase(user.getEmail()) && role == Role.ADMIN) {
            throw new RuntimeException("Only account " + FIXED_ADMIN_EMAIL + " can have ADMIN role.");
        }

        user.setRole(role);
        userRepository.save(user);
    }

    public void updateStatus(Long id) {
        User user = getUser(id);
        if (FIXED_ADMIN_EMAIL.equalsIgnoreCase(user.getEmail())) {
            throw new RuntimeException("Cannot change status of the fixed admin account.");
        }
        if (user.getStatus() == UserStatus.ACTIVE) {
            user.setStatus(UserStatus.BANNED);
        } else {
            user.setStatus(UserStatus.ACTIVE);
        }
        userRepository.save(user);
    }

    public User createUser(backend.dto.UserCreateDto dto) {
        if (dto.getEmail() == null || !dto.getEmail().contains("@")) {
            throw new RuntimeException("Email không hợp lệ! Vui lòng nhập đúng định dạng.");
        }
        if (dto.getFullName() != null && dto.getFullName().matches(".*[@$!%*?&^#()_+=-].*")) {
            throw new RuntimeException("Tên không được chứa ký tự đặc biệt!");
        }
        
        String pwd = dto.getPassword() != null && !dto.getPassword().isEmpty() ? dto.getPassword() : "123456";
        if (pwd.length() < 8 || !pwd.matches(".*[a-z].*") || !pwd.matches(".*[A-Z].*") || !pwd.matches(".*\\d.*") || !pwd.matches(".*[@$!%*?&^#()_+=-].*") || pwd.contains(" ")) {
            throw new RuntimeException("Mật khẩu phải mạnh (8 ký tự, hoa, thường, số, ký tự đặc biệt)!");
        }

        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email đã tồn tại trong hệ thống!");
        }

        Role newRole = dto.getRole() != null ? dto.getRole() : Role.CUSTOMER;
        
        if (newRole == Role.ADMIN) {
            long adminCount = userRepository.countByRole(Role.ADMIN);
            if (adminCount >= 1) {
                throw new RuntimeException("Hệ thống chỉ được phép có 1 Admin!");
            }
        }
        if (newRole == Role.MANAGER) {
            long managerCount = userRepository.countByRole(Role.MANAGER);
            if (managerCount >= 1) {
                throw new RuntimeException("Hệ thống chỉ được phép có 1 Manager!");
            }
        }

        User user = new User();
        user.setEmail(dto.getEmail());
        user.setFullName(dto.getFullName());
        user.setPassword(passwordEncoder.encode(pwd));
        user.setRole(newRole);
        user.setStatus(UserStatus.ACTIVE);
        user.setEmailVerified(true);
        user.setViolationCount(0);
        return userRepository.save(user);
    }
}
