import localeLogin from '@/views/login/locale/zh-CN';
import localeSysMenu from '@/views/admin/menu/locale/zh-CN';
import localeWorkplace from '@/views/dashboard/workplace/locale/zh-CN';
import localeLogLogin from '@/views/log/login/locale/zh-CN';
import localeIconPicker from '@/components/icon-picker/locale/zh-CN';
import localeLogOpera from '@/views/log/opera/locale/zh-CN';
import localeSysDept from '@/views/admin/dept/locale/zh-CN';
import localeSysApi from '@/views/admin/api/locale/zh-CN';
import localeServerMonitor from '@/views/monitor/server/locale/zh-CN';
import localeRedisMonitor from '@/views/monitor/redis/locale/zh-CN';
import localSysDoc from '@/views/data/doc/locale/zh-CN';
import localSysOrg from '@/views/data/org/locale/zh-CN';
import localeSysAssets from '@/views/data/assets/locale/zh-CN';
import localeSysUser from '@/views/admin/user/locale/zh-CN';
import localeSysRole from '@/views/admin/role/locale/zh-CN';
import localeGenerator from '@/views/automation/code-generator/local/zh-CN';
import localeSettings from './zh-CN/settings';

export default {
  'menu.dashboard': '仪表盘',
  'menu.admin': '系统管理',
  'menu.automation': '系统自动化',
  'menu.log': '日志',
  'menu.monitor': '系统监控',
  'menu.arcoWebsite': 'Arco Design',
  'menu.faq': '常见问题',
  'menu.github': 'GitHub',
  'menu.sponsor': '赞助',
  'menu.data.tag': '我的标签',
  'menu.data.event': '热点事件',
  'menu.data.mailbox': '邮箱管理',
  'menu.data.mailmsg': '邮件管理',
  'menu.data.person': '人物管理',
  'navbar.action.locale': '切换为中文',
  'modal.title.tips': '温馨提示',
  'modal.title.tips.delete': '确定要删除吗？',
  'switch.open': '开启',
  'switch.close': '关闭',
  'submit.create.success': '创建成功',
  'submit.update.success': '更新成功',
  'submit.delete.success': '删除成功',
  'submit.execute.success': '执行成功',
  'submit.execute.fail': '执行失败',
  'copy.success': '复制成功',
  'copy.error': '复制失败',
  ...localeSettings,
  ...localeLogin,
  ...localeWorkplace,
  ...localeLogLogin,
  ...localeSysMenu,
  ...localeIconPicker,
  ...localeLogOpera,
  ...localeSysDept,
  ...localeSysApi,
  ...localeServerMonitor,
  ...localeRedisMonitor,
  ...localeSysUser,
  ...localeSysRole,
  ...localeGenerator,
  ...localSysDoc,
  ...localSysOrg,
  ...localeSysAssets
};
