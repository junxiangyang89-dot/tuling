import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  machineId: number;
  messages: ChatMessage[];
}

@Injectable({ providedIn: 'root' })
export class AiChatService {
  constructor(private http: HttpClient) {}

  /**
   * 调用后端代理的 AI 接口
   * @param messages 已有对话，用于上下文
   */
  chat(request: { machineId: number; messages: ChatMessage[] }): Observable<ChatMessage[]> {
    console.log(request)
    return this.http.post<ChatMessage[]>(
              environment.apiUrl + '/ai/chat',
      request,
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      }
    );
  }
}
