import SockJS from 'sockjs-client'

import { Client, IMessage } from '@stomp/stompjs';

import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Message} from '../../models/message.model';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';
import {webSocket} from 'rxjs/webSocket';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-chat-room',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './chat-room.component.html',
  styleUrl: './chat-room.component.css'
})
export class ChatRoomComponent implements OnInit, OnDestroy {
  @Input() sender: string | null = null;
  // @Input() token: string | null = "";
  // @Input() machineId!: number; // 从父组件传入的图灵机ID
  @Output() sendMessage = new EventEmitter<Message>();

  machineId: number = 123;
  token: string = '';
  messages: Message[] = [];
  messageContent: string = '';
  onlineUsers: string[] = [];
  private stompClient: any;
  private socket: any;

  ngOnInit() {
    // 总是从本地存储获取用户信息，确保有正确的认证信息
    this.getCurrentUserFromStorage();
    
    // 如果无法从父组件和本地存储获取用户名，尝试从token解析
    if (!this.sender || this.sender.trim() === '') {
      this.getUserInfo();
    }
    
    console.log('当前用户名:', this.sender);
    console.log('当前token:', this.token);
    
    this.connect();
  }
  
  // 从localStorage获取当前用户信息
  private getCurrentUserFromStorage() {
    // 获取当前用户信息
    const currentUserInfo = localStorage.getItem('currentUserInfo');
    if (currentUserInfo) {
      try {
        const userInfo = JSON.parse(currentUserInfo);
        this.token = userInfo.token || '';
        
        // 如果父组件没有提供用户名，就使用当前登录用户的用户名
        if (!this.sender || this.sender.trim() === '') {
          this.sender = userInfo.username;
          console.log('从currentUserInfo获取的用户名:', this.sender);
        }
      } catch (e) {
        console.error('解析currentUserInfo失败', e);
      }
    } else {
      // 如果没有当前用户信息，尝试从localStorage获取token（兼容旧版本）
      this.token = localStorage.getItem('token') || '';
    }
  }
  
  ngOnDestroy() {
    this.disconnect();
  }
  
  private client!: Client;

  // 从JWT令牌中获取用户信息
  private getUserInfo() {
    // 如果已经从父组件接收到了用户名，则优先使用它
    if (this.sender && this.sender.trim() !== '') {
      console.log('使用父组件传入的用户名:', this.sender);
      return;
    }
    
    try {
      if (this.token) {
        // 解析JWT令牌
        const payload = this.token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));
        
        // JWT令牌中通常使用sub字段存储用户名
        if (decodedPayload && decodedPayload.sub) {
          this.sender = decodedPayload.sub;
          console.log('从JWT解析的用户名:', this.sender);
          return;
        }
      }
    } catch (e) {
      console.error('解析JWT令牌失败', e);
    }
    
    // 如果仍然没有用户名，设置一个默认值
    if (!this.sender) {
      this.sender = '访客' + Math.floor(Math.random() * 1000);
      console.log('使用默认用户名:', this.sender);
    }
  }

  private connect() {
    this.client = new Client({
      brokerURL: '', // 为空表示使用 SockJS
              webSocketFactory: () => new SockJS(environment.wsUrl),
      connectHeaders: {
        Authorization: `Bearer ${this.token}` // 添加认证头
      },
      reconnectDelay: 5000, // 自动重连
      debug: (str: any) => console.log(str),
    });

    this.client.onConnect = (frame: any) => {
      console.log('Connected: ' + frame);

      this.client.publish({
        destination: `/app/machine/${this.machineId}/chat/join`,
        body: JSON.stringify({ sender: this.sender })
      });

      this.client.subscribe(`/topic/machine/${this.machineId}/chat`, (message: IMessage) => {
        const receivedMessage = JSON.parse(message.body);
        console.log('接收到的消息:', receivedMessage);
        this.messages = [...this.messages, receivedMessage];
        this.scrollToBottom();
      });

      this.client.subscribe(`/user/queue/machine/${this.machineId}/chat/online`, (message: IMessage) => {
        this.onlineUsers = JSON.parse(message.body);
      });
    };

    this.client.onStompError = (frame: any) => {
      console.error('Broker error:', frame);
    };

    this.client.activate();
  }
  private disconnect() {
    if (this.client && this.client.connected) {
      this.client.publish({
        destination: `/app/machine/${this.machineId}/chat/leave`,
        body: JSON.stringify({ sender: this.sender }),
      });

      this.client.deactivate();
      console.log('Disconnected');
    }
  }


  onSendMessage() {
    if (!this.messageContent.trim()) return;

    const messageData = {
      sender: this.sender,
      content: this.messageContent
    };
    
    console.log('发送消息数据:', messageData);
    console.log('当前用户名:', this.sender);

    // 发送消息到服务器
    this.client.publish({
      destination: `/app/machine/${this.machineId}/chat/send`,
      body: JSON.stringify(messageData),
      headers: { 'content-type': 'application/json' }
    });

    this.messageContent = '';
  }

  // 滚动到聊天底部
  scrollToBottom() {
    setTimeout(() => {
      const container = document.getElementById('chat-messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 10);
  }

  // 格式化时间显示 (显示日期和时间)
  formatTime(timestamp: Date) {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // 检查是否是今天
    if (date.toDateString() === today.toDateString()) {
      return '今天 ' + date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
      });
    }
    // 检查是否是昨天
    else if (date.toDateString() === yesterday.toDateString()) {
      return '昨天 ' + date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
      });
    }
    // 其他日期显示完整日期
    else {
      return date.toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      }) + ' ' + date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
      });
    }
  }
}