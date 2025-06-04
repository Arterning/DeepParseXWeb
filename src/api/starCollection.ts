import axios from 'axios';
import qs from 'query-string';

export interface StarCollectionReq {
  name: string;
}

export interface StarCollectionRes extends StarCollectionReq {
  id: number;
}

export interface StarCollectionParams {
  name?: string;
  page?: number;
  size?: number;
}

export interface StarCollectionListRes {
  items: StarCollectionRes[];
  total: number;
}

export interface StarCollectionDeleteParams {
  pk: number[];
}

export function queryStarCollectionList(params: StarCollectionParams): Promise<StarCollectionListRes> {
  return axios.get('/api/v1/sys/star_collect', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export function queryStarCollectionAll(): Promise<StarCollectionRes[]> {
  return axios.get('/api/v1/sys/star_collect/all');
}

export function queryStarCollectionDetail(pk: number): Promise<StarCollectionRes> {
  return axios.get(`/api/v1/sys/star_collect/${pk}`);
}

export function createStarCollection(data: StarCollectionReq) {
  return axios.post('/api/v1/sys/star_collect', data);
}

export function updateStarCollection(pk: number, data: StarCollectionReq) {
  return axios.put(`/api/v1/sys/star_collect/${pk}`, data);
}

export function deleteStarCollection(params: StarCollectionDeleteParams) {
  return axios.delete(`/api/v1/sys/star_collect`, {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}