import type { Router } from 'vue-router';
import { useAppStore } from '@/store';
import { setRouteEmitter } from '@/utils/route-listener';
import setupUserLoginInfoGuard from './userLoginInfo';
import setupPermissionGuard from './permission';

function setupPageGuard(router: Router) {
  router.beforeEach(async (to) => {
    // emit route change
    setRouteEmitter(to);
  });
}

function setupLinearGradient(router: Router) {
  router.afterEach((to, from) => {
    const themeStore = useAppStore();
    // 检查是否为浅色模式
    // console.log("检查是否为浅色模式")
    if (themeStore.theme === 'light') {
      const cards = document.querySelectorAll('.general-card');
      cards.forEach((card: any) => {
        card.style.background = 'linear-gradient(146.3deg, #F0F1F7 11.56%, #D5D7E0 80%)';
      });
    }
  });
}


export default function createRouteGuard(router: Router) {
  setupPageGuard(router);
  setupUserLoginInfoGuard(router);
  setupPermissionGuard(router);

  setupLinearGradient(router);
}
