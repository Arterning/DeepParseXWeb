import axios from 'axios';
import qs from 'query-string';

export interface MailBoxReq {
  name: string;
  email_num?: number;
  country?: string;
  other_info?: string;
}

export interface MailBoxRes extends MailBoxReq {
  id: number;
}

export interface MailBoxParams {
  name?: string;
  page?: number;
  size?: number;
}

export interface MailBoxListRes {
  items: MailBoxRes[];
  total: number;
}

export interface MailBoxDeleteParams {
  pk: number[];
}

export function queryMailBoxList(params: MailBoxParams): Promise<MailBoxListRes> {
  return axios.get('/api/v1/sys/mailbox', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export function queryMailBoxAll(): Promise<MailBoxRes[]> {
  return axios.get('/api/v1/sys/mailbox/all');
}

export function queryMailBoxDetail(pk: number): Promise<MailBoxRes> {
  return axios.get(`/api/v1/sys/mailbox/${pk}`);
}

export function createMailBox(data: MailBoxReq) {
  return axios.post('/api/v1/sys/mailbox', data);
}

export function updateMailBox(pk: number, data: MailBoxReq) {
  return axios.put(`/api/v1/sys/mailbox/${pk}`, data);
}

export function deleteMailBox(params: MailBoxDeleteParams) {
  return axios.delete(`/api/v1/sys/mailbox`, {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export interface AnalyzeRelationshipsReq {
  mailboxes: string[];
  start_time?: string;
  end_time?: string;
  max_layers?: number;
  reference_time?: string;
}

export interface NodeData {
  id: string;
  label: string;
  email_count: number;
  layer: number;
}

export interface EdgeData {
  source: string;
  target: string;
  weight: number;
  email_count: number;
  latest_time: string;
  relation_type: string;
}

export interface AnalyzeRelationshipsRes {
  nodes: NodeData[];
  edges: EdgeData[];
}

export function analyzeMailboxRelationships(data: AnalyzeRelationshipsReq): Promise<AnalyzeRelationshipsRes> {
  return axios.post('/api/v1/sys/mailbox/analyze-relationships', data);
}