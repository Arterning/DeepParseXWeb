import axios from 'axios';
import qs from 'query-string';


export interface DashboardRes {
  all: number;
  group: Record<string, number>;
}


export function queyDashboard(): Promise<DashboardRes> {
    return axios.get(`/api/v1/sys/dashboard/count`);
}
