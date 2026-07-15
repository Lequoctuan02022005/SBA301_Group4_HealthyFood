package backend.Repository;

import backend.model.User;
import backend.model.enums.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Page<User> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String fullName,
            String email,
            Pageable pageable
    );

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u " +
            "WHERE (:q IS NULL OR :q = '' " +
            "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :q, '%'))) " +
            "AND (:status IS NULL OR u.status = :status)")
    Page<User> search(@org.springframework.data.repository.query.Param("q") String q,
                      @org.springframework.data.repository.query.Param("status") UserStatus status,
                      Pageable pageable);

    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);
    Page<User> findByStatus(UserStatus status, Pageable pageable);
    long countByRole(backend.model.enums.Role role);
}