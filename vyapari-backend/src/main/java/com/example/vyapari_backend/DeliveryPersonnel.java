package com.example.vyapari_backend;

import jakarta.persistence.*;

@Entity
@Table(name = "delivery_personnel")
public class DeliveryPersonnel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String bikeId;
    private String phoneNumber;
    private String aadhaarNumber;
    
    @Column(nullable = true)
    private String orderId; // Keeps track of an optional order, can be null

    private String status = "AVAILABLE"; // Tracks live availability status

    @Column(columnDefinition = "LONGTEXT")
    private String photoUrl;

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBikeId() { return bikeId; }
    public void setBikeId(String bikeId) { this.bikeId = bikeId; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getAadhaarNumber() { return aadhaarNumber; }
    public void setAadhaarNumber(String aadhaarNumber) { this.aadhaarNumber = aadhaarNumber; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
}
