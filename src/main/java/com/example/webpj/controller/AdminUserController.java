package com.example.webpj.controller;

import com.example.webpj.entity.User;
import com.example.webpj.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public List<User> listUsers() {
        return userService.listUsers();
    }

    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<?> updateRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String role = body.get("role");
        if (role == null || role.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("missing role");
        }
        userService.updateUserRole(id, role);
        return ResponseEntity.ok().build();
    }
}
