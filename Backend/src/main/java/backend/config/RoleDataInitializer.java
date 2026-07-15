package backend.Config;

import backend.model.Category;
import backend.model.SubscriptionPackage;
import backend.model.User;
import backend.model.enums.CategoryStatus;
import backend.model.enums.CategoryType;
import backend.model.enums.Role;
import backend.model.enums.UserStatus;
import backend.Repository.CategoryRepository;
import backend.Repository.SubscriptionRepository;
import backend.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class RoleDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        System.out.println("🔹 Initializing default data...");

        seedCategories();
        seedUsers();
        seedSubscriptionPackages();

        System.out.println("✅ Initialization completed!");
    }

    // ════════════════════════════════════════════
    //  CATEGORIES
    // ════════════════════════════════════════════
    private void seedCategories() {
        if (categoryRepository.count() > 0) return;

        List<Category> categories = List.of(
                buildCategory("Organic Foods",              "Natural and certified organic food products",    CategoryType.PRODUCT),
                buildCategory("Protein & Supplements",      "Protein powders, vitamins and supplements",      CategoryType.PRODUCT),
                buildCategory("Fresh Fruits & Vegetables",  "Farm-fresh fruits and vegetables",               CategoryType.PRODUCT),
                buildCategory("Healthy Snacks",             "Low-calorie and nutritious snack options",       CategoryType.PRODUCT),
                buildCategory("Beverages",                  "Healthy drinks, juices and smoothies",           CategoryType.PRODUCT),
                buildCategory("Dairy & Alternatives",       "Milk, yogurt and plant-based alternatives",      CategoryType.PRODUCT),
                buildCategory("Gym",                        "Suitable for gym and bodybuilding goals",        CategoryType.TARGET),
                buildCategory("Weight Loss",                "Ideal for weight management",                    CategoryType.TARGET),
                buildCategory("Diabetes",                   "Low-sugar products for diabetic users",          CategoryType.TARGET),
                buildCategory("Pregnant Women",             "Safe and nutritious for pregnant women",         CategoryType.TARGET)
        );

        categoryRepository.saveAll(categories);
        System.out.println("⭐ Seeded " + categories.size() + " categories");
    }

    // ════════════════════════════════════════════
    //  USERS
    // ════════════════════════════════════════════
    private void seedUsers() {
        seedUser("admin@healthyfood.com",    "System Admin",    "0900000000", Role.ADMIN);
        seedUser("seller@healthyfood.com",   "Test Seller",     "0900000001", Role.SELLER);
        seedUser("customer@healthyfood.com", "Test Customer",   "0900000002", Role.CUSTOMER);
        seedUser("manager@healthyfood.com",  "Test Manager",    "0900000003", Role.MANAGER);
        seedUser("nutrient@healthyfood.com", "Test Nutrient",   "0900000004", Role.NUTRIENT);
        System.out.println("⭐ Users ready");
        System.out.println("   → seller@healthyfood.com / 123456 (SELLER)");
    }

    // ════════════════════════════════════════════
    //  SUBSCRIPTION PACKAGES
    // ════════════════════════════════════════════
    private void seedSubscriptionPackages() {
        if (subscriptionRepository.count() > 0) return;

        List<SubscriptionPackage> packages = List.of(
                buildPackage("1 Month",  new BigDecimal("199000"),  30,  "Basic seller package for 1 month"),
                buildPackage("3 Months", new BigDecimal("499000"),  90,  "Standard package for 3 months — Save 17%"),
                buildPackage("6 Months", new BigDecimal("899000"),  180, "Premium package for 6 months — Save 25%"),
                buildPackage("1 Year",   new BigDecimal("1499000"), 365, "Ultimate package for 1 year — Save 37%")
        );

        subscriptionRepository.saveAll(packages);
        System.out.println("⭐ Seeded " + packages.size() + " subscription packages");
    }

    // ════════════════════════════════════════════
    //  BUILDERS
    // ════════════════════════════════════════════
    private Category buildCategory(String name, String description, CategoryType type) {
        return Category.builder()
                .name(name)
                .description(description)
                .type(type)
                .status(CategoryStatus.ACTIVATE)
                .build();
    }

    private User buildUser(String email, String fullName, String phone, Role role) {
        return User.builder()
                .email(email)
                .password(passwordEncoder.encode("123456"))
                .fullName(fullName)
                .phone(phone)
                .role(role)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .violationCount(0)
                .build();
    }

    private void seedUser(String email, String fullName, String phone, Role role) {
        if (!userRepository.existsByEmail(email)) {
            userRepository.save(buildUser(email, fullName, phone, role));
            System.out.println("   ✔ Created user: " + email + " [" + role + "]");
        }
    }

    private SubscriptionPackage buildPackage(String name, BigDecimal price, int durationDays, String description) {
        return SubscriptionPackage.builder()
                .name(name)
                .price(price)
                .durationDays(durationDays)
                .description(description)
                .build();
    }
}