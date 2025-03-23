import axios from 'axios';
import qs from 'query-string';

export interface NewsReq {
  name: string;
}

export interface NewsRes extends NewsReq {
  id: number;
}

export interface NewsParams {
  name?: string;
  page?: number;
  size?: number;
}

export interface NewsListRes {
  items: NewsRes[];
  total: number;
}

export interface NewsDeleteParams {
  pk: number[];
}

export function queryNewsList(params: NewsParams): Promise<NewsListRes> {
  return axios.get('/api/v1/sys/news', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export function queryNewsAll(): Promise<NewsRes[]> {
  return axios.get('/api/v1/sys/news/all');
}

export function queryNewsDetail(pk: number): Promise<NewsRes> {
  return axios.get(`/api/v1/sys/news/${pk}`);
}

export function createNews(data: NewsReq) {
  return axios.post('/api/v1/sys/news', data);
}

export function updateNews(pk: number, data: NewsReq) {
  return axios.put(`/api/v1/sys/news/${pk}`, data);
}

export function deleteNews(params: NewsDeleteParams) {
  return axios.delete(`/api/v1/sys/news`, {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}