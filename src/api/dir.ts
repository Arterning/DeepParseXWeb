import axios from 'axios';
import qs from 'query-string';

export interface DirectoryReq {
  name: string;
}

export interface DirectoryRes extends DirectoryReq {
  id: number;
}

export interface DirectoryParams {
  name?: string;
}

export interface DirectoryListRes {
  items: DirectoryRes[];
  total: number;
}

export interface DirectoryDeleteParams {
  pk: number[];
}

export function queryDirectoryList(params: DirectoryParams): Promise<DirectoryRes[]> {
  return axios.get('/api/v1/sys/doc_dirs', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export function queryDirectoryDetail(pk: number): Promise<DirectoryRes> {
  return axios.get(`/api/v1/sys/doc_dirs/${pk}`);
}

export function createDirectory(data: DirectoryReq) {
  return axios.post('/api/v1/sys/doc_dirs', data);
}

export function updateDirectory(pk: number, data: DirectoryReq) {
  return axios.put(`/api/v1/sys/doc_dirs/${pk}`, data);
}

export function deleteDirectory(params: DirectoryDeleteParams) {
  return axios.delete(`/api/v1/sys/doc_dirs`, {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}