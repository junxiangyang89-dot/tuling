package com.example.webpj.controller;

import com.example.webpj.common.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:8080"}, allowedHeaders = {"Authorization", "Content-Type", "X-User-Name"})
@RequestMapping("/api/validation")
@RequiredArgsConstructor
public class ValidationController {
    
    @PostMapping("/check/{levelId}")
    public Result validateResult(@PathVariable Long levelId, @RequestBody String result) {
        // 验证用户提交的结果是否正确
        return Result.success("验证结果");
    }

    @GetMapping("/solution/{levelId}")
    public Result getSolution(@PathVariable Long levelId) {
        // 获取标准解答（可能需要权限控制）
        return Result.success("获取标准解答");
    }

    @PostMapping("/hint/{levelId}")
    public Result getHint(@PathVariable Long levelId) {
        // 获取提示信息
        return Result.success("获取提示");
    }

    @PostMapping("/submit/{levelId}")
    public Result submitSolution(@PathVariable Long levelId, @RequestBody String solution) {
        // 提交解答
        return Result.success("提交解答");
    }

    @GetMapping("/history/{levelId}")
    public Result getSubmissionHistory(@PathVariable Long levelId) {
        // 获取提交历史
        return Result.success("获取提交历史");
    }

    @GetMapping("/statistics/{levelId}")
    public Result getLevelStatistics(@PathVariable Long levelId) {
        // 获取关卡统计信息
        return Result.success("获取统计信息");
    }
} 