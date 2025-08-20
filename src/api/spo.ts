import axios from 'axios';
import qs from 'query-string';

export interface SubjectPredictObjectReq {
  subject: string;
  subject_type: string;
  predictate: string;
  object: string;
  object_type: string;
  doc_id: number;
}

export interface SubjectPredictObjectRes extends SubjectPredictObjectReq {
  id: number;
}

export interface SubjectPredictObjectParams {
  name?: string;
  page?: number;
  size?: number;
}

export interface SubjectPredictObjectListRes {
  items: SubjectPredictObjectRes[];
  total: number;
}

export interface SubjectPredictObjectDeleteParams {
  pk: number[];
}

export function querySubjectPredictObjectList(params: SubjectPredictObjectParams): Promise<SubjectPredictObjectListRes> {
  return axios.get('/api/v1/sys/spo', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export function querySubjectPredictObjectAll(): Promise<SubjectPredictObjectRes[]> {
  return axios.get('/api/v1/sys/spo/all');
}

export function querySubjectPredictObjectDetail(pk: number): Promise<SubjectPredictObjectRes> {
  return axios.get(`/api/v1/sys/spo/${pk}`);
}

export function createSubjectPredictObject(data: SubjectPredictObjectReq) {
  return axios.post('/api/v1/sys/spo', data);
}

export function updateSubjectPredictObject(pk: number, data: SubjectPredictObjectReq) {
  return axios.put(`/api/v1/sys/spo/${pk}`, data);
}

export function deleteSubjectPredictObject(params: SubjectPredictObjectDeleteParams) {
  return axios.delete(`/api/v1/sys/spo`, {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}