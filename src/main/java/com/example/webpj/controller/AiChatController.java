package com.example.webpj.controller;

import com.example.webpj.dto.ChatConversationRequestDTO;
import com.example.webpj.dto.ChatMessageDTO;
import com.example.webpj.dto.ChatMessageRequestDTO;
import com.example.webpj.service.impl.AiChatServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class AiChatController {
    private final AiChatServiceImpl aiChatService;

    /**
     * 接收前端历史消息，返回追加了 assistant 回复的完整 ChatMessageDTO 列表
     */
    @PostMapping("/chat")
    public List<ChatMessageDTO> chat(@RequestBody ChatConversationRequestDTO req) {
        System.out.println(req);
        return aiChatService.chat(
                req.getMachineId(),
                req.getMessages()
        );
    }
}
