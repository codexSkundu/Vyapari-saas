package com.ecom.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecom.backend.entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
}