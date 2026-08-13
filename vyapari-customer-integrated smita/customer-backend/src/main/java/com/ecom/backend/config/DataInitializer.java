package com.ecom.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.ecom.backend.entity.Item;
import com.ecom.backend.repository.ItemRepository;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner loadData(ItemRepository itemRepository) {

        return args -> {

            if (itemRepository.count() == 0) {

                itemRepository.save(
                    new Item("Tomatoes", 42.00, 12, "tomatoes")
                );

                itemRepository.save(
                    new Item("Leafy greens", 56.00, 8, "leafy-greens")
                );

                itemRepository.save(
                    new Item("Carrots", 28.00, 14, "carrots")
                );

                itemRepository.save(
                    new Item("Onions", 35.00, 10, "onions")
                );
            }
        };
    }
}