import axios from 'axios';
import qs from 'query-string';

export interface UploadTaskReq {
  name: string;
  option: any;
  createdTime: string;
}

export interface UploadTaskRes extends UploadTaskReq {
  id: number;
}

export interface UploadTaskParams {
  name?: string;
  page?: number;
  size?: number;
}

export interface UploadTaskListRes {
  items: UploadTaskRes[];
  total: number;
}

export interface UploadTaskDeleteParams {
  pk: number[];
}

export function queryUploadTaskList(params: UploadTaskParams): Promise<UploadTaskListRes> {
  return axios.get('/api/v1/sys/upload_task', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export function queryUploadTaskAll(): Promise<UploadTaskRes[]> {
  return axios.get('/api/v1/sys/upload_task/all');
}

export function queryUploadTaskDetail(pk: number): Promise<UploadTaskRes> {
  return axios.get(`/api/v1/sys/upload_task/${pk}`);
}

export function createUploadTask(data: UploadTaskReq) {
  return axios.post('/api/v1/sys/upload_task', data);
}

export function updateUploadTask(pk: number, data: UploadTaskReq) {
  return axios.put(`/api/v1/sys/upload_task/${pk}`, data);
}

export function deleteUploadTask(params: UploadTaskDeleteParams): Promise<any> {
  return axios.delete(`/api/v1/sys/upload_task`, {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}