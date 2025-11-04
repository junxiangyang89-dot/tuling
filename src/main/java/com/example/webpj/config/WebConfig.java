package com.example.webpj.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(
                    "http://localhost:4200", "http://localhost:8080", 
                    "http://localhost:*", "http://127.0.0.1:*",
                    "http://54.163.231.19:*", "http://10.0.142.1:*",
                    "http://54.163.231.19", "http://10.0.142.1"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("Authorization", "Content-Type", "Accept", "X-Requested-With", "X-User-Name")
                .allowCredentials(true)
                .maxAge(3600);
    }
} 