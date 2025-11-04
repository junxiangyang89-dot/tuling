export interface Message {
  type?: 'CHAT' | 'JOIN' | 'LEAVE' | 'SYSTEM';
  sender: string;
  content: string;
  timestamp: Date;
}
