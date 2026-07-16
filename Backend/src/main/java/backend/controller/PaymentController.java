package backend.controller;

import backend.config.VNPayConfig;
import backend.repository.OrderRepository;
import backend.repository.SubscriptionRepository;
import backend.repository.TransactionRepository;
import backend.repository.UserRepository;
import backend.service.PaymentService;
import backend.service.SubscriptionService;
import backend.model.Order;
import backend.model.SubscriptionPackage;
import backend.model.Transaction;
import backend.model.User;
import backend.model.enums.OrderStatus;
import backend.model.enums.TransactionStatus;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.net.URI;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController()
@RequestMapping("/api/payment")
public class PaymentController {

    private final PaymentService paymentService;
    private final TransactionRepository transactionRepository;
    private final OrderRepository orderRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final SubscriptionService subscriptionService;

    public PaymentController(
            PaymentService paymentService,
            TransactionRepository transactionRepository,
            OrderRepository orderRepository,
            SubscriptionRepository subscriptionRepository,
            UserRepository userRepository,
            SubscriptionService subscriptionService
    ) {
        this.paymentService = paymentService;
        this.transactionRepository = transactionRepository;
        this.orderRepository = orderRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
        this.subscriptionService = subscriptionService;
    }


    @PostMapping("/create_payment")
    public ResponseEntity<String> createPayment(HttpServletRequest request) throws UnsupportedEncodingException {
        // authen, autho
        //Test
//        Order newOrder = new Order();
//        newOrder.setId(Long.parseLong(VNPayConfig.getRandomNumber(8)));
//        newOrder.setTotalAmount(BigDecimal.valueOf(1000000));

        Transaction newTransaction = new Transaction();
//        newTransaction.setAmmount(BigDecimal.valueOf(2000000));
//        newTransaction.setIsOrder(true);
        transactionRepository.save(newTransaction);

        String paymentUrl = paymentService.createVNPayPaymentUrl(newTransaction,request);
        System.out.println(paymentUrl);
        return ResponseEntity.ok(paymentUrl);
    }

    @GetMapping("/vnpay_return")
    public ResponseEntity<Void> handleVNPayReturn(HttpServletRequest request) {
        Map<String, String> fields = new HashMap<>();
        for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements();) {
            String fieldName = params.nextElement();
            String fieldValue = request.getParameter(fieldName);
            if ((fieldValue != null) && (!fieldValue.isEmpty()) && fieldName.startsWith("vnp_")) {
                fields.put(fieldName, fieldValue);
            }
        }

        String vnp_SecureHash = request.getParameter("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");
        fields.remove("vnp_SecureHash");

        // Verify chữ ký
        boolean valid = VNPayConfig.verifySignature(
                fields,
                vnp_SecureHash,
                VNPayConfig.secretKey
        );

        String frontendOrigin = request.getParameter("frontendOrigin");
        if (frontendOrigin == null || frontendOrigin.isEmpty()) {
            frontendOrigin = "http://localhost:5173"; // fallback
        }

        if (!valid) {
            String redirectUrl = frontendOrigin + "/payment-result?status=fail&error=checksum";
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(redirectUrl))
                    .build();
        }

        String txnRef = fields.get("vnp_TxnRef");
        Long transactionId = txnRef.contains("_") ? Long.parseLong(txnRef.split("_")[0]) : Long.parseLong(txnRef);
        String responseCode = fields.get("vnp_ResponseCode");
        String transactionStatus = fields.get("vnp_TransactionStatus");

        String status = "fail";
        String error = null;

        Optional<Transaction> optional = transactionRepository.findById(transactionId);
        if (optional.isPresent()) {
            Transaction transaction = optional.get();
            if ("00".equals(responseCode) && "00".equals(transactionStatus)) {
                status = "success";
                transaction.setStatus(TransactionStatus.SUCCESS);
                transaction.setVnpTransactionNo(fields.get("vnp_TransactionNo"));

                if (transaction.getIsOrder()) {
                    Optional<Order> orderOptional = orderRepository.findById(transaction.getReferenceId());
                    if (orderOptional.isPresent()) {
                        Order order = orderOptional.get();
                        order.setStatus(OrderStatus.PAID);
                        orderRepository.save(order);
                    }
                } else {
                    Optional<SubscriptionPackage> subOptional = subscriptionRepository.findById(transaction.getReferenceId());
                    if (subOptional.isPresent()) {
                        SubscriptionPackage subPackage = subOptional.get();
                        subscriptionService.buySubscription(transaction.getUser().getId(), subPackage.getId());
                    }
                }
            } else {
                status = "fail";
                transaction.setStatus(TransactionStatus.FAILED);
            }
            transactionRepository.save(transaction);
        } else {
            status = "fail";
            error = "not_found";
        }

        String redirectUrl = frontendOrigin + "/payment-result?status=" + status + "&transactionId=" + transactionId;
        if (error != null) {
            redirectUrl += "&error=" + error;
        }

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(redirectUrl))
                .build();
    }

    @PostMapping("/create_order_payment")
    public ResponseEntity<Map<String, String>> createOrderPayment(
            @RequestParam Long userId,
            @RequestParam Long orderId,
            HttpServletRequest request
    ) throws UnsupportedEncodingException {
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

        String paymentUrl = paymentService.createVNPayPaymentUrl(transaction, request);
        return ResponseEntity.ok(Map.of("paymentUrl", paymentUrl));
    }

    @PostMapping("/create_subscription_payment")
    public ResponseEntity<Map<String, String>> createSubscriptionPayment(
            @RequestParam Long userId,
            @RequestParam Long packageId,
            HttpServletRequest request
    ) throws UnsupportedEncodingException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        SubscriptionPackage subPackage = subscriptionRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Subscription Package not found"));

        Transaction transaction = Transaction.builder()
                .user(user)
                .ammount(subPackage.getPrice())
                .referenceId(packageId)
                .isOrder(false)
                .status(TransactionStatus.PENDING)
                .build();

        transactionRepository.save(transaction);

        String paymentUrl = paymentService.createVNPayPaymentUrl(transaction, request);
        return ResponseEntity.ok(Map.of("paymentUrl", paymentUrl));
    }
}
