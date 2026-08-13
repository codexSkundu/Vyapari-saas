package com.ecom.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecom.backend.entity.Cart;
import com.ecom.backend.service.CartService;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:5173")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // Get customer's cart
    @GetMapping("/{customerId}")
    public List<Cart> getCart(@PathVariable Long customerId) {

        return cartService.getCart(customerId);
    }

    // Add item to cart
    @PostMapping("/{customerId}/add/{itemId}")
    public Cart addToCart(
            @PathVariable Long customerId,
            @PathVariable Long itemId,
            @RequestParam Integer quantity) {

        return cartService.addToCart(
                customerId,
                itemId,
                quantity
        );
    }

    // Update quantity
    @PutMapping("/{cartId}")
    public Cart updateQuantity(
            @PathVariable Long cartId,
            @RequestParam Integer quantity) {

        return cartService.updateQuantity(
                cartId,
                quantity
        );
    }

    // Remove item
    @DeleteMapping("/{cartId}")
    public void removeFromCart(
            @PathVariable Long cartId) {

        cartService.removeFromCart(cartId);
    }
}