package com.example.webpj.service;
import com.example.webpj.entity.User;

public interface UserService {
    User findByUsername(String username);
    User findByEmail(String email);
    void register(User user);
    void resetPassword(String username, String newPassword);
}
