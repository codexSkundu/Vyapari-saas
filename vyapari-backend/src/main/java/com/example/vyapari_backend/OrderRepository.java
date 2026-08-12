package com.example.vyapari_backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // This allows you to find orders specifically for your Seller ID (1)
    List<Order> findBySellerId(Long sellerId);
}
