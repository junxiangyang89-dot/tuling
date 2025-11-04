package com.example.webpj.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TuringMachine {
    private Long id;
    private Long levelId;         // 关联的关卡ID
    private Long userId;          // 创建用户ID
    private String name;          // 图灵机名称
    private String description;   // 图灵机描述
    private String tape;          // 当前纸带状态
    private Integer headPosition; // 读写头位置
    private String currentState;  // 当前状态
    private String configuration; // 图灵机配置（包含状态转移规则）
    private Boolean isCompleted;  // 是否完成
    private String executionLog; // 执行日志
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
} 