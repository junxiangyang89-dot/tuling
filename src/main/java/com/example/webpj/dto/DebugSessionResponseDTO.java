package com.example.webpj.dto;

import lombok.Data;

@Data
public class DebugSessionResponseDTO {
    private String sessionId;

    public DebugSessionResponseDTO(String sessionId) {
        this.sessionId = sessionId;
    }
}
