import axios from 'axios';
import qs from 'query-string';

export interface ScandalReq {
  name: string;
}

export interface ScandalRes extends ScandalReq {
  id: number;
}

export interface ScandalParams {
  name?: string;
  page?: number;
  size?: number;
}

export interface ScandalListRes {
  items: ScandalRes[];
  total: number;
}

export interface ScandalDeleteParams {
  pk: number[];
}

export function queryScandalList(params: ScandalParams): Promise<ScandalListRes> {
  return axios.get('/api/v1/sys/scandal', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export function queryScandalAll(): Promise<ScandalRes[]> {
  return axios.get('/api/v1/sys/scandal/all');
}

export function queryScandalDetail(pk: number): Promise<ScandalRes> {
  return axios.get(`/api/v1/sys/scandal/${pk}`);
}

export function createScandal(data: ScandalReq) {
  return axios.post('/api/v1/sys/scandal', data);
}

export function updateScandal(pk: number, data: ScandalReq) {
  return axios.put(`/api/v1/sys/scandal/${pk}`, data);
}

export function deleteScandal(params: ScandalDeleteParams) {
  return axios.delete(`/api/v1/sys/scandal`, {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}