package com.example.webpj.service.impl;

import com.example.webpj.dto.ChatMessageDTO;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ChatRoomService {
    // 当前在线的用户集合
    private final Map<Long, Set<String>> machineUsers = new ConcurrentHashMap<>();

    private final SimpMessagingTemplate messagingTemplate;

    public ChatRoomService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * 用户加入聊天室
     */
    public void joinRoom(Long machineId, String username) {
        machineUsers.computeIfAbsent(machineId, k -> ConcurrentHashMap.newKeySet())
                .add(username);

        broadcastSystemMessage(machineId, username + " 加入了聊天室");
    }

    /**
     * 用户离开聊天室
     */
    public void leaveRoom(Long machineId, String username) {
        if (machineUsers.containsKey(machineId)) {
            machineUsers.get(machineId).remove(username);
            broadcastSystemMessage(machineId, username + " 离开了聊天室");
        }
    }

    /**
     * 发送聊天消息
     */
    public void sendMessage(Long machineId, String username, String message) {
        ChatMessageDTO chatMessage = new ChatMessageDTO();
        chatMessage.setType(ChatMessageDTO.MessageType.CHAT);
        chatMessage.setMachineId(machineId);
        chatMessage.setSender(username);
        chatMessage.setContent(message);
        // 使用东八区时间
        chatMessage.setTimestamp(LocalDateTime.now(java.time.ZoneId.of("Asia/Shanghai")));

        messagingTemplate.convertAndSend("/topic/machine/" + machineId+ "/chat", chatMessage);
    }

    /**
     * 获取聊天室在线用户
     */
    public Set<String> getOnlineUsers(Long machineId) {
        return Collections.unmodifiableSet(
                machineUsers.getOrDefault(machineId, Collections.emptySet())
        );
    }

    private void broadcastSystemMessage(Long machineId, String content) {
        ChatMessageDTO message = new ChatMessageDTO();
        message.setType(ChatMessageDTO.MessageType.SYSTEM);
        message.setMachineId(machineId);
        message.setSender("System");
        message.setContent(content);
        // 使用东八区时间
        message.setTimestamp(LocalDateTime.now(java.time.ZoneId.of("Asia/Shanghai")));

        messagingTemplate.convertAndSend("/topic/machine/" + machineId + "/chat", message);
    }
}
