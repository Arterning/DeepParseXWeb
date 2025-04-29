

import axios from 'axios';
import qs from 'query-string';

interface TaskParam {
    args?: string;
    kwargs?: {
        [key: string]: any;
    };
}

// 执行任务
export function executeTask(name: string, data: TaskParam) {
  return axios.post(`/api/v1/tasks/${name}`, data);
}

// 查询任务状态
export function queryTaskStatus(taskId: string) {
  return axios.get(`/api/v1/tasks/${taskId}`);
}

// sse查询任务状态
export function sseQueryTaskStatus(taskId: string) {
  return new EventSource(`/api/v1/tasks/${taskId}/sse`);
}