package com.example.webpj.dto;

import lombok.Data;

@Data
public class ChatRoomJoinRequestDTO {
    private String sender;   // 用户名

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }
}