package backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "carts",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {
                        "customer_id",
                        "product_id"
                })
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Cart extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private User customer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id")
    private Product product;

    private Integer quantity;
}
