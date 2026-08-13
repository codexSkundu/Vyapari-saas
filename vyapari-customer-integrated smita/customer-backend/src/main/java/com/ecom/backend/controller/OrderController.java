package com.ecom.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecom.backend.entity.Order;
import com.ecom.backend.entity.OrderItem;
import com.ecom.backend.service.OrderService;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // Get all orders of a customer
    @GetMapping("/customer/{customerId}")
    public List<Order> getCustomerOrders(
            @PathVariable Long customerId) {

        return orderService.getCustomerOrders(customerId);
    }

    // Get items inside an order
    @GetMapping("/{orderId}/items")
    public List<OrderItem> getOrderItems(
            @PathVariable Long orderId) {

        return orderService.getOrderItems(orderId);
    }

    // Place order from customer's cart
    @PostMapping("/customer/{customerId}")
    public Order placeOrder(
            @PathVariable Long customerId) {

        return orderService.placeOrder(customerId);
    }

    // Cancel order
    @PutMapping("/{orderId}/cancel")
    public Order cancelOrder(
            @PathVariable Long orderId) {

        return orderService.cancelOrder(orderId);
    }
}