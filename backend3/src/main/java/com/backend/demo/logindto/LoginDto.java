package com.backend.demo.logindto;

public class LoginDto {
    private String email;
    private String password;

    public LoginDto(String username, String password) {
        super();
        this.email = username;
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public String toString() {
        return "LoginDto [username=" + email + ", password=" + password + "]";
    }

    public LoginDto() {}
}