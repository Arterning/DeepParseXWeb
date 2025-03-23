import axios from 'axios';

export interface Prompt {
  question: string;
}


export function chat(params: Prompt): Promise<string> {
  return axios.post('/api/v1/sys/chat', params);
}
