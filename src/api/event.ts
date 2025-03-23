import axios from 'axios';
import qs from 'query-string';

export interface EventReq {
  name: string;
}

export interface EventRes extends EventReq {
  id: number;
}

export interface EventParams {
  name?: string;
  page?: number;
  size?: number;
}

export interface EventListRes {
  items: EventRes[];
  total: number;
}

export interface EventDeleteParams {
  pk: number[];
}

export function queryEventList(params: EventParams): Promise<EventListRes> {
  return axios.get('/api/v1/sys/events', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export function queryEventAll(): Promise<EventRes[]> {
  return axios.get('/api/v1/sys/events/all');
}

export function queryEventDetail(pk: number): Promise<EventRes> {
  return axios.get(`/api/v1/sys/events/${pk}`);
}

export function createEvent(data: EventReq) {
  return axios.post('/api/v1/sys/events', data);
}

export function updateEvent(pk: number, data: EventReq) {
  return axios.put(`/api/v1/sys/events/${pk}`, data);
}

export function deleteEvent(params: EventDeleteParams) {
  return axios.delete(`/api/v1/sys/events`, {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}