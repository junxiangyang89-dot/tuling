package com.example.webpj.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class GameMode {
    private Long id;
    private String modeName;        // 模式名称：FREE, LEARN, CHALLENGE
    private String description;     // 模式描述
    private Boolean isActive;       // 是否激活
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
} 