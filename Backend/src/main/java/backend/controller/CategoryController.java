package backend.controller;

import backend.repository.CategoryRepository;
import backend.model.Category;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/categories", "/api/categories"})
public class CategoryController {
    @Autowired
    private CategoryRepository repo;

    @GetMapping("")
    public List<Category> getAll(){
        return repo.findAll();
    }

}
