import axios from 'axios';

export interface Prompt {
  question: string;
  doc_id?: number;
}

// 定义API返回的数据结构
export interface ChatResponse {
    answer: string;
    chunks: Array<{
      chunk_id: string;
      chunk_text: string;
      doc_id: number;
      doc_name: string;
    }>;
  }


export function chat(params: Prompt): Promise<ChatResponse> {
  return axios.post('/api/v1/sys/chat', params);
}

// 生成摘要
export function summarize(params: { id: number }): Promise<string> {
  return axios.post('/api/v1/sys/chat/generate_summary', params);
}

// 生成翻译
export function translate(params: { id: number; text: string; target_language: string }): Promise<string> {
  return axios.post('/api/v1/sys/chat/generate_translation', params);
}