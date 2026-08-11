package com.example.vyapari_backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "http://localhost:5173") // Connects to your Vite React app
public class ItemController {

    @Autowired
    private ItemRepository itemRepository;

    @GetMapping
    public List<Item> getAllItems() {
        return itemRepository.findAll(); // Fetches items using Hibernate
    }

    @PostMapping
    public Item addItem(@RequestBody Item item) {
        return itemRepository.save(item); // Saves items to MySQL using Hibernate
    }

     @DeleteMapping("/{id}")
    public void deleteItem(@PathVariable Long id) {
        itemRepository.deleteById(id); // Hibernate removes it from MySQL by ID
    }

    @PutMapping("/{id}")
    public ResponseEntity<Item> updateItem(@PathVariable Long id, @RequestBody Item itemDetails) {
        return itemRepository.findById(id).map(item -> {
            // Only update fields that the frontend actually sends
            if (itemDetails.getPrice() != null) {
                item.setPrice(itemDetails.getPrice());
            }
            if (itemDetails.getName() != null) {
                item.setName(itemDetails.getName());
            }
            if (itemDetails.getStock() != null) {
                item.setStock(itemDetails.getStock());
            }
            if (itemDetails.getCategory() != null) {
                item.setCategory(itemDetails.getCategory());
            }
            if (itemDetails.getImageUrl() != null) {
                item.setImageUrl(itemDetails.getImageUrl());
            }
            
            Item updatedItem = itemRepository.save(item);
            return ResponseEntity.ok(updatedItem);
        }).orElse(ResponseEntity.notFound().build());
    }


// FOR Fetches your Potato, Mango, and Parwal rows directly from MySQL
    @GetMapping("/all")
    public ResponseEntity<List<Item>> getAllItemsForCustomers() {
    List<Item> items = itemRepository.findAll();
    return ResponseEntity.ok(items);
}




}
