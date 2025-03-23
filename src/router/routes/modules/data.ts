import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const DASHBOARD: AppRouteRecordRaw = {
  path: '/data',
  name: 'data',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.data',
    requiresAuth: true,
    icon: 'IconApps',
    order: 1,
    hideInMenu: false,
  },
  children: [
    
  ],
};

export default DASHBOARD;
