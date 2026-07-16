package backend.config;

import backend.model.Category;
import backend.model.SubscriptionPackage;
import backend.model.User;
import backend.model.enums.CategoryStatus;
import backend.model.enums.CategoryType;
import backend.model.enums.Role;
import backend.model.enums.UserStatus;
import backend.repository.CategoryRepository;
import backend.repository.SubscriptionRepository;
import backend.repository.UserRepository;
import backend.repository.ProductRepository;
import backend.model.Product;
import backend.model.enums.ProductStatus;
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
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        System.out.println("🔹 Initializing default data...");

        seedCategories();
        seedUsers();
        seedSubscriptionPackages();
        seedProducts();

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

    private void seedProducts() {
        if (productRepository.count() > 0) return;

        User seller = userRepository.findByEmail("seller@healthyfood.com").orElse(null);
        if (seller == null) {
            System.out.println("❌ Seller not found. Skipping product seeding.");
            return;
        }

        List<Category> categories = categoryRepository.findAll();
        Category organic = categories.stream().filter(c -> c.getName().equals("Organic Foods")).findFirst().orElse(null);
        Category protein = categories.stream().filter(c -> c.getName().equals("Protein & Supplements")).findFirst().orElse(null);
        Category fruits = categories.stream().filter(c -> c.getName().equals("Fresh Fruits & Vegetables") || c.getName().equals("Fresh Fruits")).findFirst().orElse(null);
        Category snacks = categories.stream().filter(c -> c.getName().equals("Healthy Snacks")).findFirst().orElse(null);
        Category beverages = categories.stream().filter(c -> c.getName().equals("Beverages")).findFirst().orElse(null);
        Category dairy = categories.stream().filter(c -> c.getName().equals("Dairy & Alternatives")).findFirst().orElse(null);

        List<Product> products = List.of(
            Product.builder()
                .seller(seller)
                .category(protein)
                .name("Ức gà áp chảo thảo mộc")
                .description("Ức gà phi lê áp chảo cùng với các loại thảo mộc tự nhiên mang đến hương vị thơm ngon và ít calo, cực kỳ thích hợp cho thực đơn tăng cơ.")
                .ingredient("Ức gà phi lê, cỏ xạ hương, hương thảo, tỏi, dầu oliu, muối, tiêu đen.")
                .nutritionInfo("Calories: 165kcal, Protein: 31g, Carbs: 0g, Fat: 3.6g (trên 100g)")
                .price(new BigDecimal("75000"))
                .image("chicken_breast.jpg")
                .quantity(50)
                .status(ProductStatus.PUBLISHED)
                .build(),
            Product.builder()
                .seller(seller)
                .category(protein)
                .name("Bột Whey Protein Isolate hữu cơ")
                .description("Whey Protein cô đặc tinh khiết từ sữa bò chăn thả tự nhiên, giúp hấp thụ protein nhanh chóng hỗ trợ phục hồi cơ bắp tối ưu.")
                .ingredient("Whey Protein cô đặc, bột cacao hữu cơ, chiết xuất cỏ ngọt stevia tự nhiên.")
                .nutritionInfo("Calories: 120kcal, Protein: 25g, Carbs: 2g, Fat: 1g (trên mỗi muỗng 30g)")
                .price(new BigDecimal("850000"))
                .image("whey_protein.jpg")
                .quantity(20)
                .status(ProductStatus.PUBLISHED)
                .build(),
            Product.builder()
                .seller(seller)
                .category(fruits != null ? fruits : organic)
                .name("Salad Xà lách Hoàng đế và Bơ")
                .description("Món salad thanh mát kết hợp giữa xà lách Romaine tươi giòn và bơ sáp dẻo ngậy cùng sốt Caesar đặc trưng tốt cho tim mạch.")
                .ingredient("Xà lách Romaine, bơ sáp Đắk Lắk, cà chua bi hữu cơ, bánh mì nguyên cám sấy giòn, sốt Caesar thuần chay.")
                .nutritionInfo("Calories: 210kcal, Protein: 4g, Carbs: 12g, Fat: 16g")
                .price(new BigDecimal("65000"))
                .image("avocado_salad.jpg")
                .quantity(30)
                .status(ProductStatus.PUBLISHED)
                .build(),
            Product.builder()
                .seller(seller)
                .category(organic)
                .name("Yến mạch cán dẹt Organic Úc")
                .description("Yến mạch nguyên cám hữu cơ nhập khẩu trực tiếp từ Úc, giàu chất xơ hòa tan tốt cho tiêu hóa và tim mạch.")
                .ingredient("100% Yến mạch nguyên cám hữu cơ cán dẹt.")
                .nutritionInfo("Calories: 389kcal, Protein: 16.9g, Carbs: 66g, Fat: 6.9g (trên 100g)")
                .price(new BigDecimal("120000"))
                .image("rolled_oats.jpg")
                .quantity(100)
                .status(ProductStatus.PUBLISHED)
                .build(),
            Product.builder()
                .seller(seller)
                .category(beverages)
                .name("Nước ép Cần tây táo xanh nguyên chất")
                .description("Nước ép lạnh nguyên chất giữ trọn vẹn dinh dưỡng, giúp thanh lọc cơ thể, thải độc và hỗ trợ làn da tươi sáng.")
                .ingredient("Cần tây Đà Lạt sạch, táo xanh hữu cơ, gừng tươi.")
                .nutritionInfo("Calories: 85kcal, Protein: 1.5g, Carbs: 20g, Fat: 0.2g")
                .price(new BigDecimal("45000"))
                .image("celery_juice.jpg")
                .quantity(40)
                .status(ProductStatus.PUBLISHED)
                .build(),
            Product.builder()
                .seller(seller)
                .category(snacks)
                .name("Granola mật ong hạt dinh dưỡng")
                .description("Hỗn hợp yến mạch sấy giòn cùng các loại hạt cao cấp và mật ong tự nhiên, món ăn vặt lý tưởng không lo tăng cân.")
                .ingredient("Yến mạch cán dẹt, hạt hạnh nhân, hạt điều, hạt bí, nho khô, mật ong hoa rừng nguyên chất.")
                .nutritionInfo("Calories: 450kcal, Protein: 10g, Carbs: 58g, Fat: 18g (trên 100g)")
                .price(new BigDecimal("160000"))
                .image("granola.jpg")
                .quantity(60)
                .status(ProductStatus.PUBLISHED)
                .build(),
            Product.builder()
                .seller(seller)
                .category(dairy)
                .name("Sữa chua Hy Lạp ít béo tự nhiên")
                .description("Sữa chua Hy Lạp đặc quánh mịn màng, chứa hàm lượng protein gấp đôi sữa chua thông thường và cực kỳ ít béo.")
                .ingredient("Sữa tươi thanh trùng tách béo, men sữa chua Lactobacillus bulgaricus.")
                .nutritionInfo("Calories: 80kcal, Protein: 10g, Carbs: 3.6g, Fat: 2g (trên hũ 100g)")
                .price(new BigDecimal("35000"))
                .image("greek_yogurt.jpg")
                .quantity(80)
                .status(ProductStatus.PUBLISHED)
                .build(),
            Product.builder()
                .seller(seller)
                .category(organic)
                .name("Gạo lứt đỏ Điện Biên dẻo ngon")
                .description("Gạo lứt đỏ huyết rồng Điện Biên giàu chất xơ, vitamin nhóm B, hỗ trợ kiểm soát đường huyết và duy trì cân nặng.")
                .ingredient("100% Gạo lứt đỏ Điện Biên dẻo sạch, không chất bảo quản.")
                .nutritionInfo("Calories: 360kcal, Protein: 7.5g, Carbs: 77g, Fat: 2.7g (trên 100g)")
                .price(new BigDecimal("55000"))
                .image("brown_rice.jpg")
                .quantity(120)
                .status(ProductStatus.PUBLISHED)
                .build(),
            Product.builder()
                .seller(seller)
                .category(beverages)
                .name("Trà Kombucha vị Dâu tằm hữu cơ")
                .description("Trà Kombucha lên men tự nhiên chứa hàng tỷ lợi khuẩn probiotics tốt cho hệ tiêu hoá và hệ miễn dịch.")
                .ingredient("Trà đen hữu cơ, con giống Kombucha Scoby, đường mía organic, nước cốt dâu tằm tươi Đà Lạt.")
                .nutritionInfo("Calories: 30kcal, Protein: 0g, Carbs: 7g, Fat: 0g (trên chai 250ml)")
                .price(new BigDecimal("38000"))
                .image("kombucha.jpg")
                .quantity(70)
                .status(ProductStatus.PUBLISHED)
                .build(),
            Product.builder()
                .seller(seller)
                .category(snacks)
                .name("Bánh quy Biscotti nguyên cám ăn kiêng")
                .description("Bánh quy nướng 2 lần giòn rụm theo công thức Ý truyền thống, sử dụng bột nguyên cám và nhiều hạt dinh dưỡng, không đường tinh luyện.")
                .ingredient("Bột mì nguyên cám, hạt hạnh nhân Mỹ, hạt dẻ cười, nam việt quất khô, trứng gà ta, mật ong.")
                .nutritionInfo("Calories: 75kcal, Protein: 2.5g, Carbs: 11g, Fat: 2g (trên mỗi miếng 15g)")
                .price(new BigDecimal("145000"))
                .image("biscotti.jpg")
                .quantity(50)
                .status(ProductStatus.PUBLISHED)
                .build()
        );

        productRepository.saveAll(products);
        System.out.println("⭐ Seeded " + products.size() + " products successfully!");
    }
}