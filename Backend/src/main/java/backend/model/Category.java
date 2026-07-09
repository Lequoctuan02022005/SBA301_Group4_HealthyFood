package backend.model;
import backend.model.enums.CategoryStatus;
import backend.model.enums.CategoryType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categories")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Category extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private CategoryType type;
    //Them enum cho status
    @Column(nullable = false)
    private CategoryStatus status;
}