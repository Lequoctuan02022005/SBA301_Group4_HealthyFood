package backend.model;

import backend.model.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private User customer;
    //thêm bảng voucher
    private String voucherCode;

    @Column(nullable = false)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;
    @OneToMany
    private List<OrderDetail> orderDetails;

    public BigDecimal calculateTotalAmount(){
        Double calculate = 0.0;
        for(OrderDetail detail : orderDetails){
            calculate *= detail.getPrice().doubleValue();
        }
        calculate = calculate > 5000 ? calculate : 5000;
        this.totalAmount = BigDecimal.valueOf(calculate);
        return this.totalAmount;
    }
}
