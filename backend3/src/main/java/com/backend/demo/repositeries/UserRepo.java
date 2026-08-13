package com.backend.demo.repositeries;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.demo.entity.Users;

public interface UserRepo extends JpaRepository<Users, Long> {

    Users findByEmail(String email);
}