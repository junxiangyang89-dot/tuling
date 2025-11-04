package com.example.webpj.controller;

import com.example.webpj.dto.ChatMessageRequestDTO;
import com.example.webpj.dto.ChatRoomMessageRequestDTO;
import com.example.webpj.dto.ChatRoomJoinRequestDTO;
import com.example.webpj.service.impl.ChatRoomService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class ChatRoomController {
    private final ChatRoomService chatService;

    public ChatRoomController(ChatRoomService chatService) {
        this.chatService = chatService;
    }

    /**
     * 加入聊天室
     */
    @MessageMapping("/machine/{machineId}/chat/join")
    public void joinChatRoom(
            @DestinationVariable Long machineId,
            @Payload ChatRoomJoinRequestDTO request
    ) {
        System.out.println("JOIN: machineId: " + machineId + " sender: " + request.getSender());
        chatService.joinRoom(machineId, request.getSender());
    }

    /**
     * 发送消息
     */
    @MessageMapping("/machine/{machineId}/chat/send")
    public void sendChatMessage(
            @DestinationVariable Long machineId,
            @Payload ChatRoomMessageRequestDTO request
    ) {
        System.out.println("SEND DEBUG: machineId: " + machineId);
        System.out.println("SEND DEBUG: request object: " + request);
        System.out.println("SEND DEBUG: sender: " + request.getSender());
        System.out.println("SEND DEBUG: content: " + request.getContent());

        if (request.getSender() == null) {
            System.err.println("ERROR: sender is null!");
        }

        chatService.sendMessage(machineId, request.getSender(), request.getContent());
    }

    /**
     * 离开聊天室
     */
    @MessageMapping("/machine/{machineId}/chat/leave")
    public void leaveChatRoom(
            @DestinationVariable Long machineId,
            @Payload String sender) {
        System.out.println("LEAVE: machineId: " + machineId );
        chatService.leaveRoom(machineId, sender);
    }
}
