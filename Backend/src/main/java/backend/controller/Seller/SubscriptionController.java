package backend.controller.Seller;

import backend.model.SubscriptionPackage;
import backend.model.User;
import backend.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
@CrossOrigin("*")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping
    public List<SubscriptionPackage> getAllPackages() {
        return subscriptionService.getAllPackages();
    }

    @GetMapping("/{id}")
    public SubscriptionPackage getPackageById(@PathVariable Long id) {
        return subscriptionService.getPackageById(id);
    }

    @PostMapping("/buy")
    public User buySubscription(
            @RequestParam Long userId,
            @RequestParam Long packageId
    ) {
        return subscriptionService.buySubscription(userId, packageId);
    }
}