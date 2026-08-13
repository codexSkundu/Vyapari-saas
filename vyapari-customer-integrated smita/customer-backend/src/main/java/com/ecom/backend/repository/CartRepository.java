package com.ecom.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecom.backend.entity.Cart;
import com.ecom.backend.entity.Customer;
import com.ecom.backend.entity.Item;

public interface CartRepository extends JpaRepository<Cart, Long> {

    List<Cart> findByCustomer(Customer customer);

    Optional<Cart> findByCustomerAndItem(Customer customer, Item item);

    void deleteByCustomer(Customer customer);
}