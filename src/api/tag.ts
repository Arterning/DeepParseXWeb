import axios from 'axios';
import qs from 'query-string';

export interface TagReq {
  name: string;
}

export interface TagRes extends TagReq {
  id: number;
}

export interface TagParams {
  name?: string;
  page?: number;
  size?: number;
}

export interface TagListRes {
  items: TagRes[];
  total: number;
}

export interface TagDeleteParams {
  pk: number[];
}

export function queryTagList(params: TagParams): Promise<TagListRes> {
  return axios.get('/api/v1/sys/tags', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export function queryTagAll(): Promise<TagRes[]> {
  return axios.get('/api/v1/sys/tags/all');
}

export function queryTagDetail(pk: number): Promise<TagRes> {
  return axios.get(`/api/v1/sys/tags/${pk}`);
}

export function createTag(data: TagReq) {
  return axios.post('/api/v1/sys/tags', data);
}

export function updateTag(pk: number, data: TagReq) {
  return axios.put(`/api/v1/sys/tags/${pk}`, data);
}

export function deleteTag(params: TagDeleteParams) {
  return axios.delete(`/api/v1/sys/tags`, {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}