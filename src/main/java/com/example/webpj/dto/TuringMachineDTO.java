package com.example.webpj.dto;
import com.example.webpj.entity.Transition;
import lombok.Data;

import java.util.List;

@Data
public class TuringMachineDTO {
    private String name;          // 图灵机名称
    private String description;   // 图灵机描述
    private String tape;          // 纸带内容
    private Integer headPosition; // 读写头位置
    private String currentState;  // 当前状态
    private String configuration; // 图灵机配置
    private Boolean isCompleted;  // 是否完成
    private String executionLog; // 执行日志
}
