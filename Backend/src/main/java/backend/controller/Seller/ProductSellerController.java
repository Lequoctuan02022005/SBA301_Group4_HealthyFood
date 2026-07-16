package backend.controller.Seller;
import backend.model.Product;
import backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductSellerController {

    private final ProductService productService;

    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Product createProduct(

            @RequestParam MultipartFile image,

            @RequestParam String name,

            @RequestParam(required = false) String description,

            @RequestParam(required = false) String ingredient,

            @RequestParam(required = false) String nutritionInfo,

            @RequestParam BigDecimal price,

            @RequestParam Integer quantity,

            @RequestParam Long categoryId,

            @RequestParam Long sellerId

    ){

        return productService.createProduct(
                image,
                name,
                description,
                ingredient,
                nutritionInfo,
                price,
                quantity,
                categoryId,
                sellerId
        );
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public Product updateProduct(@PathVariable Long id,
                                 @RequestBody Product product) {
        return productService.updateProduct(id, product);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Product updateProduct(
            @PathVariable Long id,
            @RequestParam(required = false) MultipartFile image,
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String ingredient,
            @RequestParam(required = false) String nutritionInfo,
            @RequestParam BigDecimal price,
            @RequestParam Integer quantity,
            @RequestParam Long categoryId
    ) {
        return productService.updateProduct(
                id,
                image,
                name,
                description,
                ingredient,
                nutritionInfo,
                price,
                quantity,
                categoryId
        );
    }

    @DeleteMapping("/{id}")
    public String deleteProduct(@PathVariable Long id) {

        productService.deleteProduct(id);

        return "Delete successfully";
    }
}
