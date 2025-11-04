package com.example.webpj.dto;

import lombok.Data;
import java.util.List;

@Data
public class ChatConversationRequestDTO {
    /** 关联的图灵机ID，由前端传入，方便后端记录或上下文扩展 */
    private Long machineId;

    /** 历史对话消息 */
    private List<ChatMessageRequestDTO> messages;
}
