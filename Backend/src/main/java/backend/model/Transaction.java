package backend.model;

import backend.model.enums.TransactionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private BigDecimal ammount;

    private Long referenceId;

    private Boolean isOrder;

    @Enumerated(EnumType.STRING)
    private TransactionStatus status;

    private String vnpTransactionNo;
}
