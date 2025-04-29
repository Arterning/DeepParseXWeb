import axios from 'axios';
import qs from 'query-string';

export interface SysOrgParams {
  org_name: string;
  org_file_nums?: number;
  org_assets_nums?: number;
  org_desc?: string;
  create_time?: string;
  update_time?: string;
}

export interface SysOrgRes extends SysOrgParams {
  id: number;
}

export interface SysOrgReq {
  org_name?: string;
  page?: number;
  size?: number;
}

export interface SysOrgListRes {
  items: SysOrgRes[];
  total: number;
}

export interface SysOrgPickParams {
  pk: number[];
}


export function querySysOrgList(params: SysOrgReq): Promise<SysOrgListRes> {
  return axios.get('/api/v1/sys/org', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export function querySysOrgDetail(pk: number): Promise<SysOrgRes> {
  return axios.get(`/api/v1/sys/org/${pk}`);
}

export function createSysOrg(data: SysOrgParams) {
  return axios.post('/api/v1/sys/org/add_org', data);
}

export function updateSysOrg(pk: number, data: SysOrgParams) {
  return axios.put(`/api/v1/sys/org/${pk}`, data);
}

export function deleteSysOrg(params: SysOrgPickParams) {
  return axios.delete(`/api/v1/sys/org`, {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}