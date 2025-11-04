package com.example.webpj.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Level {
    private Long id;
    private String name;           // 关卡名称
    private String type;           // 关卡类型：ADDITION, PARENTHESES, BINARY_ADDITION, PALINDROME
    private String description;    // 关卡描述
    private String modeType;       // 所属模式
    private Integer difficulty;    // 难度等级
    private String initialState;   // 初始状态
    private String targetState;    // 目标状态
    private String hints;          // 提示信息
    private String solution;       // 标准解答
    private Integer orderNum;      // 关卡顺序
    private Boolean isLocked;      // 是否锁定
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
} 