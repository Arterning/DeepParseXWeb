import axios from 'axios';
import qs from 'query-string';

export interface SysAssetsParams {
  ip_addr: string;
  assets_name: string;
  assets_ports?: string[];
  assets_services?: string[];
  assets_desc?: string;
  assets_status: boolean;
  assets_remarks: string[];
  create_time: string;
  update_time?: string;
}

export interface SysAssetsReq {
  assets_name?: string;
  page?: number;
  size?: number;
}

export interface SysAssetsRes extends SysAssetsParams {
  id: number;
}

export interface SysAssetsListRes {
  items: SysAssetsRes[];
  total: number;
}

export interface SysAssetsPickParams {
  pk: number[];
}

export function querySysAssetsList(params: SysAssetsReq): Promise<SysAssetsListRes> {
  return axios.get('/api/v1/sys/asset', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export function querySysAssetsDetail(pk: number): Promise<SysAssetsRes> {
  return axios.get(`/api/v1/sys/asset/${pk}`);
}

export function createSysAssets(data: SysAssetsParams) {
  return axios.post('/api/v1/sys/asset/add_asset', data);
}

export function updateSysAssets(pk: number, data: SysAssetsParams) {
  return axios.put(`/api/v1/sys/asset/${pk}`, data);
}

export function deleteSysAssets(params: SysAssetsPickParams) {
  return axios.delete(`/api/v1/sys/asset`, {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}