# 🏥 HealthyFood Backend - Current Code Overview

**Project**: Healthy Food E-commerce Platform
**Framework**: Spring Boot 3.x + JPA/Hibernate
**Database**: PostgreSQL
**Frontend**: Vue.js/React (Port 5173, 3000)

---

## 📁 Package Structure

```
backend/
├── config/              → Configuration & initialization
├── controller/          → REST API endpoints
│   ├── manager/        → Manager-specific endpoints (NEW)
│   └── Seller/         → Seller-specific endpoints
├── dto/                → Data Transfer Objects (EMPTY - TBD)
├── model/              → JPA Entity classes
│   └── enums/          → Enumeration types
├── repository/         → JPA Repository interfaces
├── service/            → Business logic layer
└── BackendApplication.java  → Spring Boot main entry point
```

---

## 🏢 Core Entities & Relationships

### **User Entity**
- **Fields**: email, password, name, phone, address, avatar, role, status, violationCount, unbanAt, subscriptionPackage, subscriptionExpired
- **Relationships**:
  - 1:N → PRODUCT (as seller)
  - 1:N → ORDER (as customer)
  - 1:N → CART (shopping cart items)
  - 1:N → REVIEW (product reviews)
  - 1:N → REPORT (as customer or seller involved)
  - 1:1 → SUBSCRIPTION_PACKAGE (current seller subscription)
- **Roles**: CUSTOMER, SELLER, NUTRIENT, MANAGER, ADMIN
- **Status**: ACTIVE, BANNED

### **Product Entity** ⭐
- **Fields**: name, description, ingredient, nutritionInfo, price, image, quantity, status, reviewComment, reviewDate
- **Relationships**:
  - N:1 → USER (seller)
  - N:1 → CATEGORY (via ProductTarget)
  - 1:1 → PROMOTION (discount campaign)
  - 1:N → REVIEW
  - 1:N → CART
  - 1:N → ORDER_DETAIL
  - 1:N → PRODUCT_TARGET (junction table for category)
  - 1:N → REPORT
- **Status Flow**: PENDING_MANAGER → PUBLISHED / REJECTED / HIDDEN
- **Note**: Product does NOT store category directly; uses ProductTarget relationship

### **ProductTarget Entity** (Junction Table)
- **Purpose**: Maps products to categories/target demographics
- **Relationships**:
  - N:1 → PRODUCT
  - N:1 → CATEGORY
- **Usage**: Allows flexible product categorization and dietary target associations

### **Category Entity**
- **Fields**: name, type (PRODUCT or TARGET), status (PENDING/ACTIVATE/DEACTIVATE), description
- **Relationships**:
  - 1:N → PRODUCT (via ProductTarget)
  - 1:N → PRODUCT_TARGET
- **Types**: 
  - PRODUCT: Organic Foods, Protein, Fresh Fruits, Snacks, Beverages, Dairy (6 default)
  - TARGET: Gym, Weight Loss, Diabetes, Pregnant Women (4 default)

### **Cart Entity**
- **Fields**: quantity
- **Relationships**:
  - N:1 → USER (customer)
  - N:1 → PRODUCT
- **Constraint**: Unique(customer_id, product_id) - one product per customer

### **Order Entity**
- **Fields**: totalAmount, totalItems, status
- **Relationships**:
  - N:1 → USER (customer)
  - 1:N → ORDER_DETAIL (line items)
- **Status Flow**: PENDING → PAID → DELIVERING → COMPLETED / CANCELLED

### **OrderDetail Entity**
- **Fields**: quantity, price
- **Relationships**:
  - N:1 → ORDER
  - N:1 → PRODUCT

### **Review Entity**
- **Fields**: rating, comment
- **Relationships**:
  - N:1 → PRODUCT
  - N:1 → USER (customer)

### **Promotion Entity**
- **Fields**: name, discount (amount/percent), type (PERCENT or FIXED_AMOUNT), startDate, endDate
- **Relationships**:
  - 1:1 → PRODUCT (unique)

### **Report Entity**
- **Fields**: reason, description, sellerStatement, status, managerComment, isRequestRefund, resolvedAt
- **Relationships**:
  - N:1 → PRODUCT
  - N:1 → USER (customer - reporter)
  - N:1 → USER (seller - defendant)
  - 1:N → EVIDENCE
- **Status Flow**: PENDING → SELLER_RESPONDED → APPROVED/REJECTED → CLOSED
- **Reasons**: WRONG_INFORMATION, FAKE_PRODUCT, EXPIRED_PRODUCT, DAMAGED_PRODUCT, HEALTH_PROBLEM, OTHER

### **Evidence Entity**
- **Fields**: uploadedAt, uploadedBy (CUSTOMER or SELLER), type (IMAGE or VIDEO)
- **Relationships**:
  - N:1 → REPORT

### **SubscriptionPackage Entity**
- **Fields**: name, price, durationDays, status (ACTIVATE/DEACTIVATE), description
- **Default Packages** (seeded):
  - 1 Month: 199,000 VND
  - 3 Months: 499,000 VND
  - 6 Months: 899,000 VND
  - 1 Year: 1,500,000 VND
- **Relationships**: 1:N → USER

### **Transaction Entity**
- **Fields**: amount, status, paymentMethod, referenceId (order/subscription id), referenceType
- **Purpose**: Track VNPay payment transactions
- **Links**: ORDER or SUBSCRIPTION_PACKAGE

### **BaseEntity** (Abstract)
- **Fields**: id (PK), createdAt, updatedAt
- **Extended by**: All entity classes
- **Lifecycle**: Auto-managed via @PrePersist/@PreUpdate

---

## 📋 Enums

| Enum | Values | Purpose |
|------|--------|---------|
| **Role** | CUSTOMER, SELLER, NUTRIENT, MANAGER, ADMIN | User account type |
| **UserStatus** | ACTIVE, BANNED | User account state |
| **ProductStatus** | PENDING_MANAGER, PUBLISHED, REJECTED, HIDDEN | Product approval workflow |
| **OrderStatus** | PENDING, PAID, DELIVERING, COMPLETED, CANCELLED | Order lifecycle |
| **CategoryStatus** | PENDING, ACTIVATE, DEACTIVATE | Category state |
| **CategoryType** | PRODUCT, TARGET | Category classification |
| **PromotionType** | PERCENT, FIXED_AMOUNT | Discount type |
| **PackageStatus** | ACTIVATE, DEACTIVATE | Package availability |
| **ReportReason** | WRONG_INFORMATION, FAKE_PRODUCT, EXPIRED_PRODUCT, DAMAGED_PRODUCT, HEALTH_PROBLEM, OTHER | Report category |
| **ReportStatus** | PENDING, SELLER_RESPONDED, APPROVED, REJECTED, CLOSED | Report workflow |
| **EvidenceOwner** | CUSTOMER, SELLER | Evidence uploader |
| **EvidenceType** | IMAGE, VIDEO | Media type |

---

## 🔧 Service Layer

### **ProductService** ⭐ (RECENTLY REFACTORED)
- **Location**: `backend.service.ProductService`
- **Responsibilities**:
  - CRUD operations for products
  - Create: Takes image (multipart), validates category & seller, saves product, creates ProductTarget relationship
  - Update: Updates all product fields (no direct category access)
  - Delete: Cascades to ProductTargets, then deletes product
  - Query: `getProductById()`, `getAllProducts()`, `getProductsApprovedByNutritionist()`
  - Manager operations: `approveProduct()`, `publishProduct()`, `rejectProduct()`, `hideProduct()`
- **Manager Search**: `getProductsApprovedByNutritionist()` uses `ProductRepository.searchForManager(status, sellerId, keyword, pageable)`
- **Key Change**: Uses ProductTarget for category relationship instead of direct Product.category

### **FileService**
- **Location**: `backend.service.FileService`
- **Responsibilities**:
  - Uploads MultipartFile to `Backend/uploads/` directory
  - Generates unique filenames using UUID
  - Returns filename for database storage
  - Handles IOException

### **PaymentService**
- **Location**: `backend.service.PaymentService`
- **Responsibilities**:
  - Generates VNPay payment URLs
  - Builds payment parameters (amount, currency, bank, timestamps)
  - Calculates HMAC-SHA512 signature
  - Converts amounts (multiply by 100 for VNPay)
  - Extracts request IP address
  - Verifies return signatures

### **SubscriptionService**
- **Location**: `backend.service.SubscriptionService`
- **Responsibilities**:
  - CRUD for subscription packages
  - Purchase subscription: Assigns package, calculates expiration (duration days)
  - Extends expired subscriptions if renewing

### **CategoryService** (REFACTORED)
- **Location**: `backend.service.CategoryService`
- **Responsibilities**:
  - Manager category approval workflow
  - CRUD operations for categories
  - Search and filter categories

### **ReportService** (REFACTORED)
- **Location**: `backend.service.ReportService`
- **Responsibilities**:
  - Report CRUD and workflow management
  - Manager report review and decision logic
  - Evidence management

### **PenaltyService** (REFACTORED)
- **Location**: `backend.service.PenaltyService`
- **Responsibilities**:
  - Send warnings to sellers/customers
  - Suspend user accounts
  - Restore user accounts

### **DashboardService** (REFACTORED)
- **Location**: `backend.service.DashboardService`
- **Responsibilities**:
  - Revenue statistics (by date range)
  - Product statistics
  - Report statistics

### **SubscriptionPackageService** (REFACTORED)
- **Location**: `backend.service.SubscriptionPackageService`
- **Responsibilities**:
  - CRUD for subscription packages
  - Search and filter packages
  - Activation/deactivation

---

## 🌐 REST Controllers

### **ProductSellerController** (`/api/products`) ⭐ MOST COMPLETE
```
GET    /api/products              → Get all products
GET    /api/products/{id}         → Get product by ID
POST   /api/products              → Create product (multipart/form-data)
PUT    /api/products/{id}         → Update product
DELETE /api/products/{id}         → Delete product
```
- **Injects**: ProductService
- **Parameters**:
  - Create: image (file), name, description, ingredient, nutritionInfo, price, quantity, categoryId, sellerId
  - Update: Product entity in body

### **ManagerController** (`/api/manager`) ⭐ REFACTORED STRUCTURE
**Location**: `backend.controller.manager.ManagerController`

**Product Approval** (`/api/manager/products/*`):
```
GET    /api/manager/products/pending        → Get pending manager products
GET    /api/manager/products/{productId}    → Get product detail with targets
PATCH  /api/manager/products/{productId}/approve   → Approve product
PATCH  /api/manager/products/{productId}/reject    → Reject product
PATCH  /api/manager/products/{productId}/publish   → Publish product
PATCH  /api/manager/products/{productId}/hide      → Hide product
```

**Category Management** (`/api/manager/category-requests/*` & `/api/manager/categories/*`):
```
GET    /api/manager/category-requests           → Get category requests
PATCH  /api/manager/category-requests/{id}/approve   → Approve category
PATCH  /api/manager/category-requests/{id}/reject    → Reject category
DELETE /api/manager/categories/{id}             → Delete unused category
GET    /api/manager/categories                  → Get all categories
```

**Subscription Packages** (`/api/manager/subscription-packages/*`):
```
POST   /api/manager/subscription-packages                → Create
PUT    /api/manager/subscription-packages/{id}         → Update
DELETE /api/manager/subscription-packages/{id}         → Delete
PATCH  /api/manager/subscription-packages/{id}/deactivate → Deactivate
GET    /api/manager/subscription-packages               → List
```

**Report Management** (`/api/manager/reports/*`):
```
GET    /api/manager/reports                           → Get all reports
GET    /api/manager/reports/search                    → Search reports
GET    /api/manager/reports/{id}                      → Get report detail
GET    /api/manager/reports/{id}/evidences           → Get evidence list
GET    /api/manager/reports/{id}/appeal              → Get seller appeal
PATCH  /api/manager/reports/{id}/approve             → Approve report
PATCH  /api/manager/reports/{id}/reject              → Reject report
```

**Penalties** (`/api/manager/sellers/*` & `/api/manager/customers/*`):
```
POST   /api/manager/sellers/{id}/warnings        → Send warning
PATCH  /api/manager/sellers/{id}/suspend         → Suspend seller
PATCH  /api/manager/sellers/{id}/restore         → Restore seller
PATCH  /api/manager/customers/{id}/suspend       → Suspend customer
POST   /api/manager/customers/{id}/restore       → Restore customer
```

**Dashboard** (`/api/manager/dashboard/*`):
```
GET    /api/manager/dashboard/revenue    → Revenue statistics
GET    /api/manager/dashboard/products   → Product statistics
GET    /api/manager/dashboard/reports    → Report statistics
```

### **SubscriptionController** (`/api/subscriptions`)
```
GET  /api/subscriptions       → Get all subscription packages
GET  /api/subscriptions/{id}  → Get package by ID
POST /api/subscriptions/buy   → Purchase subscription (userId, packageId)
```

### **OrderController** (`/orders`)
```
GET    /orders           → Get all orders
GET    /orders/{id}      → Get order by ID
POST   /orders           → Create order from cart
DELETE /orders/{id}      → Cancel order (PENDING only)
GET    /orders/{id}/checkout  → Generate VNPay URL
```

### **CartController** (`/carts`)
```
GET    /carts           → Get all cart items
POST   /carts           → Add to cart
POST   /carts/{id}      → Update quantity
DELETE /carts/{id}      → Remove from cart
```

### **PaymentController** (`/api/payment`)
```
POST /api/payment/create_payment    → Initiate VNPay payment
GET  /api/payment/vnpay_return      → VNPay callback (verify & update status)
```

### **CategoryController** (`/categories`)
```
GET /categories  → Get all categories
```

### **ReviewController** (`/reviews`)
```
GET  /reviews  → Get all reviews
POST /reviews  → Create review
```

### **ProductController** (`/products`)
```
GET /products      → Get all products
GET /products/{id} → Get product by ID
```

### **AuthController** (`/api`) ⚠️ STUB
- Status: Empty implementation (placeholder)
- Endpoints: login, logout, register, verifyEmail, resetPassword

---

## 🗄️ Repository Layer

| Repository | Methods |
|------------|---------|
| **ProductRepository** | `findBySeller(User)`, `findByStatus(ProductStatus)`, `findByNameContainingIgnoreCase(String)`, `searchForManager(status, sellerId, keyword, pageable)` ⭐ |
| **ProductTargetRepository** | `findByProductId(Long)`, `findByCategoryId(Long)`, `existsByCategoryId(Long)`, `deleteByProductId(Long)`, `findByProductIdAndCategoryId(Long, Long)` |
| **UserRepository** | `existsByEmail(String)`, `findByEmail(String)` |
| **CartRepository** | Standard CRUD only |
| **OrderRepository** | Standard CRUD only |
| **CategoryRepository** | Standard CRUD only |
| **ReviewRepository** | Standard CRUD only |
| **ReportRepository** | Standard CRUD only |
| **SubscriptionRepository** | Standard CRUD only |
| **TransactionRepository** | Standard CRUD only |
| **EvidenceRepository** | Standard CRUD only |

---

## ⚙️ Configuration

### **SecurityConfig** (`backend.config`)
- BCrypt password encoder
- CORS for `http://localhost:5173` (Vite)
- CSRF disabled (stateless REST API)
- **Public endpoints**: `/login`, `/register`, `/logout`, `/verifyEmail`, `/resetPassword`, `/api/**`, `/uploads/**`
- **Protected endpoints**: 
  - `/admin/**` → Requires ADMIN role
  - All others → Requires authentication

### **WebConfig** (`backend.config`)
- CORS mapping for ports 5173 (Vite) and 3000 (CRA)
- Allowed methods: GET, POST, PUT, DELETE, OPTIONS
- Serves static uploads from `Backend/uploads/`

### **VNPayConfig** (`backend.config`)
- Sandbox URL: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`
- Merchant Code: `BVI5EQNF`
- Return URL: `http://localhost:8080/api/payment/vnpay_return`
- Helper methods: `md5()`, `Sha256()`, `hmacSHA512()`, `getIpAddress()`, `verifySignature()`

### **GlobalControllerAdvice** (`backend.config`)
- Global exception handler
- Returns JSON error responses: `{timestamp, status, error, message}`
- Handles: RuntimeException (400), Generic Exception (500)

### **RoleDataInitializer** (`backend.config`)
**Seeds on startup**:
- **10 Categories**: 
  - Products (6): Organic Foods, Protein & Supplements, Fresh Fruits, Snacks, Beverages, Dairy
  - Targets (4): Gym, Weight Loss, Diabetes, Pregnant Women
- **5 Test Users**:
  - Admin, Seller (seller@healthyfood.com / 123456), Customer, Manager, Nutrient
- **4 Subscription Packages**: 1M/3M/6M/1Y with prices

---

## 🔄 Business Logic Flows (Simplified)

### **Product Creation & Approval**
```
1. Seller creates product (via ProductSellerController)
   → ProductService.createProduct()
   → Uploads image via FileService
   → Saves Product with status = PENDING_MANAGER
   → Creates ProductTarget (product + category relationship)

2. Manager reviews pending products
   → GET /api/manager/products/pending
   → Views ProductDetail (product + ProductTargets)

3. Manager decision:
   Option A: PATCH /api/manager/products/{id}/approve
            → Sets status = PUBLISHED
   Option B: PATCH /api/manager/products/{id}/reject
            → Sets status = REJECTED + comment
   Option C: PATCH /api/manager/products/{id}/hide
            → Sets status = HIDDEN + reason
```

### **Order & Payment Flow (Customer Purchase)**
```
1. Customer adds products to cart
   → POST /carts (creates Cart entries)

2. Customer creates order
   → POST /orders (converts cart items to Order + OrderDetails)

3. Customer initiates checkout
   → GET /orders/{id}/checkout
   → PaymentService generates VNPay URL + signature
   → Redirect to VNPay payment page

4. VNPay callback
   → PaymentController.handleVnpayReturn()
   → Verifies HMAC-SHA512 signature
   → If valid: Updates Order.status = PAID
   → Creates Transaction record
   → Sends confirmation response

5. Order fulfillment
   → Order status: PENDING → PAID → DELIVERING → COMPLETED
```

---

## 🚀 Key Recent Changes (This Session)

### ✅ **Service Layer Refactoring**
- Renamed `ManagerCategoryService` → `CategoryService`
- Renamed `ManagerProductService` → `ProductService`
- Renamed `ManagerReportService` → `ReportService`
- Renamed `ManagerPenaltyService` → `PenaltyService`
- Renamed `ManagerDashboardService` → `DashboardService`
- Renamed `ManagerSubscriptionPackageService` → `SubscriptionPackageService`
- Renamed `ProductService` (seller) → `SellerProductService` → **MERGED into ProductService**
- Removed "Manager" prefix to make services reusable by all roles

### ✅ **Controller Restructuring**
- Created `controller/manager/` package
- Moved `ManagerController` to `backend.controller.manager` package
- Updated `ProductSellerController` to use unified `ProductService`

### ✅ **ProductService Compilation Fixes**
- Removed `getCategory()` / `setCategory()` errors
- Refactored to use `ProductTarget` relationship for categories
- Added `searchForManager()` query to ProductRepository
- Added cascade delete to ProductTargets
- All methods aligned with actual entity relationships

---

## 📊 Database Schema Notes

- **ORM**: JPA/Hibernate
- **Naming**: Entity names in CamelCase, DB tables in snake_case
- **IDs**: Auto-generated IDENTITY strategy
- **Timestamps**: All entities have createdAt/updatedAt (auto-managed)
- **Constraints**:
  - Cart: UNIQUE(user_id, product_id)
  - Promotion: UNIQUE(product_id)
  - User: UNIQUE(email)
- **Relationships**: All use LAZY fetch to avoid N+1 queries

---

## ⚠️ Known Issues & Gaps

1. **Authentication**: Auth controller is stub (empty implementation)
   - JWT/Token authentication not yet implemented
   - Password hashing configured but not consistently applied

2. **DTOs**: No DTO layer implemented
   - Entities directly exposed in API responses
   - Security & versioning risk
   - Recommendation: Create request/response DTOs

3. **Validation**: Minimal input validation in services
   - Recommendation: Add Bean Validation (@Valid, @NotBlank, etc.)

4. **Logging**: No logging configured
   - Recommendation: Add SLF4J with Logback

5. **Error Handling**: Basic exception handling
   - Recommendation: More specific exception types

6. **Testing**: No test suite visible
   - Recommendation: Add unit & integration tests

7. **Pagination**: Not all list endpoints support pagination
   - Manager endpoints: ✅ Support pagination
   - Seller endpoints: ⚠️ Need pagination

---

## 📚 API Response Format

**Success Response**:
```json
{
  "success": true,
  "message": "OK",
  "data": { /* entity or list */ }
}
```

**Error Response**:
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "error": "RuntimeException",
  "message": "Detailed error message"
}
```

---

## 🔐 Security Checklist

- ✅ BCrypt password encoder configured
- ✅ CORS enabled for frontend URLs only
- ✅ CSRF disabled (correct for REST API)
- ⚠️ VNPay credentials hardcoded (use `@Value` from properties)
- ⚠️ JWT authentication not implemented
- ✅ Role-based access control in SecurityConfig
- ⚠️ File uploads directory should have access restrictions

---

## 📖 How to Use This Document

1. **Understanding Entity Relationships**: See "Core Entities & Relationships" section
2. **API Endpoints**: See "REST Controllers" section
3. **Business Logic**: See "Business Logic Flows" section
4. **Service Responsibilities**: See "Service Layer" section
5. **Recent Changes**: See "Key Recent Changes" section
6. **Configuration**: See "Configuration" section

---

**Last Updated**: 2026-07-16
**Status**: Active Development
**Version**: 1.0.0
