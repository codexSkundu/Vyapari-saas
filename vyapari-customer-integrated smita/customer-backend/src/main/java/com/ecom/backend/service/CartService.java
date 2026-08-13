package com.ecom.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ecom.backend.entity.Cart;
import com.ecom.backend.entity.Customer;
import com.ecom.backend.entity.Item;
import com.ecom.backend.repository.CartRepository;
import com.ecom.backend.repository.CustomerRepository;
import com.ecom.backend.repository.ItemRepository;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CustomerRepository customerRepository;
    private final ItemRepository itemRepository;

    public CartService(
            CartRepository cartRepository,
            CustomerRepository customerRepository,
            ItemRepository itemRepository) {

        this.cartRepository = cartRepository;
        this.customerRepository = customerRepository;
        this.itemRepository = itemRepository;
    }

    // Get customer's cart
    public List<Cart> getCart(Long customerId) {

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        return cartRepository.findByCustomer(customer);
    }

    // Add item to cart
    public Cart addToCart(Long customerId, Long itemId, Integer quantity) {

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        if (quantity == null || quantity <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        // Check whether item is already in customer's cart
        Cart existingCart = cartRepository
                .findByCustomerAndItem(customer, item)
                .orElse(null);

        if (existingCart != null) {

            existingCart.setQuantity(
                    existingCart.getQuantity() + quantity
            );

            return cartRepository.save(existingCart);
        }

        Cart cart = new Cart(customer, item, quantity);

        return cartRepository.save(cart);
    }

    // Update quantity
    public Cart updateQuantity(Long cartId, Integer quantity) {

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (quantity == null || quantity <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        cart.setQuantity(quantity);

        return cartRepository.save(cart);
    }

    // Remove one cart item
    public void removeFromCart(Long cartId) {

        if (!cartRepository.existsById(cartId)) {
            throw new RuntimeException("Cart item not found");
        }

        cartRepository.deleteById(cartId);
    }
}