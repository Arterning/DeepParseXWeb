import axios from 'axios';
import qs from 'query-string';

export interface SubjectReq {
  name: string;
}

export interface SubjectRes extends SubjectReq {
  id: number;
}

export interface SubjectParams {
  name?: string;
  page?: number;
  size?: number;
}

export interface SubjectListRes {
  items: SubjectRes[];
  total: number;
}

export interface SubjectDeleteParams {
  pk: number[];
}

export function querySubjectList(params: SubjectParams): Promise<SubjectListRes> {
  return axios.get('/api/v1/sys/subject', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export function querySubjectAll(): Promise<SubjectRes[]> {
  return axios.get('/api/v1/sys/subject/all');
}

export function querySubjectDetail(pk: number): Promise<SubjectRes> {
  return axios.get(`/api/v1/sys/subject/${pk}`);
}

export function createSubject(data: SubjectReq) {
  return axios.post('/api/v1/sys/subject', data);
}

export function updateSubject(pk: number, data: SubjectReq) {
  return axios.put(`/api/v1/sys/subject/${pk}`, data);
}

export function deleteSubject(params: SubjectDeleteParams) {
  return axios.delete(`/api/v1/sys/subject`, {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}