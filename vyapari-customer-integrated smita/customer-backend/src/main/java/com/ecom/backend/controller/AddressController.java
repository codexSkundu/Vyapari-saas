package com.ecom.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecom.backend.entity.Address;
import com.ecom.backend.service.AddressService;

@RestController
@RequestMapping("/api/addresses")
@CrossOrigin(origins = "http://localhost:5173")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    // Get all addresses
    @GetMapping
    public List<Address> getAllAddresses() {
        return addressService.getAllAddresses();
    }

    // Get one address
    @GetMapping("/{id}")
    public Address getAddressById(@PathVariable Long id) {

        return addressService.getAddressById(id)
                .orElse(null);
    }

    // Get addresses for a particular customer
    @GetMapping("/customer/{customerId}")
    public List<Address> getAddressesByCustomerId(
            @PathVariable Long customerId) {

        return addressService.getAddressesByCustomerId(customerId);
    }

    // Add new address
    @PostMapping
    public Address addAddress(@RequestBody Address address) {
        return addressService.addAddress(address);
    }

    // Update address
    @PutMapping("/{id}")
    public Address updateAddress(
            @PathVariable Long id,
            @RequestBody Address address) {

        return addressService.updateAddress(id, address);
    }

    // Delete address
    @DeleteMapping("/{id}")
    public void deleteAddress(@PathVariable Long id) {
        addressService.deleteAddress(id);
    }
}