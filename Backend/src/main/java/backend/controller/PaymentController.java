package backend.controller;

import backend.config.VNPayConfig;
import backend.repository.OrderRepository;
import backend.repository.SubscriptionRepository;
import backend.repository.TransactionRepository;
import backend.service.PaymentService;
import backend.model.Order;
import backend.model.SubscriptionPackage;
import backend.model.Transaction;
import backend.model.enums.OrderStatus;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
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

    public PaymentController(PaymentService paymentService, TransactionRepository transactionRepository, OrderRepository orderRepository, SubscriptionRepository subscriptionRepository) {
        this.paymentService = paymentService;
        this.transactionRepository = transactionRepository;
        this.orderRepository = orderRepository;
        this.subscriptionRepository = subscriptionRepository;
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
    public /*ResponseEntity<Map<String, String>>*/ String handleVNPayReturn(HttpServletRequest request){
        Map<String, String> response = new HashMap<>();

        Map<String,String> fields = new HashMap();
        for (Enumeration params = request.getParameterNames(); params.hasMoreElements();) {
            String fieldName = (String) params.nextElement();
            String fieldValue = request.getParameter(fieldName);
            if ((fieldValue != null) && (!fieldValue.isEmpty())) {
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

        if (!valid) {
            response.put("RspCode", "97");
            response.put("Message", "Invalid Checksum");
//            return ResponseEntity.ok(response);
            return "invalid";
        }

        //request.getParameterNames()
//        String orderId = request.getParameterNames("vnp_TxnRef");
//        String amount = request.getParameterNames("vnp_TxnRef");
        Long transactionId = Long.parseLong(fields.get("vnp_TxnRef"));
        BigDecimal amount = BigDecimal.valueOf(Double.valueOf(fields.get("vnp_Amount"))/100) ;

        String responseCode = fields.get("vnp_ResponseCode").toString();
        String transactionStatus = fields.get("vnp_TransactionStatus").toString();

        // TODO:
        // 1. Tìm Order trong DB
        // 2. Kiểm tra amount
        // 3. Kiểm tra trạng thái

        if ("00".equals(responseCode)
                && "00".equals(transactionStatus)) {

            // orderService.markAsPaid(orderId);
            Optional<Transaction> optional = transactionRepository.findById(transactionId);
            if(optional.isPresent()){
                Transaction transaction = optional.get();
                if(transaction.getIsOrder()){
                    Optional<Order> orderOptional = orderRepository.findById(transaction.getReferenceId());
                    if(orderOptional.isPresent()){
                        Order order = orderOptional.get();
                        order.setStatus(OrderStatus.PAID);
                    }
                }
                else{
                    Optional<SubscriptionPackage> subOptional = subscriptionRepository.findById(transaction.getReferenceId());
                    if(subOptional.isPresent()){
                        SubscriptionPackage subsciption = subOptional.get();
                        //Logic subcription
                    }
                }
            }

            response.put("RspCode", "00");
            response.put("Message", "Confirm Success");

        } else {

            // orderService.markAsFailed(orderId);

            response.put("RspCode", "00");
            response.put("Message", "Transaction Failed");
        }
        System.out.println("Payment: "+transactionId+" "+amount+" "+responseCode);
//        return ResponseEntity.ok(response);
        return "Payment: "+transactionId+" "+amount+" "+responseCode;
    }
}
