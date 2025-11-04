package com.example.webpj.mapper;

import com.example.webpj.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
    User selectByUsername(@Param("username") String username);
    User selectByEmail(@Param("email") String email);
    int insert(User user);
    int resetPassword(User user);
}
