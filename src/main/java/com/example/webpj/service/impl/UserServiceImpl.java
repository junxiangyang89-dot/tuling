package com.example.webpj.service.impl;

import com.example.webpj.entity.User;
import com.example.webpj.mapper.UserMapper;
import com.example.webpj.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User findByUsername(String username) {
        return userMapper.selectByUsername(username);
    }

    @Override
    public User findByEmail(String email) {
        return userMapper.selectByEmail(email);
    }

    @Override
    public void register(User user) {
        // 检查用户名是否已存在
        if (findByUsername(user.getUsername()) != null) {
            throw new RuntimeException("用户名已存在");
        }

        // 检查邮箱是否已存在
        if (findByEmail(user.getEmail()) != null) {
            throw new RuntimeException("邮箱已存在");
        }

        // 加密密码
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // 默认角色为 STUDENT（学生），如果已有其他值则保留
        if (user.getRole() == null || user.getRole().trim().isEmpty()) {
            user.setRole("STUDENT");
        }
        userMapper.insert(user);
    }

    @Override
    @Transactional
    public void resetPassword(String username, String newPassword) {
        User user = userMapper.selectByUsername(username);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        // 对密码进行哈希
        String encoded = passwordEncoder.encode(newPassword);
        user.setPassword(encoded);
        int cnt = userMapper.resetPassword(user);
        if (cnt != 1) {
            throw new RuntimeException("重置密码失败或用户不存在");
        }
    }
}
