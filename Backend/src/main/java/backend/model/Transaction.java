package backend.model;

import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
@Entity
@Getter
@Setter
public class Transaction extends BaseEntity{
    private BigDecimal ammount;
    private Long referenceId;
    private Boolean isOrder;
}
