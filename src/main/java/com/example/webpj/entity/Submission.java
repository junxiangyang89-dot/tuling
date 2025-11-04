package com.example.webpj.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Submission {
    private Long id;
    private Long userId;          // 用户ID
    private Long levelId;         // 关卡ID
    private String solution;      // 提交的解答
    private Boolean isCorrect;    // 是否正确
    private String feedback;      // 反馈信息
    private Integer attempts;     // 尝试次数
    private Long timeSpent;       // 耗时（毫秒）
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
} 