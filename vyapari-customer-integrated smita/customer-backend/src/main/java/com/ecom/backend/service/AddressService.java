package com.ecom.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.ecom.backend.entity.Address;
import com.ecom.backend.repository.AddressRepository;

@Service
public class AddressService {

    private final AddressRepository addressRepository;

    public AddressService(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    // Get all addresses
    public List<Address> getAllAddresses() {
        return addressRepository.findAll();
    }

    // Get one address by ID
    public Optional<Address> getAddressById(Long id) {
        return addressRepository.findById(id);
    }

    // Get addresses of a particular customer
    public List<Address> getAddressesByCustomerId(Long customerId) {
        return addressRepository.findByCustomerId(customerId);
    }

    // Add new address
    public Address addAddress(Address address) {
        return addressRepository.save(address);
    }

    // Update existing address
    public Address updateAddress(Long id, Address updatedAddress) {

        Optional<Address> existingAddress =
                addressRepository.findById(id);

        if (existingAddress.isEmpty()) {
            return null;
        }

        Address address = existingAddress.get();

        address.setCustomerId(updatedAddress.getCustomerId());
        address.setHouseNo(updatedAddress.getHouseNo());
        address.setStreet(updatedAddress.getStreet());
        address.setCity(updatedAddress.getCity());
        address.setState(updatedAddress.getState());
        address.setPincode(updatedAddress.getPincode());
        address.setAddressType(updatedAddress.getAddressType());

        return addressRepository.save(address);
    }

    // Delete address
    public void deleteAddress(Long id) {
        addressRepository.deleteById(id);
    }
}