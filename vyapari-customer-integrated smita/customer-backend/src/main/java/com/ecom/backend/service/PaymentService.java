package com.ecom.backend.service;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecom.backend.entity.Order;
import com.ecom.backend.entity.Payment;
import com.ecom.backend.repository.OrderRepository;
import com.ecom.backend.repository.PaymentRepository;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    public PaymentService(
            PaymentRepository paymentRepository,
            OrderRepository orderRepository) {

        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
    }

    // Get payment for an order
    public Payment getPayment(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        return paymentRepository.findByOrder(order)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    // Create COD payment
    @Transactional
    public Payment createCODPayment(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (paymentRepository.findByOrder(order).isPresent()) {
            throw new RuntimeException(
                    "Payment already exists for this order"
            );
        }

        BigDecimal amount = order.getTotalAmount();

        Payment payment = new Payment(
                order,
                amount
        );

        return paymentRepository.save(payment);
    }

    // Update payment status
    @Transactional
    public Payment updatePaymentStatus(
            Long paymentId,
            String status) {

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setPaymentStatus(status);

        return paymentRepository.save(payment);
    }
}