import axios from 'axios';
import qs from 'query-string';

export interface SocialPostReq {
  name: string;
}

export interface SocialPostRes extends SocialPostReq {
  id: number;
}

export interface SocialPostParams {
  name?: string;
  page?: number;
  size?: number;
}

export interface SocialPostListRes {
  items: SocialPostRes[];
  total: number;
}

export interface SocialPostDeleteParams {
  pk: number[];
}

export function querySocialPostList(params: SocialPostParams): Promise<SocialPostListRes> {
  return axios.get('/api/v1/sys/social_post', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export function querySocialPostAll(): Promise<SocialPostRes[]> {
  return axios.get('/api/v1/sys/social_post/all');
}

export function querySocialPostDetail(pk: number): Promise<SocialPostRes> {
  return axios.get(`/api/v1/sys/social_post/${pk}`);
}

export function createSocialPost(data: SocialPostReq) {
  return axios.post('/api/v1/sys/social_post', data);
}

export function updateSocialPost(pk: number, data: SocialPostReq) {
  return axios.put(`/api/v1/sys/social_post/${pk}`, data);
}

export function deleteSocialPost(params: SocialPostDeleteParams) {
  return axios.delete(`/api/v1/sys/social_post`, {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}