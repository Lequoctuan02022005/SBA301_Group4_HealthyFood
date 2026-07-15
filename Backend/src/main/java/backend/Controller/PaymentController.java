package backend.Controller;

import backend.Config.VNPayConfig;
import backend.Repository.OrderRepository;
import backend.Repository.SubscriptionRepository;
import backend.Repository.TransactionRepository;
import backend.Repository.UserRepository;
import backend.Services.PaymentService;
import backend.model.Order;
import backend.model.SubscriptionPackage;
import backend.model.Transaction;
import backend.model.User;
import backend.model.enums.OrderStatus;
import backend.model.enums.TransactionStatus;
import backend.service.SubscriptionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private final PaymentService paymentService;
    private final TransactionRepository transactionRepository;
    private final OrderRepository orderRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final SubscriptionService subscriptionService;

    public PaymentController(PaymentService paymentService,
                             TransactionRepository transactionRepository,
                             OrderRepository orderRepository,
                             SubscriptionRepository subscriptionRepository,
                             UserRepository userRepository,
                             SubscriptionService subscriptionService) {
        this.paymentService = paymentService;
        this.transactionRepository = transactionRepository;
        this.orderRepository = orderRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
        this.subscriptionService = subscriptionService;
    }

    // ════════════════════════════════════════════════════════════
    //  CUSTOMER: Thanh toán đơn hàng (Order)
    // ════════════════════════════════════════════════════════════
    @PostMapping("/create_order_payment")
    public ResponseEntity<?> createOrderPayment(
            @RequestParam Long userId,
            @RequestParam Long orderId,
            HttpServletRequest request
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Transaction transaction = Transaction.builder()
                .user(user)
                .ammount(order.getTotalAmount())
                .referenceId(orderId)
                .isOrder(true)
                .status(TransactionStatus.PENDING)
                .build();

        transactionRepository.save(transaction);

        try {
            String paymentUrl = paymentService.createVNPayPaymentUrl(transaction, request);
            Map<String, Object> response = new HashMap<>();
            response.put("paymentUrl", paymentUrl);
            response.put("transactionId", transaction.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to create payment URL: " + e.getMessage()));
        }
    }

    // ════════════════════════════════════════════════════════════
    //  SELLER: Thanh toán gói Subscription
    // ════════════════════════════════════════════════════════════
    @PostMapping("/create_subscription_payment")
    public ResponseEntity<?> createSubscriptionPayment(
            @RequestParam Long userId,
            @RequestParam Long packageId,
            HttpServletRequest request
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        SubscriptionPackage subscriptionPackage = subscriptionRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Subscription package not found"));

        Transaction transaction = Transaction.builder()
                .user(user)
                .ammount(subscriptionPackage.getPrice())
                .referenceId(packageId)
                .isOrder(false)
                .status(TransactionStatus.PENDING)
                .build();

        transactionRepository.save(transaction);

        try {
            String paymentUrl = paymentService.createVNPayPaymentUrl(transaction, request);
            Map<String, Object> response = new HashMap<>();
            response.put("paymentUrl", paymentUrl);
            response.put("transactionId", transaction.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to create payment URL: " + e.getMessage()));
        }
    }

    // ════════════════════════════════════════════════════════════
    //  VNPay Callback: Xử lý kết quả thanh toán
    // ════════════════════════════════════════════════════════════
    @GetMapping("/vnpay_return")
    public org.springframework.web.servlet.view.RedirectView handleVNPayReturn(HttpServletRequest request) {
        // Thu thập tất cả tham số từ VNPay
        Map<String, String> fields = new HashMap<>();
        for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements(); ) {
            String fieldName = params.nextElement();
            String fieldValue = request.getParameter(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                fields.put(fieldName, fieldValue);
            }
        }

        String vnpSecureHash = request.getParameter("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");
        fields.remove("vnp_SecureHash");

        // Verify chữ ký từ VNPay
        boolean valid = VNPayConfig.verifySignature(fields, vnpSecureHash, VNPayConfig.secretKey);

        if (!valid) {
            return new org.springframework.web.servlet.view.RedirectView("http://localhost:5173/payment-result?status=fail&error=checksum");
        }

        Long transactionId = Long.parseLong(fields.get("vnp_TxnRef"));
        String responseCode = fields.get("vnp_ResponseCode");
        String transactionStatus = fields.get("vnp_TransactionStatus");
        String vnpTransactionNo = fields.get("vnp_TransactionNo");

        Optional<Transaction> optional = transactionRepository.findById(transactionId);

        if (optional.isEmpty()) {
            return new org.springframework.web.servlet.view.RedirectView("http://localhost:5173/payment-result?status=fail&error=not_found");
        }

        Transaction transaction = optional.get();

        // Kiểm tra nếu giao dịch đã được xử lý rồi (tránh xử lý trùng)
        if (transaction.getStatus() == TransactionStatus.SUCCESS) {
            return new org.springframework.web.servlet.view.RedirectView("http://localhost:5173/payment-result?status=success&transactionId=" + transactionId);
        }

        if ("00".equals(responseCode) && "00".equals(transactionStatus)) {
            // ── THANH TOÁN THÀNH CÔNG ──
            transaction.setStatus(TransactionStatus.SUCCESS);
            transaction.setVnpTransactionNo(vnpTransactionNo);

            if (Boolean.TRUE.equals(transaction.getIsOrder())) {
                // Luồng 1: Customer mua hàng → đánh dấu Order là PAID
                Optional<Order> orderOptional = orderRepository.findById(transaction.getReferenceId());
                if (orderOptional.isPresent()) {
                    Order order = orderOptional.get();
                    order.setStatus(OrderStatus.PAID);
                    orderRepository.save(order);
                }
            } else {
                // Luồng 2: Seller mua subscription → kích hoạt gói
                Long userId = transaction.getUser().getId();
                Long packageId = transaction.getReferenceId();
                subscriptionService.buySubscription(userId, packageId);
            }

            transactionRepository.save(transaction);
            return new org.springframework.web.servlet.view.RedirectView("http://localhost:5173/payment-result?status=success&transactionId=" + transactionId);

        } else {
            // ── THANH TOÁN THẤT BẠI ──
            transaction.setStatus(TransactionStatus.FAILED);
            transaction.setVnpTransactionNo(vnpTransactionNo);
            transactionRepository.save(transaction);
            return new org.springframework.web.servlet.view.RedirectView("http://localhost:5173/payment-result?status=fail&transactionId=" + transactionId);
        }
    }
}
