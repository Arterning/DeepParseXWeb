import axios from 'axios';
import qs from 'query-string';
import type { GraphData } from '@/types/graph';
import type { MailMsgRes } from '@/api/mailmsg';

export interface SysDocReq {
  name: string;
  title?: string;
  desc?: string;
  content?: string;
  type?: string;
  file?: string;
  doc_data?: Record<string, any>[];
}

export interface SysDocRes extends SysDocReq {
  id: number;
  email_from?: string;
  email_to?: string;
  email_subject?: string;
  email_time?: string;
  graph_data?: GraphData;
  email_msg?: MailMsgRes;
}

export interface SysDocQueryRes {
  id: number;
  name: string;
  title?: string;
  type?: string;
  desc?: string;
  content?: string;
  hit?: string;
}

export interface SysDocParams {
  name?: string;
  title?: string;
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
  return axios.get('/api/v1/sys/docs', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export function searchSysDocList(params: SysDocParams): Promise<SysDocQueryRes[]> {
  return axios.get('/api/v1/sys/docs/search', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export function querySysDocAll(): Promise<SysDocRes[]> {
  return axios.get('/api/v1/sys/docs/all');
}

export function querySysDocDetail(pk: number): Promise<SysDocRes> {
  return axios.get(`/api/v1/sys/docs/${pk}`);
}

export function createSysDoc(data: SysDocReq) {
  return axios.post('/api/v1/sys/docs', data);
}

export function updateSysDoc(pk: number, data: SysDocReq) {
  return axios.put(`/api/v1/sys/docs/${pk}`, data);
}

export function deleteSysDoc(params: SysDocPickParams) {
  return axios.delete(`/api/v1/sys/docs`, {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export function queryRecentDocs(): Promise<SysDocRes[]> {
  return axios.get(`/api/v1/sys/docs/recent_docs`)
}

export function extractIPAddress(params: number[]) {
  return axios.post(`/api/v1/sys/ip_addr`, params);
}

// 提取知识图谱
export function extractGraphData(pk: number) {
  return axios.get(`/api/v1/sys/docs/build_graph/${pk}`);
}

export function extractUserCount(params: number[]) {
  return axios.post(`/api/v1/sys/account_pwd`, params);
}