package com.example.webpj.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {
    public enum MessageType {
        CHAT, JOIN, LEAVE, SYSTEM
    }

    private MessageType type;
    private Long machineId; // 关联的图灵机ID
    private String sender;
    private String content;
    private LocalDateTime timestamp;
}
