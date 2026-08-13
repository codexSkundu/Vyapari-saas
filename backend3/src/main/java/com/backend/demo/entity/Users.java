package com.backend.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "USER")
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // Default constructor
    public Users() {
    }

    // Constructor
    public Users(String email, String password) {
        this.email = email;
        this.password = password;
    }

    // Get ID
    public Long getId() {
        return id;
    }

    // Set ID
    public void setId(Long id) {
        this.id = id;
    }

    // Get email
    public String getEmail() {
        return email;
    }

    // Set email
    public void setEmail(String email) {
        this.email = email;
    }

    // Get password
    public String getPassword() {
        return password;
    }

    // Set password
    public void setPassword(String password) {
        this.password = password;
    }

    // Get role
    public Role getRole() {
        return role;
    }

    // Set role
    public void setRole(Role role) {
        this.role = role;
    }

    @Override
    public String toString() {
        return "Users [id=" + id
                + ", email=" + email
                + ", password=" + password
                + ", role=" + role + "]";
    }
}