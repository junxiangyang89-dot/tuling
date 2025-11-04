package com.example.webpj.dto;

import lombok.Data;

@Data
public class ChatMessageRequestDTO {
    private String role;      // 改名为 role，百度接口要求
    private String content;

    public String getRole() {
        return role;
    }

    public String getContent() {
        return content;
    }
}
