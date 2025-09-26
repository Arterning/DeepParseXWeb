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
      path: 'upload-task',
      name: 'UploadTask',
      component: () => import('@/views/data/upload-task/index.vue'),
      meta: {
        locale: 'menu.data.uploadTask',
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
      path: 'mailmsg-detail/:id',
      name: 'MailMsgDetail',
      component: () => import('@/views/data/mailmsg-detail/index.vue'),
      meta: {
        locale: 'menu.data.mailmsg.detail',
        requiresAuth: true,
        roles: ['*'],
        hideInMenu: true,
      },
    },
    {
      path: 'mailbox-detail/:id',
      name: 'MailBoxDetail',
      component: () => import('@/views/data/mailbox-detail/index.vue'),
      meta: {
        locale: 'menu.data.mailbox.detail',
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
      path: 'entity',
      name: 'Entity',
      component: () => import('@/views/data/entity/index.vue'),
      meta: {
        locale: '要素提取',
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
