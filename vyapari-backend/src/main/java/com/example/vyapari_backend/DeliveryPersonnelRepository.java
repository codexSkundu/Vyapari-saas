package com.example.vyapari_backend;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeliveryPersonnelRepository extends JpaRepository<DeliveryPersonnel, Long> {
    // This gives you save() and findAll() operations automatically
    Optional<DeliveryPersonnel> findByName(String name);
    Optional<DeliveryPersonnel> findByOrderId(String orderId);
}
