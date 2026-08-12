package com.example.vyapari_backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*") // Critical: Allows your React app to talk to this backend
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private DeliveryPersonnelRepository deliveryPersonnelRepository;


    // 1. Get ALL orders (Admin View)
    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // 2. Get orders just for YOU (Seller View)
    // Example usage: GET /api/orders/seller/1
    @GetMapping("/seller/{sellerId}")
    public List<Order> getOrdersBySeller(@PathVariable Long sellerId) {
        return orderRepository.findBySellerId(sellerId);
    }

    // 3. Update driver assignment string column safely from dropdown choices
    // @PutMapping("/{orderId}/reassign-driver")
    // public org.springframework.http.ResponseEntity<?> reassignDriverName(
    //         @PathVariable Long orderId,
    //         @RequestParam(name = "driverName") String driverName) {
        
    //     return orderRepository.findById(orderId).map(order -> {
    //         // Overwrites the explicit field value mapped to your assigned_to_name DB column
    //         order.setAssignedToName(driverName); 
            
    //         // Automatically switch order state status into transit progression safely
    //         if ("PENDING".equalsIgnoreCase(order.getStatus())) {
    //             order.setStatus("IN_TRANSIT");
    //         }
            
    //         Order savedOrder = orderRepository.save(order);
    //         return org.springframework.http.ResponseEntity.ok(savedOrder);
    //     }).orElse(org.springframework.http.ResponseEntity.notFound().build());
    // }

        // 3. Update driver assignment string column safely from dropdown choices
    @PutMapping("/{orderId}/reassign-driver")
    @org.springframework.transaction.annotation.Transactional
    public org.springframework.http.ResponseEntity<?> reassignDriverName(
            @PathVariable Long orderId,
            @RequestParam(name = "driverName") String driverName) {
        
        return orderRepository.findById(orderId).map(order -> {
            String oldDriverName = order.getAssignedToName();
            String targetOrderIdStr = String.valueOf(orderId);

            // A. Clean up the previous driver if they had this order
            if (oldDriverName != null && !oldDriverName.trim().isEmpty()) {
                deliveryPersonnelRepository.findByOrderId(targetOrderIdStr).ifPresent(oldDriver -> {
                    oldDriver.setOrderId(null);
                    oldDriver.setStatus("AVAILABLE");
                    deliveryPersonnelRepository.save(oldDriver);
                });
            }

            // B. Update the Orders table database fields
            order.setAssignedToName(driverName);
            if ("PENDING".equalsIgnoreCase(order.getStatus())) {
                order.setStatus("IN_TRANSIT");
            }
            orderRepository.save(order);

            // C. Find the new driver by name, link the order, and make them BUSY
            deliveryPersonnelRepository.findByName(driverName).ifPresent(newDriver -> {
                String currentOrderIdStr = newDriver.getOrderId();
                if (currentOrderIdStr != null && !currentOrderIdStr.isEmpty()) {
                    orderRepository.findById(Long.parseLong(currentOrderIdStr)).ifPresent(prevOrder -> {
                        prevOrder.setAssignedToName(null);
                        prevOrder.setStatus("PENDING");
                        orderRepository.save(prevOrder);
                    });
                }
                newDriver.setOrderId(targetOrderIdStr);
                newDriver.setStatus("BUSY");
                deliveryPersonnelRepository.save(newDriver);
            });

            return org.springframework.http.ResponseEntity.ok(order);
        }).orElse(org.springframework.http.ResponseEntity.notFound().build());
    }


}
