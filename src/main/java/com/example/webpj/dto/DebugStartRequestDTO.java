package com.example.webpj.dto;

import javax.validation.constraints.NotBlank;

import lombok.Data;

@Data
public class DebugStartRequestDTO {
    @NotBlank
    private String machineId;

    @NotBlank
    private String input;

    private String programText; // 可选的自定义程序
}
