package com.example.webpj.service.impl;

import com.example.webpj.dto.ChatMessageDTO;
import com.example.webpj.dto.ChatMessageRequestDTO;
import com.example.webpj.dto.ChatMessageDTO.MessageType;
import com.example.webpj.service.AiChatService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AiChatServiceImpl implements AiChatService {

    // 保持项目中“构造注入 WebClient”的方式不变（由 AiConfig 提供 Bean）
    private final WebClient webClient;
    public AiChatServiceImpl(WebClient webClient) { this.webClient = webClient; }

    @Override
    public List<ChatMessageDTO> chat(Long machineId, List<ChatMessageRequestDTO> history) {
        // 1) 组装 OpenAI/GLM 兼容 messages
        List<Map<String, String>> messages = new ArrayList<>();
        for (ChatMessageRequestDTO msg : history) {
            messages.add(Map.of("role", msg.getRole(), "content", msg.getContent()));
        }

        // 2) 请求体（非流式）。模型名按需调整：glm-4 / glm-4-air / glm-3-turbo...
        Map<String, Object> body = Map.of(
                "model", "glm-4",
                "messages", messages,
                "temperature", 0.7
        );

        // 3) 调用智谱接口：
        //    baseUrl 和 Authorization 已由 AiConfig 统一设置为 ai.endpoint / ai.api-key
        Mono<ZhipuResponse> respMono = webClient
                .post()
                .uri("") // 使用 baseUrl（/chat/completions）
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(ZhipuResponse.class);

        ZhipuResponse resp = respMono.block();

        // 4) 返回：保留历史 + 追加助手回复（与你现有拼装方式相同）
        List<ChatMessageDTO> result = new ArrayList<>();
        for (ChatMessageRequestDTO msg : history) {
            result.add(new ChatMessageDTO(
                    MessageType.CHAT, machineId, msg.getRole(), msg.getContent(), LocalDateTime.now()
            ));
        }
        String reply = (resp != null) ? resp.getReply() : "对不起，模型未返回内容。";
        result.add(new ChatMessageDTO(
                MessageType.CHAT, machineId, "assistant", reply, LocalDateTime.now()
        ));
        return result;
    }

    // ====== 智谱响应（OpenAI 兼容：choices[0].message.content）======
    public static class ZhipuResponse {
        public List<Choice> choices;
        public String getReply() {
            if (choices != null && !choices.isEmpty() && choices.get(0) != null && choices.get(0).message != null) {
                return choices.get(0).message.content;
            }
            return null;
        }
        public static class Choice { public Message message; }
        public static class Message { public String role; public String content; }
    }
}
