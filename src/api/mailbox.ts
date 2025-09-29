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

export interface EmailData {
  id: number;
  subject: string;
  time: string | null;
}

export interface NodeData {
  id: string;
  label: string;
  email_count: number;
  layer: number;
  emails: EmailData[];
}

export interface EdgeData {
  source: string;
  target: string;
  weight: number;
  email_count: number;
  latest_time: string;
  relation_type: string;
  emails: EmailData[];
}

export interface NetworkAnalysis {
  degrees: Record<string, number>;
  centrality: {
    degree: Record<string, number>;
    betweenness: Record<string, number>;
    closeness: Record<string, number>;
    eigenvector: Record<string, number>;
  };
  key_nodes: {
    top_degree_nodes: [string, number][];
    top_betweenness_nodes: [string, number][];
    node_impacts: Array<{ node: string; impact: number }>;
  };
  is_directed: boolean;
  number_of_nodes: number;
  number_of_edges: number;
  number_of_connected_components: number;
}

export interface AnalyzeRelationshipsRes {
  nodes: NodeData[];
  edges: EdgeData[];
  network_analysis: NetworkAnalysis;
}

export function analyzeMailboxRelationships(data: AnalyzeRelationshipsReq): Promise<AnalyzeRelationshipsRes> {
  return axios.post('/api/v1/sys/mailbox/analyze-relationships', data);
}