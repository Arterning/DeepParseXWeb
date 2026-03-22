import apiClient from './client';
import qs from 'query-string';

export interface DocDir {
  id: number;
  name: string;
  parent_id: number | null;
  sort: number;
  remark?: string | null;
  created_time?: string;
  children?: DocDir[];
}

export interface DocFile {
  id: number;
  name?: string;
  title?: string;
  type?: string;
  desc?: string;
  file_suffix?: string;
  size?: number;
  created_time: string;
  created_user?: string;
  doc_dir_id?: number | null;
  status?: number;
}

export interface DocsPageRes {
  items: DocFile[];
  total: number;
  page: number;
  size: number;
}

export function getDocDirTree(): Promise<DocDir[]> {
  return apiClient.get('/api/v1/sys/doc_dirs');
}

export function createDocDir(data: { name: string; parent_id?: number | null; sort?: number }): Promise<void> {
  return apiClient.post('/api/v1/sys/doc_dirs', data);
}

export function updateDocDir(
  pk: number,
  data: { name: string; parent_id?: number | null; sort?: number },
): Promise<void> {
  return apiClient.put(`/api/v1/sys/doc_dirs/${pk}`, data);
}

export function deleteDocDir(pk: number): Promise<void> {
  return apiClient.delete(`/api/v1/sys/doc_dirs/${pk}`);
}

export function getDocsInDir(params: { doc_dir_id?: number; page?: number; size?: number }): Promise<DocsPageRes> {
  return apiClient.get('/api/v1/sys/docs', {
    params,
    paramsSerializer: (obj) => qs.stringify(obj),
  });
}

export function updateDocDirAssociation(docId: number, dirId: number | null): Promise<void> {
  return apiClient.put(`/api/v1/sys/docs/${docId}`, { doc_dir_id: dirId });
}

export function updateDocMeta(docId: number, data: { title?: string; name?: string; desc?: string }): Promise<void> {
  return apiClient.put(`/api/v1/sys/docs/${docId}`, data);
}

export function deleteDoc(pk: number[]): Promise<void> {
  return apiClient.delete('/api/v1/sys/docs', {
    params: { pk },
    paramsSerializer: (obj) => qs.stringify(obj),
  });
}

export function createDocFile(data: {
  title: string;
  name: string;
  type: string;
  doc_dir_id?: number | null;
}): Promise<{ id: number }> {
  return apiClient.post('/api/v1/sys/docs', data);
}
