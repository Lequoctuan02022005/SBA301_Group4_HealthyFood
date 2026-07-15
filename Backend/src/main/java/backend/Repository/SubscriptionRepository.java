package backend.Repository;

import backend.model.SubscriptionPackage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionRepository extends JpaRepository<SubscriptionPackage, Long> {

}