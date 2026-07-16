package backend.model;

import backend.model.enums.Role;
import backend.model.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String email;

    // nho hash di nhe
    @Column(nullable = false)
    private String password;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String fullName;

    private String phone;

    //image url
    private String avatar;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Enumerated(EnumType.STRING)
    private UserStatus status;

    private Boolean emailVerified;


    // dang json string (BMI, di ung voi gi, stk ngan hang)
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String customerPersonalInfo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_package_id")
    private SubscriptionPackage subscriptionPackage;

    @Column(nullable = true)
    private LocalDateTime expireAt;

    @Column(nullable = true)
    private LocalDateTime unbanAt;

    @Builder.Default
    private Integer violationCount = 0;
}