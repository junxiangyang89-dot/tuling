package com.example.webpj.controller;

import com.example.webpj.common.Result;
import com.example.webpj.dto.LoginDTO;
import com.example.webpj.dto.RegisterDTO;
import com.example.webpj.dto.ResetPasswordDTO;
import com.example.webpj.entity.User;
import com.example.webpj.service.UserService;
import com.example.webpj.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:8080"}, allowedHeaders = {"Authorization", "Content-Type", "X-User-Name"})
@RequestMapping("/api/auth/")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public Result login(@Validated @RequestBody LoginDTO loginDTO) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginDTO.getUsername(),
                        loginDTO.getPassword()
                )
            );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtUtil.generateToken(loginDTO.getUsername());
        System.out.println("username: "+loginDTO.getUsername()+ "  token: " + token);
        Map<String, String> data = new HashMap<>();
        data.put("token", token);
        // 从数据库中读取用户并返回角色信息，后端为权限校验的最终依据
        try {
            User user = userService.findByUsername(loginDTO.getUsername());
            if (user != null && user.getRole() != null) {
                data.put("role", user.getRole());
            }
        } catch (Exception e) {
            log.warn("获取用户角色信息失败: {}", e.getMessage());
        }
        return Result.success(data);
        } catch (BadCredentialsException e) {
//        logger.error("登录失败: 用户名或密码错误", e);
            return Result.error("用户名或密码错误");
        } catch (Exception e) {
//        logger.error("登录处理异常", e);
            return Result.error("登录处理失败: " + e.getMessage());
        }
    }
    @PostMapping("/register")
    public Result register(@Validated @RequestBody RegisterDTO registerDTO) {
        try {
            User user = new User();
            user.setUsername(registerDTO.getUsername());
            user.setPassword(registerDTO.getPassword());
            user.setEmail(registerDTO.getEmail());

            userService.register(user);
            return Result.success("注册成功");
        } catch (RuntimeException e) {
            // 捕获业务异常（比如用户名重复）
            return Result.error(e.getMessage());
        } catch (Exception e) {
            // 捕获其他异常
            return Result.error("注册失败: " + e.getMessage());
        }
    }
    @GetMapping("/info")
    public Result getUserInfo() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.findByUsername(username);
        return Result.success(user);
    }
    @PostMapping("/logout")
    public Result logout() {
        return Result.success();
    }

    @PostMapping("/reset-password")
    public Result resetPassword(@Validated @RequestBody ResetPasswordDTO dto) {
        try {
            // 调用业务逻辑
            userService.resetPassword(dto.getUsername(), dto.getNewPassword());
            return Result.success("密码重置成功，请重新登录");
        } catch (RuntimeException e) {
            // 例如用户不存在
            return Result.error(e.getMessage());
        } catch (Exception e) {
            return Result.error("重置密码失败: " + e.getMessage());
        }
    }
}