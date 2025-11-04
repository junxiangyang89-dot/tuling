package com.example.webpj.service.impl;

import com.example.webpj.dto.ChatMessageDTO;
import com.example.webpj.dto.ChatMessageRequestDTO;
import com.example.webpj.dto.ChatMessageDTO.MessageType;
import com.example.webpj.service.AiChatService;
//import lombok.RequiredArgsConstructor;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.net.URLEncoder;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;


@Service
//@RequiredArgsConstructor
public class AiChatServiceImpl implements AiChatService {
//    private final AiChatService aiChatService;
////    private final String model;
    private final WebClient webClient;
    private final RestTemplate restTemplate = new RestTemplate();
    private static final ObjectMapper objectMapper = new ObjectMapper();
    @Value("${baidu.api-key}")
    private String API_KEY;

    @Value("${baidu.secret-key}")
    private String SECRET_KEY;

    public AiChatServiceImpl(WebClient webClient) {
        this.webClient = webClient;
    }

//    public AiChatServiceImpl(WebClient aiWebClient) {
//        this.webClient = aiWebClient;
//    }

    @Override
    public List<ChatMessageDTO> chat(Long machineId, List<ChatMessageRequestDTO> history) {
        // 1) 调用外部模型服务
        List<Map<String, String>> baiduMessages = history.stream()
                .map(msg -> Map.of(
                        "role", msg.getRole(),       // 注意字段名是 "role"，不是 "name"
                        "content", msg.getContent()
                ))
                .toList();

        // 构造请求体
        Map<String, Object> body = Map.of("messages", baiduMessages);
        String accessToken = getAccessToken();
        Mono<ModelResponse> respMono = webClient
                .post()
                .uri("https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie-speed-128k?access_token=" + accessToken)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(ModelResponse.class);

        ModelResponse resp = respMono.block();

        // 2) 把前端历史转换为 ChatMessageDTO
        List<ChatMessageDTO> result = new ArrayList<>();
        for (var msg : history) {
            result.add(new ChatMessageDTO(
                    MessageType.CHAT,
                    machineId,
                    msg.getRole(),
                    msg.getContent(),
                    LocalDateTime.now()
            ));
        }

        // 3) 追加模型回复
        String reply = resp != null ? resp.getReply() : "对不起，模型未返回内容。";
        result.add(new ChatMessageDTO(
                MessageType.CHAT,
                machineId,
                "assistant",
                reply,
                LocalDateTime.now()
        ));
        System.out.println(result);
        return result;
    }

    /** 根据调用的模型 API 定义请求体 */
    public static class ModelRequest {
        public final List<ChatMessageRequestDTO> messages;
        public ModelRequest(List<ChatMessageRequestDTO> messages) {
            this.messages = messages;
        }
    }

    /** 根据调用的模型 API 定义响应体 */
    public static class ModelResponse {
        private String id;
        private String object;
        private long created;
        private String result;
        private boolean is_truncated;
        private boolean need_clear_history;
        private String finish_reason;
        private Usage usage;

        // 用于获取模型回复文本
        public String getReply() {
            return result;
        }

        // Getter 和 Setter 方法（可用 Lombok 简化）

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getObject() { return object; }
        public void setObject(String object) { this.object = object; }

        public long getCreated() { return created; }
        public void setCreated(long created) { this.created = created; }

        public void setResult(String result) { this.result = result; }

        public boolean isIs_truncated() { return is_truncated; }
        public void setIs_truncated(boolean is_truncated) { this.is_truncated = is_truncated; }

        public boolean isNeed_clear_history() { return need_clear_history; }
        public void setNeed_clear_history(boolean need_clear_history) { this.need_clear_history = need_clear_history; }

        public String getFinish_reason() { return finish_reason; }
        public void setFinish_reason(String finish_reason) { this.finish_reason = finish_reason; }

        public Usage getUsage() { return usage; }
        public void setUsage(Usage usage) { this.usage = usage; }

        // 内部类 Usage 对应 usage 字段
        public static class Usage {
            private int prompt_tokens;
            private int completion_tokens;
            private int total_tokens;

            public int getPrompt_tokens() { return prompt_tokens; }
            public void setPrompt_tokens(int prompt_tokens) { this.prompt_tokens = prompt_tokens; }

            public int getCompletion_tokens() { return completion_tokens; }
            public void setCompletion_tokens(int completion_tokens) { this.completion_tokens = completion_tokens; }

            public int getTotal_tokens() { return total_tokens; }
            public void setTotal_tokens(int total_tokens) { this.total_tokens = total_tokens; }
        }
    }

    private String getAccessToken() {
        try {
            String url = "https://aip.baidubce.com/oauth/2.0/token"
                    + "?grant_type=client_credentials"
                    + "&client_id=" + API_KEY
                    + "&client_secret=" + SECRET_KEY;

            ResponseEntity<String> response = restTemplate.postForEntity(url, null, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> json = objectMapper.readValue(response.getBody(), Map.class);
                return (String) json.get("access_token");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
