package backend.model;
import backend.model.enums.ProductStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id")
    private User seller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String ingredient;

    @Column(columnDefinition = "TEXT")
    private String nutritionInfo;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private String image;

    private Integer quantity;

    @Enumerated(EnumType.STRING)
    private ProductStatus status;

    @OneToOne(mappedBy = "product")
    private Promotion promotion;

    @Column(columnDefinition = "TEXT")
    private String reviewComment;

    private LocalDateTime reviewDate;
}