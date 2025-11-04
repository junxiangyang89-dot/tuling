package com.example.webpj.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class AiConfig {
    @Value("${ai.endpoint}")
    private String endpoint;

    @Value("${ai.api-key}")
    private String apiKey;

    @Bean
    public WebClient aiWebClient() {
        return WebClient.builder()
                .baseUrl(endpoint)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();
    }
}
