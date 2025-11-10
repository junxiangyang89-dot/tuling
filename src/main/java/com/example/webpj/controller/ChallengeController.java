package com.example.webpj.controller;

import com.example.webpj.common.Result;
import com.example.webpj.entity.ChallengeQuestion;
import com.example.webpj.entity.User;
import com.example.webpj.service.ChallengeQuestionService;
import com.example.webpj.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:8080"}, allowedHeaders = {"Authorization", "Content-Type", "X-User-Name"})
@RequestMapping("/api/challenge")
@RequiredArgsConstructor
public class ChallengeController {
    private final ChallengeQuestionService questionService;
    private final UserService userService;

    // 学生/游客获取已审批通过的题目
    @GetMapping("/questions")
    public Result listApproved() {
        List<ChallengeQuestion> list = questionService.getQuestionsByStatus("APPROVED");
        return Result.success(list);
    }

    // 教师端获取所有题目（含 PENDING），用于审阅
    @GetMapping("/admin/questions")
    public Result listAllForAdmin() {
        String username = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getName()
                : null;
        if (username == null) {
            return Result.error("未认证的用户");
        }
        User user = userService.findByUsername(username);
        if (user == null) return Result.error("用户不存在");
        if (!"TEACHER".equalsIgnoreCase(user.getRole())) {
            return Result.error("权限不足：仅教师可查看所有题目");
        }
        List<ChallengeQuestion> list = questionService.getAllQuestions();
        return Result.success(list);
    }

    // 学生提交题目，进入 PENDING 状态，等待教师审核
    @PostMapping("/submit")
    public Result submitQuestion(@RequestBody ChallengeQuestion q) {
        String username = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getName()
                : null;
        if (username != null) {
            User user = userService.findByUsername(username);
            if (user != null) {
                q.setCreatorUserId(user.getId());
                q.setCreatorUsername(user.getUsername());
            }
        }
        Long id = questionService.createQuestion(q);
        Map<String, Object> data = new HashMap<>();
        data.put("id", id);
        return Result.success(data);
    }

    // 教师审批通过
    @PutMapping("/{id}/approve")
    public Result approveQuestion(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getName()
                : null;
        if (username == null) return Result.error("未认证的用户");
        User user = userService.findByUsername(username);
        if (user == null) return Result.error("用户不存在");
        if (!"TEACHER".equalsIgnoreCase(user.getRole())) {
            return Result.error("权限不足：仅教师可审批题目");
        }
        questionService.updateStatus(id, "APPROVED");
        return Result.success("已通过");
    }

    // 教师删除题目
    @DeleteMapping("/{id}")
    public Result deleteQuestion(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getName()
                : null;
        if (username == null) return Result.error("未认证的用户");
        User user = userService.findByUsername(username);
        if (user == null) return Result.error("用户不存在");
        if (!"TEACHER".equalsIgnoreCase(user.getRole())) {
            return Result.error("权限不足：仅教师可删除题目");
        }
        questionService.deleteQuestion(id);
        return Result.success("删除成功");
    }
}
