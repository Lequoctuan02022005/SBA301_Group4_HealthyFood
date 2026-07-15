package backend.controller;

import backend.repository.ReviewRepository;
import backend.model.Review;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
public class ReviewController {
    @Autowired
    private ReviewRepository repo;

    @GetMapping("")
    public List<Review> getAll(){
        return repo.findAll();
    }

    @PostMapping("")
    public ResponseEntity<Review> create(@RequestBody Review review){
        try {
            repo.save(review);
            return ResponseEntity.ok().build();
        }
        catch (Exception err){
            return ResponseEntity.internalServerError().build();
        }
    }
}
