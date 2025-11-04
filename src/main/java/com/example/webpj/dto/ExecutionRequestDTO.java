package com.example.webpj.dto;
import lombok.Data;

@Data
public class ExecutionRequestDTO {
    private String machineId;
    private String input;
    private boolean stepByStep;
}
