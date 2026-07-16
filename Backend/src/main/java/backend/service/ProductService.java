package backend.service;

import backend.model.Category;
import backend.model.Product;
import backend.model.User;
import backend.model.enums.ProductStatus;
import backend.model.enums.Role;
import backend.repository.CategoryRepository;
import backend.repository.ProductRepository;
import backend.repository.UserRepository;
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

        boolean hasActiveSubscription = seller.getRole() == Role.SELLER
                && seller.getSubscriptionPackage() != null
                && seller.getExpireAt() != null
                && seller.getExpireAt().isAfter(java.time.LocalDateTime.now());

        if (!hasActiveSubscription) {
            throw new RuntimeException("Seller subscription has expired or is inactive. Please subscribe to list products.");
        }

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
        if (request.getImage() != null && !request.getImage().trim().isEmpty()) {
            product.setImage(request.getImage());
        }
        product.setQuantity(request.getQuantity());
        product.setStatus(ProductStatus.PENDING_MANAGER);
        product.setReviewComment(request.getReviewComment());
        product.setReviewDate(request.getReviewDate());

        if (request.getCategory() != null) {
            Category category = categoryRepository.findById(request.getCategory().getId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));

            product.setCategory(category);
        }

        return productRepository.save(product);
    }

    public Product updateProduct(
            Long id,
            MultipartFile image,
            String name,
            String description,
            String ingredient,
            String nutritionInfo,
            BigDecimal price,
            Integer quantity,
            Long categoryId
    ) {
        Product product = getProductById(id);
        product.setName(name);
        product.setDescription(description);
        product.setIngredient(ingredient);
        product.setNutritionInfo(nutritionInfo);
        product.setPrice(price);
        product.setQuantity(quantity);

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        product.setCategory(category);

        if (image != null && !image.isEmpty()) {
            String imageName = fileService.uploadImage(image);
            product.setImage(imageName);
        }

        // Khi chỉnh sửa sản phẩm, tự động chuyển về trạng thái chờ duyệt
        product.setStatus(ProductStatus.PENDING_MANAGER);

        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {

        Product product = getProductById(id);

        productRepository.delete(product);
    }

    // Manager operations
    public List<Product> getPendingProducts() {
        return productRepository.findByStatus(ProductStatus.PENDING_MANAGER);
    }

    public Product getProductDetail(Long id) {
        return getProductById(id);
    }

    public Product approveProduct(Long id) {
        Product product = getProductById(id);
        product.setStatus(ProductStatus.PUBLISHED);
        return productRepository.save(product);
    }

    public Product rejectProduct(Long id, String reviewComment) {
        Product product = getProductById(id);
        product.setStatus(ProductStatus.REJECTED);
        product.setReviewComment(reviewComment);
        product.setReviewDate(java.time.LocalDateTime.now());
        return productRepository.save(product);
    }

    public Product publishProduct(Long id) {
        Product product = getProductById(id);
        product.setStatus(ProductStatus.PUBLISHED);
        return productRepository.save(product);
    }

    public Product hideProduct(Long id, String reviewComment) {
        Product product = getProductById(id);
        product.setStatus(ProductStatus.HIDDEN);
        product.setReviewComment(reviewComment);
        product.setReviewDate(java.time.LocalDateTime.now());
        return productRepository.save(product);
    }
}