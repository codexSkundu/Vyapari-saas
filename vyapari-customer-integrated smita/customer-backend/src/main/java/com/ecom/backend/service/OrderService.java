package com.ecom.backend.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecom.backend.entity.Cart;
import com.ecom.backend.entity.Customer;
import com.ecom.backend.entity.Item;
import com.ecom.backend.entity.Order;
import com.ecom.backend.entity.OrderItem;
import com.ecom.backend.repository.CartRepository;
import com.ecom.backend.repository.CustomerRepository;
import com.ecom.backend.repository.OrderItemRepository;
import com.ecom.backend.repository.OrderRepository;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CustomerRepository customerRepository;
    private final CartRepository cartRepository;

    public OrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            CustomerRepository customerRepository,
            CartRepository cartRepository) {

        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.customerRepository = customerRepository;
        this.cartRepository = cartRepository;
    }

    // Get all orders of a customer
    public List<Order> getCustomerOrders(Long customerId) {

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        return orderRepository.findByCustomer(customer);
    }

    // Get items belonging to an order
    public List<OrderItem> getOrderItems(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        return orderItemRepository.findByOrder(order);
    }

    // Place order using customer's cart
    @Transactional
    public Order placeOrder(Long customerId) {

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        List<Cart> cartItems = cartRepository.findByCustomer(customer);

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;

        // Calculate total amount
        for (Cart cart : cartItems) {

            Item item = cart.getItem();

            BigDecimal itemPrice = BigDecimal.valueOf(item.getPrice());

            BigDecimal itemTotal = itemPrice.multiply(
                    BigDecimal.valueOf(cart.getQuantity())
            );

            totalAmount = totalAmount.add(itemTotal);
        }

        // Create the order
        Order order = new Order(
                customer,
                "PLACED",
                totalAmount
        );

        order = orderRepository.save(order);

        // Create order items
        for (Cart cart : cartItems) {

            Item item = cart.getItem();

            OrderItem orderItem = new OrderItem(
                    order,
                    item,
                    cart.getQuantity(),
                    BigDecimal.valueOf(item.getPrice())
            );

            orderItemRepository.save(orderItem);
        }

        // Empty the cart after successful order
        cartRepository.deleteByCustomer(customer);

        return order;
    }

    // Cancel an order
    @Transactional
    public Order cancelOrder(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus("CANCELLED");

        return orderRepository.save(order);
    }
}