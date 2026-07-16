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
