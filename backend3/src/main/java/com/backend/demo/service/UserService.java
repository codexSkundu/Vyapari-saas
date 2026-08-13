package com.backend.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.backend.demo.entity.Role;
import com.backend.demo.entity.Users;
import com.backend.demo.repositeries.UserRepo;

@Service
public class UserService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Customer Registration
    public Users registerCustomer(Users user) {

        // Check if email already exists
        Users existingUser = userRepo.findByEmail(user.getEmail());

        if (existingUser != null) {
            return null;
        }

        // Set role as CUSTOMER
        user.setRole(Role.CUSTOMER);

        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        return userRepo.save(user);
    }

    // Seller Registration
    public Users registerSeller(Users user) {

        // Check if email already exists
        Users existingUser = userRepo.findByEmail(user.getEmail());

        if (existingUser != null) {
            return null;
        }

        // Set role as SELLER
        user.setRole(Role.SELLER);

        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        return userRepo.save(user);
    }

    // Customer Login
    public Users customerLogin(String email, String password) {

        Users user = userRepo.findByEmail(email);

        if (user != null
                && user.getRole() == Role.CUSTOMER
                && passwordEncoder.matches(
                        password,
                        user.getPassword())) {

            return user;
        }

        return null;
    }

    // Seller Login
    public Users sellerLogin(String email, String password) {

        Users user = userRepo.findByEmail(email);

        if (user != null
                && user.getRole() == Role.SELLER
                && passwordEncoder.matches(
                        password,
                        user.getPassword())) {

            return user;
        }

        return null;
    }
}