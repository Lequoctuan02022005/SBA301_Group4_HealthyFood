package backend.Controller;

import backend.Repository.OrderRepository;
import backend.model.Order;
import backend.model.enums.OrderStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/orders")
public class OrderController {
    @Autowired
    private OrderRepository repo;

    @GetMapping("")
    public List<Order> getAll(){ return repo.findAll();}

    @GetMapping("/{id}")
    public ResponseEntity<Order> getById(@PathVariable long id){
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("")
    public ResponseEntity<Order> create(@RequestBody Order order){
         try{
             repo.save(order);
             return ResponseEntity.ok().build();
         }
         catch (Exception ex){
             return ResponseEntity.internalServerError().build();
         }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@PathVariable long id){
        Optional<Order> optional = repo.findById(id);

        if(optional.isEmpty()) return ResponseEntity.notFound().build();

        Order order = optional.get();
        if(order.getStatus()!= OrderStatus.PENDING) return ResponseEntity.badRequest().build();
        //Cancel
        order.setStatus(OrderStatus.CANCELLED);
        repo.save(order);
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

}
