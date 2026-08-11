package com.example.vyapari_backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/delivery-personnel")
@CrossOrigin(origins = "http://localhost:5173")
public class DeliveryPersonnelController {

    @Autowired
    private DeliveryPersonnelRepository deliveryPersonnelRepository;

    @GetMapping
    public List<DeliveryPersonnel> getAllPersonnel() {
        return deliveryPersonnelRepository.findAll();
    }

    @PostMapping
    public DeliveryPersonnel addPersonnel(@RequestBody DeliveryPersonnel personnel) {
        // If the frontend leaves orderId empty, make it null for MySQL safety
        if (personnel.getOrderId() == null || personnel.getOrderId().trim().isEmpty()) {
            personnel.setOrderId(null);
        }
        // Force status to default to AVAILABLE if none is specified
        if (personnel.getStatus() == null || personnel.getStatus().isEmpty()) {
            personnel.setStatus("AVAILABLE");
        }
        return deliveryPersonnelRepository.save(personnel);
    }


    // This handles the status toggle when clicked on the frontend dashboard
    @PutMapping("/{id}/status")
    public ResponseEntity<DeliveryPersonnel> updateStatus(
            @PathVariable Long id, 
            @RequestBody java.util.Map<String, String> body) {
        
        return deliveryPersonnelRepository.findById(id).map(personnel -> {
            // Safe check to see if the key exists in the body map
            String newStatus = "AVAILABLE";
            if (body != null && body.containsKey("status")) {
                newStatus = body.get("status");
            } else if (body != null && body.containsKey("status ")) { // Handles accidental white space tracking
                newStatus = body.get("status ");
            }
        
         personnel.setStatus(newStatus.toUpperCase().trim());
            DeliveryPersonnel updated = deliveryPersonnelRepository.save(personnel);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }


// This endpoint runs when you link an Order ID to an existing driver later
    @PutMapping("/{id}/reassign")
    public ResponseEntity<DeliveryPersonnel> assignOrder(
            @PathVariable Long id, 
            @RequestBody java.util.Map<String, String> body) {
                
        
        return deliveryPersonnelRepository.findById(id).map(personnel -> {
            String targetOrderId = body != null ? body.get("orderId") : null;
            
            if (targetOrderId != null && !targetOrderId.trim().isEmpty()) {
                personnel.setOrderId(targetOrderId.trim());
                personnel.setStatus("BUSY"); // Automatically switch status to busy when assigned a delivery job
            } else {
                personnel.setOrderId(null);
                personnel.setStatus("AVAILABLE"); // Frees the driver if order ID is wiped clear
            }
            
            DeliveryPersonnel updated = deliveryPersonnelRepository.save(personnel);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePersonnel(@PathVariable Long id) {
        if (deliveryPersonnelRepository.existsById(id)) {
            deliveryPersonnelRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
