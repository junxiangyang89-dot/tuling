package com.example.webpj;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import lombok.extern.slf4j.Slf4j;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Properties;

import java.io.IOException;
@Slf4j
@SpringBootApplication
public class WebPjApplication {

    public static void main(String[] args) {
        loadEnv(); // 在Spring Boot启动前手动加载.env
        SpringApplication.run(WebPjApplication.class, args);
        log.info("server started");
    }






    private static void loadEnv() {
        try {
            Properties properties = new Properties();
            properties.load(Files.newBufferedReader(Paths.get(".env")));
            properties.forEach((key, value) -> {
                if (System.getenv((String) key) == null) {
                    System.setProperty((String) key, (String) value);
                }
            });
            log.info(".env file loaded successfully");
        } catch (IOException e) {
            log.warn("No .env file found or failed to load");
        }
    }

}
