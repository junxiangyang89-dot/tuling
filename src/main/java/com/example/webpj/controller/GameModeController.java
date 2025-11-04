package com.example.webpj.controller;

import com.example.webpj.common.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:8080"}, allowedHeaders = {"Authorization", "Content-Type", "X-User-Name"})
@RequestMapping("/api/mode")
@RequiredArgsConstructor
public class GameModeController {
    
    @GetMapping("/free")
    public Result getFreeMode() {
        // 返回自由模式的配置和数据
        return Result.success("进入自由模式");
    }

    @GetMapping("/learn")
    public Result getLearnMode() {
        // 返回学习模式的配置和数据
        return Result.success("进入学习模式");
    }

    @GetMapping("/challenge")
    public Result getChallengeMode() {
        // 返回挑战模式的配置和数据
        return Result.success("进入挑战模式");
    }

    @GetMapping("/current")
    public Result getCurrentMode() {
        // 获取当前模式的状态
        return Result.success("获取当前模式");
    }

    @PostMapping("/switch/{mode}")
    public Result switchMode(@PathVariable String mode) {
        // 切换模式的逻辑
        return Result.success("切换到" + mode + "模式");
    }
} 