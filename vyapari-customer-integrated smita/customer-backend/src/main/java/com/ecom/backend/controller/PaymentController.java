package com.ecom.backend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecom.backend.entity.Payment;
import com.ecom.backend.service.PaymentService;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // Create COD payment for an order
    @PostMapping("/cod/{orderId}")
    public Payment createCODPayment(@PathVariable Long orderId) {

        return paymentService.createCODPayment(orderId);
    }

    // Get payment details for an order
    @GetMapping("/order/{orderId}")
    public Payment getPayment(@PathVariable Long orderId) {

        return paymentService.getPayment(orderId);
    }
}