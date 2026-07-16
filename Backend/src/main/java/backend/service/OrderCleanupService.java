package backend.service;

import backend.model.Order;
import backend.model.OrderDetail;
import backend.model.Product;
import backend.model.enums.OrderStatus;
import backend.repository.OrderRepository;
import backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderCleanupService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Scheduled(fixedRate = 60000) // runs every 60 seconds (1 minute)
    @Transactional
    public void cancelExpiredOrders() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(5);
        List<Order> allOrders = orderRepository.findAll();
        for (Order order : allOrders) {
            if (order.getStatus() == OrderStatus.PENDING && order.getCreatedAt() != null && order.getCreatedAt().isBefore(threshold)) {
                System.out.println("Auto-cancelling expired order #" + order.getId() + " created at " + order.getCreatedAt());
                order.setStatus(OrderStatus.CANCELLED);
                
                // Refund product stock
                if (order.getOrderDetails() != null) {
                    for (OrderDetail detail : order.getOrderDetails()) {
                        Product product = detail.getProduct();
                        if (product != null) {
                            product.setQuantity(product.getQuantity() + detail.getQuantity());
                            productRepository.save(product);
                            System.out.println("Refunded " + detail.getQuantity() + " of product #" + product.getId() + " (" + product.getName() + ")");
                        }
                    }
                }
                orderRepository.save(order);
            }
        }
    }
}
