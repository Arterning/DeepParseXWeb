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
    {
      path: 'doc',
      name: 'Doc',
      component: () => import('@/views/data/doc/index.vue'),
      meta: {
        locale: 'menu.data.doc',
        requiresAuth: true,
        icon: 'IconFile',
        roles: ['*'],
        hideInMenu: false,
      },
    },
    {
      path: 'doc-detail/:id',
      name: 'DocDetail',
      component: () => import('@/views/data/doc/components/doc-detail.vue'),
      meta: {
        locale: 'menu.data.doc.detail',
        requiresAuth: true,
        roles: ['*'],
        hideInMenu: true,
      },
    },
    {
      path: 'assets',
      name: 'Assets',
      component: () => import('@/views/data/assets/index.vue'),
      meta: {
        locale: 'menu.data.assets',
        requiresAuth: true,
        icon: 'IconFile',
        roles: ['*'],
        hideInMenu: false,
      },
    },
    {
      path: 'assets-detail/:id',
      name: 'AssetsDetail',
      component: () => import('@/views/data/assets/components/assets-detail/index.vue'),
      meta: {
        locale: 'menu.data.assets.detail',
        requiresAuth: true,
        roles: ['*'],
        hideInMenu: true,
      },
    },
    {
      path: 'org',
      name: 'Org',
      component: () => import('@/views/data/org/index.vue'),
      meta: {
        locale: 'menu.data.org',
        requiresAuth: true,
        icon: 'IconFile',
        roles: ['*'],
        hideInMenu: false,
      },
    },
    {
      path: 'org-detail/:id',
      name: 'OrgDetail',
      component: () => import('@/views/data/org/components/org-detail/index.vue'),
      meta: {
        locale: 'menu.data.org.detail',
        requiresAuth: true,
        roles: ['*'],
        hideInMenu: true,
      },
    },
    {
        path: 'upload',
        name: 'Upload',
        component: () => import('@/views/data/upload/index.vue'),
        meta: {
          locale: 'menu.data.upload',
          requiresAuth: true,
          roles: ['*'],
          hideInMenu: false,
          icon: 'IconUpload',
        },
      },
      {
        path: 'event',
        name: 'Event',
        component: () => import('@/views/data/event/index.vue'),
        meta: {
          locale: '热点事件',
          requiresAuth: true,
          roles: ['*'],
          hideInMenu: false,
        },
      },
      {
        path: 'tag',
        name: 'Tag',
        component: () => import('@/views/data/tag/index.vue'),
        meta: {
          locale: '标签',
          requiresAuth: true,
          roles: ['*'],
          hideInMenu: false,
        },
      },
  ],
};

export default DASHBOARD;
