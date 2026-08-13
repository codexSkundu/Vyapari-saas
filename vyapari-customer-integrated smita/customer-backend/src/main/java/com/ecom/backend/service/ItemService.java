package com.ecom.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ecom.backend.entity.Item;
import com.ecom.backend.repository.ItemRepository;

@Service
public class ItemService {

    private final ItemRepository itemRepository;

    public ItemService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    public Item getItemById(Long id) {
        return itemRepository.findById(id).orElse(null);
    }

    public Item addItem(Item item) {
        return itemRepository.save(item);
    }

    public Item updateItem(Long id, Item updatedItem) {

        Item existingItem = itemRepository.findById(id).orElse(null);

        if (existingItem == null) {
            return null;
        }

        existingItem.setName(updatedItem.getName());
        existingItem.setPrice(updatedItem.getPrice());
        existingItem.setStock(updatedItem.getStock());
        existingItem.setImageUrl(updatedItem.getImageUrl());

        return itemRepository.save(existingItem);
    }

    public void deleteItem(Long id) {
        itemRepository.deleteById(id);
    }
}