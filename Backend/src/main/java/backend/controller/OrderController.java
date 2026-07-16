package backend.controller;

import backend.security.JwtUtil;
import backend.dto.CartItemIds;
import backend.model.*;
import backend.repository.CartRepository;
import backend.repository.OrderRepository;
import backend.repository.TransactionRepository;
import backend.service.PaymentService;
import backend.model.Order;
import backend.model.Transaction;
import backend.model.enums.OrderStatus;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/orders")
public class OrderController {
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private TransactionRepository transactionRepository;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private backend.repository.ProductRepository productRepository;

    private final PaymentService paymentService;
    private final CartRepository cartRepository;

    public OrderController(PaymentService paymentService, CartRepository cartRepository) {
        this.paymentService = paymentService;
        this.cartRepository = cartRepository;
    }


    @GetMapping("")
    public List<Order> getAll(){ return orderRepository.findAll();}

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Order>> getByCustomer(@PathVariable Long customerId){
        try {
            List<Order> orders = orderRepository.findByCustomerIdWithDetails(customerId);
            return ResponseEntity.ok(orders);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getById(@PathVariable long id){
        return orderRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("")
    public ResponseEntity<?> create(@RequestBody Order order){
         try{
             if (order.getOrderDetails() == null || order.getOrderDetails().isEmpty()) {
                 return ResponseEntity.badRequest().body("Đơn hàng không có sản phẩm nào.");
             }
             
             // Validate and deduct stock
             for (OrderDetail detail : order.getOrderDetails()) {
                 if (detail.getProduct() == null || detail.getProduct().getId() == null) {
                     return ResponseEntity.badRequest().body("Thông tin sản phẩm không hợp lệ.");
                 }
                 Product product = productRepository.findById(detail.getProduct().getId())
                     .orElse(null);
                 if (product == null) {
                     return ResponseEntity.badRequest().body("Sản phẩm không tồn tại.");
                 }
                 if (product.getQuantity() == null || product.getQuantity() < detail.getQuantity()) {
                     return ResponseEntity.badRequest().body("Sản phẩm '" + product.getName() + "' không đủ số lượng trong kho (Còn lại: " + (product.getQuantity() != null ? product.getQuantity() : 0) + ").");
                 }
                 // Deduct
                 product.setQuantity(product.getQuantity() - detail.getQuantity());
                 productRepository.save(product);
                 
                 // Associate detail
                 detail.setProduct(product);
                 detail.setOrder(order);
             }
             
             order.setStatus(OrderStatus.PENDING);
             Order savedOrder = orderRepository.save(order);
             return ResponseEntity.ok(savedOrder);
         }
         catch (Exception ex){
             ex.printStackTrace();
             return ResponseEntity.internalServerError().build();
         }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@PathVariable long id){
        Optional<Order> optional = orderRepository.findById(id);

        if(optional.isEmpty()) return ResponseEntity.notFound().build();

        Order order = optional.get();
        if(order.getStatus()!= OrderStatus.PENDING) return ResponseEntity.badRequest().build();
        //Cancel
        order.setStatus(OrderStatus.CANCELLED);
        
        // Refund stock
        if (order.getOrderDetails() != null) {
            for (OrderDetail detail : order.getOrderDetails()) {
                Product product = detail.getProduct();
                if (product != null) {
                    product.setQuantity(product.getQuantity() + detail.getQuantity());
                    productRepository.save(product);
                }
            }
        }
        
        orderRepository.save(order);
        return ResponseEntity.ok().build();
    }

//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> cancel(@PathVariable long id) {
//        return repo.findById(id)
//                .map(order -> {
//                    if (order.getStatus() == OrderStatus.PENDING) {
//                        order.setStatus(OrderStatus.CANCELLED);
//                        repo.save(order);
//                        return ResponseEntity.<Void>ok().build();
//                    }
//                    return ResponseEntity.<Void>badRequest().build();
//                })
//                .orElse(ResponseEntity.<Void>notFound().build());
//    }

    @GetMapping("/{id}/checkout")
    public ResponseEntity<String> checkOut(@PathVariable long id, HttpServletRequest request) throws UnsupportedEncodingException {
        Optional<Order> optional = orderRepository.findById(id);
        if(optional.isPresent()){
            Order order = optional.get();
            Transaction newTransaction = new Transaction();
            newTransaction.setReferenceId(id);
            newTransaction.setUser(order.getCustomer());
            newTransaction.setAmmount(order.getTotalAmount());
            newTransaction.setIsOrder(true);
            transactionRepository.save(newTransaction);
            String paymentURL = paymentService.createVNPayPaymentUrl(newTransaction, request);
            return ResponseEntity.ok(paymentURL);
        }
        return ResponseEntity.notFound().build();
    }
}
