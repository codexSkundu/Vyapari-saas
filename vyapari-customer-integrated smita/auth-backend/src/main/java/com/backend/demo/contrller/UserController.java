package com.backend.demo.contrller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.demo.entity.Users;
import com.backend.demo.logindto.LoginDto;
import com.backend.demo.service.UserService;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // Customer Registration
 // Customer Registration
    @PostMapping("/register/customer")
    public ResponseEntity<?> registerCustomer(@RequestBody Users user) {

        Users registeredUser = userService.registerCustomer(user);

        if (registeredUser == null) {
            return ResponseEntity.badRequest()
                    .body("Email already exists");
        }

        return ResponseEntity.ok(registeredUser);
    }
 // Seller Registration
    @PostMapping("/register/seller")
    public ResponseEntity<?> registerSeller(@RequestBody Users user) {

        Users registeredUser = userService.registerSeller(user);

        if (registeredUser == null) {
            return ResponseEntity.badRequest()
                    .body("Email already exists");
        }

        return ResponseEntity.ok(registeredUser);
    }
    // Customer Login
    @PostMapping("/customer/login")
    public ResponseEntity<?> customerLogin(@RequestBody LoginDto loginDto) {

        Users user = userService.customerLogin(
                loginDto.getEmail(),
                loginDto.getPassword()
        );

        if (user == null) {
            return ResponseEntity.badRequest()
                    .body("Invalid customer email or password");
        }

        return ResponseEntity.ok(user);
    }

    // Seller Login
    @PostMapping("/seller/login")
    public ResponseEntity<?> sellerLogin(@RequestBody LoginDto loginDto) {

        Users user = userService.sellerLogin(
                loginDto.getEmail(),
                loginDto.getPassword()
        );

        if (user == null) {
            return ResponseEntity.badRequest()
                    .body("Invalid seller email or password");
        }

        return ResponseEntity.ok(user);
    }
}