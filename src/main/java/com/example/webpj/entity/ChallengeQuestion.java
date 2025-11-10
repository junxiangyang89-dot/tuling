package com.example.webpj.entity;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 挑战题目实体：用于存储学生提交和教师审核通过后的题目
 */
@Data
public class ChallengeQuestion {
    private Long id;
    private String title;
    private String description;
    // 题目相关的测试用例或结构（以 JSON 字符串保存，前端负责序列化/反序列化）
    private String testcaseJson;
    private Long creatorUserId; // 提交者用户ID（可为空）
    private String creatorUsername; // 提交者用户名（冗余字段，便于展示）
    private String status; // PENDING / APPROVED / REJECTED
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
