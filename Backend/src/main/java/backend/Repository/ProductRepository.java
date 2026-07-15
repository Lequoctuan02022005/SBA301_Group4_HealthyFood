package backend.Repository;

import backend.model.Product;
import backend.model.Category;
import backend.model.User;
import backend.model.enums.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findBySeller(User seller);

    List<Product> findByCategory(Category category);

    List<Product> findByStatus(ProductStatus status);

    List<Product> findByNameContainingIgnoreCase(String keyword);

}