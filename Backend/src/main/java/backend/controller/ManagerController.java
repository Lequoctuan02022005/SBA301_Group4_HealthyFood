package backend.controller;

import backend.model.Product;
import backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manager")
@RequiredArgsConstructor
public class ManagerController {

    private final ProductService productService;
    private final backend.repository.CategoryRepository categoryRepository;

    // Category CRUD endpoints
    @GetMapping("/categories")
    public ResponseEntity<List<backend.model.Category>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @PostMapping("/categories")
    public ResponseEntity<backend.model.Category> createCategory(@RequestBody backend.model.Category category) {
        if (category.getStatus() == null) {
            category.setStatus(backend.model.enums.CategoryStatus.ACTIVATE);
        }
        backend.model.Category saved = categoryRepository.save(category);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<backend.model.Category> updateCategory(@PathVariable Long id, @RequestBody backend.model.Category categoryDetails) {
        backend.model.Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        category.setName(categoryDetails.getName());
        category.setDescription(categoryDetails.getDescription());
        category.setType(categoryDetails.getType());
        if (categoryDetails.getStatus() != null) {
            category.setStatus(categoryDetails.getStatus());
        }
        backend.model.Category updated = categoryRepository.save(category);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        backend.model.Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        categoryRepository.delete(category);
        return ResponseEntity.ok().build();
    }

    // Product management endpoints
    @GetMapping("/products/pending")
    public ResponseEntity<List<Product>> getPendingProducts() {
        List<Product> pendingProducts = productService.getPendingProducts();
        return ResponseEntity.ok(pendingProducts);
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProductDetail(@PathVariable Long id) {
        Product product = productService.getProductDetail(id);
        return ResponseEntity.ok(product);
    }

    @PatchMapping("/products/{id}/approve")
    public ResponseEntity<Product> approveProduct(@PathVariable Long id) {
        Product product = productService.approveProduct(id);
        return ResponseEntity.ok(product);
    }

    @PatchMapping("/products/{id}/reject")
    public ResponseEntity<Product> rejectProduct(
            @PathVariable Long id,
            @RequestParam String reviewComment
    ) {
        Product product = productService.rejectProduct(id, reviewComment);
        return ResponseEntity.ok(product);
    }

    @PatchMapping("/products/{id}/publish")
    public ResponseEntity<Product> publishProduct(@PathVariable Long id) {
        Product product = productService.publishProduct(id);
        return ResponseEntity.ok(product);
    }

    @PatchMapping("/products/{id}/hide")
    public ResponseEntity<Product> hideProduct(
            @PathVariable Long id,
            @RequestParam String reviewComment
    ) {
        Product product = productService.hideProduct(id, reviewComment);
        return ResponseEntity.ok(product);
    }
}
