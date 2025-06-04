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
      component: () => import('@/views/data/doc-detail/index.vue'),
      meta: {
        locale: 'menu.data.doc.detail',
        requiresAuth: true,
        roles: ['*'],
        hideInMenu: true,
      },
    },
    {
      path: 'person-detail/:id',
      name: 'PersonDetail',
      component: () => import('@/views/data/person-detail/index.vue'),
      meta: {
        locale: 'menu.data.person.detail',
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
      component: () => import('@/views/data/org-detail/index.vue'),
      meta: {
        locale: 'menu.data.org.detail',
        requiresAuth: true,
        roles: ['*'],
        hideInMenu: true,
      },
    },
    {
      path: 'data-detail/:id',
      name: 'DataDetail',
      component: () => import('@/views/data/data-detail/index.vue'),
      meta: {
        locale: 'menu.data.data.detail',
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
          locale: '我的标签',
          requiresAuth: true,
          roles: ['*'],
          hideInMenu: false,
        },
      },
      // 收藏
      {
        path: 'collection',
        name: 'Collection',
        component: () => import('@/views/data/star/index.vue'),
        meta: {
          locale: '收藏',
          requiresAuth: true,
          roles: ['*'],
          hideInMenu: false,
        },
      },
    {
      path: 'search',
      name: 'search',
      component: () => import('@/views/data/search/index.vue'),
      meta: {
        locale: '搜索',
        requiresAuth: true,
        roles: ['*'],
        hideInMenu: false,
      },
    },
      {
        path: 'mail',
        name: 'Mail',
        component: () => import('@/views/data/mail/index.vue'),
        meta: {
          locale: '邮件数据',
          requiresAuth: true,
          roles: ['*'],
          hideInMenu: false,
        },
      },
      {
        path: 'person',
        name: 'Person',
        component: () => import('@/views/data/person/index.vue'),
        meta: {
          locale: '人物管理',
          requiresAuth: true,
          roles: ['*'],
          hideInMenu: false,
        },
      },
      {
        path: 'subject',
        name: 'Subject',
        component: () => import('@/views/data/subject/index.vue'),
        meta: {
          locale: '议题管理',
          requiresAuth: true,
          roles: ['*'],
          hideInMenu: false,
        },
      },
      {
        path: 'scandal',
        name: 'Scandal',
        component: () => import('@/views/data/scandal/index.vue'),
        meta: {
          locale: '黑料管理',
          requiresAuth: true,
          roles: ['*'],
          hideInMenu: false,
        },
      },
      {
        path: 'social',
        name: 'Social',
        component: () => import('@/views/data/social/index.vue'),
        meta: {
          locale: '社交数据',
          requiresAuth: true,
          roles: ['*'],
          hideInMenu: false,
        },
      },
      {
        path: 'news',
        name: 'News',
        component: () => import('@/views/data/news/index.vue'),
        meta: {
          locale: '新闻',
          requiresAuth: true,
          roles: ['*'],
          hideInMenu: false,
        },
      },
    {
      path: 'assistant',
      name: 'aiAssistant',
      component: () => import('@/views/data/aiAssistant/index.vue'),
      meta: {
        locale: 'menu.data.aiAssistant',
        requiresAuth: true,
        icon: 'IconFile',
        roles: ['*'],
        hideInMenu: false,
      },
    },
  ],
};

export default DASHBOARD;
