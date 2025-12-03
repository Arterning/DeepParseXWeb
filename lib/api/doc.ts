import apiClient from './client';
import qs from 'query-string';

export interface SysDocReq {
  name: string;
  title?: string;
  source?: string;
  desc?: string;
  content?: string;
  type?: string;
  file?: string;
  doc_data?: Record<string, any>[];
  tags?: string[];
}

export interface DocEntity {
  entity_type: string;
  name: string;
  description?: string;
  id: number;
}

export interface SysDocRes extends SysDocReq {
  id: number;
  is_collected?: boolean;
  entities?: DocEntity[];
  created_time: string;
  created_user?: string;
  size: number;
  status?: number;
}

export interface SysDocQueryRes {
  items: {
    id: number;
    name: string;
    title?: string;
    type?: string;
    desc?: string;
    content?: string;
    hit?: string;
  }[];
  total: number;
  page: number;
  size: number;
}

export interface SysDocParams {
  name?: string;
  title?: string;
  query?: string;
  tokens?: string;
  likeq?: string;
  content?: string;
  type?: string;
  page?: number;
  size?: number;
}

export interface SysDocListRes {
  items: SysDocRes[];
  total: number;
}

export interface SysDocPickParams {
  pk: number[];
}

export function querySysDocList(params: SysDocParams): Promise<SysDocListRes> {
  return apiClient.get('/api/v1/sys/docs', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export function searchSysDocList(params: SysDocParams): Promise<SysDocQueryRes> {
  return apiClient.get('/api/v1/sys/docs/search', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export function queryRecentDocs(): Promise<SysDocRes[]> {
  return apiClient.get(`/api/v1/sys/docs/recent_docs`);
}

export function querySysDocDetail(pk: number): Promise<SysDocRes> {
  return apiClient.get(`/api/v1/sys/docs/${pk}`);
}

export function createSysDoc(data: SysDocReq) {
  return apiClient.post('/api/v1/sys/docs', data);
}

export function updateSysDoc(pk: number, data: SysDocReq) {
  return apiClient.put(`/api/v1/sys/docs/${pk}`, data);
}

export function deleteSysDoc(params: SysDocPickParams) {
  return apiClient.delete(`/api/v1/sys/docs`, {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}
