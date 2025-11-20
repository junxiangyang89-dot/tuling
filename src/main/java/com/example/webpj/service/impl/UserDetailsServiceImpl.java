package com.example.webpj.service.impl;

import com.example.webpj.entity.User;
import com.example.webpj.mapper.UserMapper;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserMapper userMapper;

    public UserDetailsServiceImpl(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userMapper.selectByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("用户不存在");
        }

        // map role (e.g. STUDENT / TEACHER / ADMIN) to GrantedAuthority with ROLE_ prefix
        List<SimpleGrantedAuthority> authorities = Collections.emptyList();
        if (user.getRole() != null && !user.getRole().trim().isEmpty()) {
            authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().trim()));
        }

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                authorities);
    }
}
