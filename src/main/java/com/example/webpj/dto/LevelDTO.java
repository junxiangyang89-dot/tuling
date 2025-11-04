package com.example.webpj.dto;

import lombok.Data;

@Data
public class LevelDTO {
    private Long id;
    private String name;
    private String type;
    private String description;
    private String modeType;
    private Integer difficulty;
    private String initialState;
    private String targetState;
    private Boolean isLocked;
    private Integer orderNum;
} 