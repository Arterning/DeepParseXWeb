export interface Message {
  sender: string;
  content?: string;
  timestamp: string;
  status: string; // waiting | success | failure
}
export interface ChatSession {
  id: string;
  topic: string;
  messages: Message[]; // 假设 Message 也是一个需要定义的类型
  updatedAt: string;
}
