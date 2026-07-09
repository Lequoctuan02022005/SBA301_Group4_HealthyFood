package backend.model;

import backend.model.enums.PackageStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "subscription_packages")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPackage extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private BigDecimal price;

    private Integer durationDays;

    private PackageStatus status;
    @Column(columnDefinition = "TEXT")
    private String description;
}