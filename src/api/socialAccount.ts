import axios from 'axios';
import qs from 'query-string';

export interface SocialAccountReq {
  name: string;
}

export interface SocialAccountRes extends SocialAccountReq {
  id: number;
}

export interface SocialAccountParams {
  name?: string;
  page?: number;
  size?: number;
}

export interface SocialAccountListRes {
  items: SocialAccountRes[];
  total: number;
}

export interface SocialAccountDeleteParams {
  pk: number[];
}

export function querySocialAccountList(params: SocialAccountParams): Promise<SocialAccountListRes> {
  return axios.get('/api/v1/sys/social_account', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export function querySocialAccountAll(): Promise<SocialAccountRes[]> {
  return axios.get('/api/v1/sys/social_account/all');
}

export function querySocialAccountDetail(pk: number): Promise<SocialAccountRes> {
  return axios.get(`/api/v1/sys/social_account/${pk}`);
}

export function createSocialAccount(data: SocialAccountReq) {
  return axios.post('/api/v1/sys/social_account', data);
}

export function updateSocialAccount(pk: number, data: SocialAccountReq) {
  return axios.put(`/api/v1/sys/social_account/${pk}`, data);
}

export function deleteSocialAccount(params: SocialAccountDeleteParams) {
  return axios.delete(`/api/v1/sys/social_account`, {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}