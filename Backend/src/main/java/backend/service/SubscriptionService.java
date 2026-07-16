package backend.service;

import backend.model.SubscriptionPackage;
import backend.model.User;
import backend.repository.SubscriptionRepository;
import backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    public List<SubscriptionPackage> getAllPackages() {
        return subscriptionRepository.findAll();
    }

    public SubscriptionPackage getPackageById(Long id) {
        return subscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription package not found"));
    }

    public User buySubscription(Long userId, Long packageId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        SubscriptionPackage subscriptionPackage = subscriptionRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Subscription package not found"));

        user.setSubscriptionPackage(subscriptionPackage);

        LocalDateTime now = LocalDateTime.now();

        if (user.getExpireAt() != null && user.getExpireAt().isAfter(now)) {
            user.setExpireAt(
                    user.getExpireAt().plusDays(subscriptionPackage.getDurationDays())
            );
        } else {
            user.setExpireAt(
                    now.plusDays(subscriptionPackage.getDurationDays())
            );
        }

        return userRepository.save(user);
    }
}