import axios from 'axios';
import qs from 'query-string';

export interface EntityReq {
  name: string;
  description?: string;
  entity_type?: string;
  properties: Record<string, any>;
}

export interface RelatedEntity {
  id?: number;
  name: string;
  entity_type?: string;
}

export interface Relationship {
  relation_type: string;
  direction: 'outgoing' | 'incoming';
  related_entity: RelatedEntity;
  weight?: number;
  description?: string;
}

export interface Doc {
  id: number;
  title: string;
  name: string;
  type: string;
  doc_time: string;
}

export interface EntityRes extends EntityReq {
  id: number;
  relationships?: Relationship[];
  docs?: Doc[];
}

export interface EntityParams {
  name?: string;
  page?: number;
  size?: number;
}

export interface EntityListRes {
  items: EntityRes[];
  total: number;
}

export interface EntityDeleteParams {
  pk: number[];
}

export function queryEntityList(params: EntityParams): Promise<EntityListRes> {
  return axios.get('/api/v1/sys/entity', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export function queryEntityAll(): Promise<EntityRes[]> {
  return axios.get('/api/v1/sys/entity/all');
}

export function queryEntityDetail(pk: number): Promise<EntityRes> {
  return axios.get(`/api/v1/sys/entity/${pk}`);
}

export function createEntity(data: EntityReq) {
  return axios.post('/api/v1/sys/entity', data);
}

export function updateEntity(pk: number, data: EntityReq) {
  return axios.put(`/api/v1/sys/entity/${pk}`, data);
}

export function deleteEntity(params: EntityDeleteParams) {
  return axios.delete(`/api/v1/sys/entity`, {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}