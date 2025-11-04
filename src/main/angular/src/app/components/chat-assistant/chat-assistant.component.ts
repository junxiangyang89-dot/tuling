// src/app/components/chat-assistant/chat-assistant.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiChatService, ChatMessage, ChatRequest } from '../../services/ai-chat.service';

@Component({
  selector: 'app-chat-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-assistant.component.html',
  styleUrls: ['./chat-assistant.component.css']
})
export class ChatAssistantComponent {
  messages: ChatMessage[] = [];
  userInput: string = '';
  loading = false;
  sendmessage:ChatMessage[] = [];

  constructor(private ai: AiChatService) {}

  send(): void {
    const text = this.userInput.trim();
    if (!text) return;
    // 添加用户消息
    this.messages = [...this.messages, { role: 'user', content: text }];
    this.sendmessage = [{ role: 'user', content: text }]
    this.userInput = '';
    this.loading = true;

    // 调用 AI
    this.ai.chat({
      machineId: 1,
      messages: this.sendmessage
    }).subscribe({
      next: (reply) => {
        // 将 ChatMessageDTO[] 映射成 ChatMessage[]
        const lastMsg = reply[reply.length - 1];

        // 映射为 ChatMessage 格式
        const aiReply: ChatMessage = {
          role: 'assistant',//lastMsg.role === 'assistant' ? 'assistant' : 'user',
          content: lastMsg.content
        };

        // 添加到对话列表中
        this.messages = [...this.messages, aiReply];
        this.loading = false;
      },
      error: () => {
        this.messages = [
          ...this.messages,
          { role: 'assistant', content: '出错了，请稍后再试。' }
        ];
        this.loading = false;
      }
    });
  }
}
