import { RouteRecordNormalized } from 'vue-router';

export interface Doc {
  name: string;
  title?: string;
  desc?: string;
  content?: string;
  type?: string;
  file?: string;
  doc_data?: Record<string, any>[];
  id: number;
  email_from?: string;
  email_to?: string;
  email_subject?: string;
  email_time?: string;
}

export interface DocState {
  docMap: Map<number, Doc>;
  // test: number
}