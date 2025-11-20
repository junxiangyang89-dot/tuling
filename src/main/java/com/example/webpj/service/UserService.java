package com.example.webpj.service;

import com.example.webpj.entity.User;

import java.util.List;

public interface UserService {
    User findByUsername(String username);
    User findByEmail(String email);
    void register(User user);
    void resetPassword(String username, String newPassword);

    // 管理员操作
    List<User> listUsers();
    User getUserById(Long id);
    void updateUserRole(Long id, String role);
}
