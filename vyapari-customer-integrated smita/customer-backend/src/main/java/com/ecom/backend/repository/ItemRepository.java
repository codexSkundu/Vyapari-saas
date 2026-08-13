package com.ecom.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecom.backend.entity.Item;

public interface ItemRepository extends JpaRepository<Item, Long> {

}