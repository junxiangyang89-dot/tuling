package com.example.webpj.dto;

import lombok.Data;

@Data
public class ChatRoomMessageRequestDTO {
    private String sender;   // 发送者用户名
    private String content;  // 消息内容

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}