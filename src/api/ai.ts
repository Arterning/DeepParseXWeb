import axios from 'axios';

export interface Prompt {
  question: string;
  doc_id?: number;
}


export function chat(params: Prompt): Promise<string> {
  return axios.post('/api/v1/sys/chat', params);
}

// 生成摘要
export function summarize(params: { id: number }): Promise<string> {
  return axios.post('/api/v1/sys/chat/generate_summary', params);
}