package com.example.webpj.mapper;

import com.example.webpj.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface UserMapper {
    User selectByUsername(@Param("username") String username);
    User selectByEmail(@Param("email") String email);
    int insert(User user);
    int resetPassword(User user);

    List<User> selectAll();
    User selectById(@Param("id") Long id);
    int updateRole(@Param("id") Long id, @Param("role") String role);
}
