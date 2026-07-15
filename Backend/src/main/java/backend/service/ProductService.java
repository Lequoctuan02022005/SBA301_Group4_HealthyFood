package backend.service;

import backend.model.Category;
import backend.model.Product;
import backend.model.User;
import backend.model.enums.ProductStatus;
import backend.Repository.CategoryRepository;
import backend.Repository.ProductRepository;
import backend.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final FileService fileService;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public Product createProduct(
            MultipartFile image,
            String name,
            String description,
            String ingredient,
            String nutritionInfo,
            BigDecimal price,
            Integer quantity,
            Long categoryId,
            Long sellerId
    ){

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        String imageName = fileService.uploadImage(image);

        Product product = Product.builder()
                .name(name)
                .description(description)
                .ingredient(ingredient)
                .nutritionInfo(nutritionInfo)
                .price(price)
                .quantity(quantity)
                .image(imageName)
                .category(category)
                .seller(seller)
                .status(ProductStatus.PENDING_MANAGER)
                .build();

        return productRepository.save(product);

    }

    public Product updateProduct(Long id, Product request) {

        Product product = getProductById(id);

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setIngredient(request.getIngredient());
        product.setNutritionInfo(request.getNutritionInfo());
        product.setPrice(request.getPrice());
        product.setImage(request.getImage());
        product.setQuantity(request.getQuantity());
        product.setStatus(request.getStatus());
        product.setReviewComment(request.getReviewComment());
        product.setReviewDate(request.getReviewDate());

        if (request.getCategory() != null) {
            Category category = categoryRepository.findById(request.getCategory().getId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));

            product.setCategory(category);
        }

        return productRepository.save(product);
    }
    
    public void deleteProduct(Long id) {

        Product product = getProductById(id);

        productRepository.delete(product);
    }
}