package com.example.webpj.service;

import com.example.webpj.dto.ChatMessageDTO;
import com.example.webpj.dto.ChatMessageRequestDTO;
import java.util.List;

public interface AiChatService {
    /**
     * @param machineId   图灵机ID，用于上下文或日志
     * @param history     前端传入的请求消息列表
     * @return 完整的 ChatMessageDTO 列表，包括前端历史与新生成的 assistant 消息
     */
    List<ChatMessageDTO> chat(Long machineId, List<ChatMessageRequestDTO> history);
}
