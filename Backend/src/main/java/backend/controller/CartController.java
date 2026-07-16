package backend.controller;

import backend.dto.AddCartDto;
import backend.repository.CartRepository;
import backend.model.Cart;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/carts")
public class CartController {
    @Autowired
    private CartRepository repo;

    @GetMapping("")
    public List<Cart> getAll(){
        return repo.findAll();
    }

    @PostMapping("")
    public Cart create(@RequestBody AddCartDto dto){
        return repo.save(dto.toCart());
    }

    @PostMapping("/{id}")
    public ResponseEntity<Cart> update(@PathVariable long id, @RequestBody Cart cart){
        return repo.findById(id).map(c -> {
            c.setQuantity(cart.getQuantity());
            return ResponseEntity.ok(repo.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable long id){
        try {
            repo.deleteById(id);
            return ResponseEntity.ok().build();
        }
        catch (Exception err){
            return ResponseEntity.internalServerError().build();
        }
    }

}
