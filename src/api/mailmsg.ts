import axios from 'axios';
import qs from 'query-string';

export interface MailMsgReq {
  // 邮件标题
  name: string;

  // 邮件原文
  original: string;

  // 邮件翻译
  zh_content: string;

  subject: string;

  zh_subject: string;

  // 发送时间
  time: Date;

  // 发送者
  sender: string;

  // 接收者
  receiver: string;

  // 抄送者
  cc: string;

  category: string;
}

export interface MailMsgAttachment {
  id: number;
  name: string;
}

export interface MailMsgRes extends MailMsgReq {
  id: number;
  attachments: MailMsgAttachment[];
}
  
export interface MailMsgParams {
  name?: string;
  page?: number;
  size?: number;
  doc_dir_id?: number;
}

export interface MailMsgListRes {
  items: MailMsgRes[];
  total: number;
}

export interface MailMsgDeleteParams {
  pk: number[];
}

export function queryMailMsgList(params: MailMsgParams): Promise<MailMsgListRes> {
  return axios.get('/api/v1/sys/mailmsg', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export function queryMailMsgAll(): Promise<MailMsgRes[]> {
  return axios.get('/api/v1/sys/mailmsg/all');
}

export function queryMailMsgDetail(pk: number): Promise<MailMsgRes> {
  return axios.get(`/api/v1/sys/mailmsg/${pk}`);
}

export function createMailMsg(data: MailMsgReq) {
  return axios.post('/api/v1/sys/mailmsg', data);
}

export function updateMailMsg(pk: number, data: MailMsgReq) {
  return axios.put(`/api/v1/sys/mailmsg/${pk}`, data);
}

export function deleteMailMsg(params: MailMsgDeleteParams) {
  return axios.delete(`/api/v1/sys/mailmsg`, {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}