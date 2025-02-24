import axios from 'axios';
import qs from 'query-string';

export interface PersonReq {
  name: string;
}

export interface PersonRes extends PersonReq {
  id: number;
}

export interface PersonParams {
  name?: string;
  page?: number;
  size?: number;
}

export interface PersonListRes {
  items: PersonRes[];
  total: number;
}

export interface PersonDeleteParams {
  pk: number[];
}

export function queryPersonList(params: PersonParams): Promise<PersonListRes> {
  return axios.get('/api/v1/sys/person', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export function queryPersonAll(): Promise<PersonRes[]> {
  return axios.get('/api/v1/sys/person/all');
}

export function queryPersonDetail(pk: number): Promise<PersonRes> {
  return axios.get(`/api/v1/sys/person/${pk}`);
}

export function createPerson(data: PersonReq) {
  return axios.post('/api/v1/sys/person', data);
}

export function updatePerson(pk: number, data: PersonReq) {
  return axios.put(`/api/v1/sys/person/${pk}`, data);
}

export function deletePerson(params: PersonDeleteParams) {
  return axios.delete(`/api/v1/sys/person`, {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}