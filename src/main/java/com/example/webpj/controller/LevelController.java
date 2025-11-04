package com.example.webpj.controller;

import com.example.webpj.common.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:8080"}, allowedHeaders = {"Authorization", "Content-Type", "X-User-Name"})
@RequestMapping("/api/level")
@RequiredArgsConstructor
public class LevelController {
    
    @GetMapping("/{mode}/all")
    public Result getAllLevels(@PathVariable String mode) {
        // 获取指定模式下的所有关卡
        return Result.success("获取" + mode + "模式下的所有关卡");
    }

    @GetMapping("/{mode}/{levelId}")
    public Result getLevelDetails(@PathVariable String mode, @PathVariable Long levelId) {
        // 获取特定关卡的详细信息
        return Result.success("获取" + mode + "模式下的第" + levelId + "关详情");
    }

    @GetMapping("/types")
    public Result getLevelTypes() {
        // 返回所有关卡类型：加法、括号匹配、二进制加法、回文判断等
        return Result.success("获取所有关卡类型");
    }

    @GetMapping("/type/{typeId}")
    public Result getLevelsByType(@PathVariable String typeId) {
        // 根据类型获取关卡
        return Result.success("获取类型为" + typeId + "的所有关卡");
    }

    @PostMapping("/{levelId}/start")
    public Result startLevel(@PathVariable Long levelId) {
        // 开始某个关卡
        return Result.success("开始第" + levelId + "关");
    }

    @PostMapping("/{levelId}/complete")
    public Result completeLevel(@PathVariable Long levelId) {
        // 完成某个关卡
        return Result.success("完成第" + levelId + "关");
    }
} 