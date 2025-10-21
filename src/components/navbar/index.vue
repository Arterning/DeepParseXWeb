<template>
  <div class="navbar">
    <div class="left-side">
      <a-space>
        <div class="relative overflow-hidden p-2 rounded-lg text-white group">
          <!-- <span class="relative z-10"></span> -->
          
          <!-- 顶部流动条 -->
          <span class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-600 to-transparent animate-flow-x"></span>
          
          <!-- 右侧流动条 -->
          <span class="absolute top-0 right-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-blue-600 to-transparent animate-flow-y delay-100"></span>
          
          <!-- 底部流动条 -->
          <span class="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-600 to-transparent animate-flow-x delay-200"></span>
          
          <!-- 左侧流动条 -->
          <span class="absolute top-0 left-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-blue-600 to-transparent animate-flow-y delay-300"></span>
          
          <!-- 按钮底色 -->
          <!-- <span class="absolute inset-[2px] rounded-lg z-0"></span> -->

          <img
            alt="logo"
            src="@/assets/images/logo.png"
            style="width:2rem"
          />
        </div>
        <div
          :heading="5"
          :style="{ margin: 0, fontSize: '20px'}"
          class="tracking-wide cursor-pointer font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400 drop-shadow-md"
          >
          {{ $t('login.form.sub_title') }}
        </div>

        <icon-menu-fold
          v-if="!topMenu && appStore.device === 'mobile'"
          style="font-size: 22px; cursor: pointer"
          @click="toggleDrawerMenu"
        />

        
      </a-space>
    </div>

    
    <!-- <div class="mx-auto">
      <Menu v-if="topMenu" />
      <a-tooltip :content="$t('settings.search')" >
          <GlobalSearch />
        </a-tooltip>
    </div> -->
    
    <ul class="right-side">
      <li>
        <AIChat />
      </li>
      <!-- <li>
        <a-tooltip :content="$t('settings.language')">
          <a-button
            :shape="'circle'"
            class="nav-btn"
            type="outline"
            @click="setDropDownVisible"
          >
            <template #icon>
              <icon-language />
            </template>
          </a-button>
        </a-tooltip>
        <a-dropdown trigger="click" @select="changeLocale as any">
          <div ref="triggerBtn" class="trigger-btn"></div>
          <template #content>
            <a-doption
              v-for="item in locales"
              :key="item.value"
              :value="item.value"
            >
              <template #icon>
                <icon-check v-show="item.value === currentLocale" />
              </template>
              {{ item.label }}
            </a-doption>
          </template>
        </a-dropdown>
      </li> -->
      <li>
        <a-tooltip
          :content="
            theme === 'light'
              ? $t('settings.navbar.theme.toDark')
              : $t('settings.navbar.theme.toLight')
          "
        >
          <a-button
            :shape="'circle'"
            class="nav-btn"
            type="outline"
            @click="handleToggleTheme"
          >
            <template #icon>
              <icon-moon-fill v-if="theme === 'dark'" />
              <icon-sun-fill v-else />
            </template>
          </a-button>
        </a-tooltip>
      </li>
      <li>
        <a-tooltip
          :content="
            isFullscreen
              ? $t('settings.navbar.screen.toExit')
              : $t('settings.navbar.screen.toFull')
          "
        >
          <a-button
            :shape="'circle'"
            class="nav-btn"
            type="outline"
            @click="toggleFullScreen"
          >
            <template #icon>
              <icon-fullscreen-exit v-if="isFullscreen" />
              <icon-fullscreen v-else />
            </template>
          </a-button>
        </a-tooltip>
      </li>
      <!-- <li>
        <a-tooltip :content="$t('settings.title')">
          <a-button
            :shape="'circle'"
            class="nav-btn"
            type="outline"
            @click="setVisible"
          >
            <template #icon>
              <icon-settings />
            </template>
          </a-button>
        </a-tooltip>
      </li> -->
      <li>
        <a-dropdown trigger="click">
          <a-avatar
            :size="32"
            :style="{ marginRight: '8px', cursor: 'pointer' }"
          >
          <img v-if="!!avatar" :src="avatar" alt="avatar" />
          <IconUser v-else />
          </a-avatar>
          <template #content>
            <a-doption>
              <a-space @click="switchRoles">
                <icon-tag />
                <span> 切换角色 </span>
              </a-space>
            </a-doption>
            <a-doption>
              <a-space @click="$router.push({ name: 'Info' })">
                <icon-user />
                <span> 个人信息 </span>
              </a-space>
            </a-doption>
            <a-doption>
              <a-space @click="setVisible">
                <icon-settings />
                <span> 用户设置 </span>
              </a-space>
            </a-doption>
            <a-doption>
              <a-space @click="handleLogout">
                <icon-export />
                <span> 退出登录 </span>
              </a-space>
            </a-doption>
          </template>
        </a-dropdown>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
  import { computed, inject, ref } from 'vue';
  import { useDark, useFullscreen, useToggle } from '@vueuse/core';
  import { useAppStore, useUserStore } from '@/store';
  import { LOCALE_OPTIONS } from '@/locale';
  import useLocale from '@/hooks/locale';
  import useUser from '@/hooks/user';
  import Menu from '@/components/menu/index.vue';
  import { IconUser } from '@arco-design/web-vue/es/icon';
  import GlobalSearch from '@/components/global-search/index.vue';
  import AIChat from '@/components/aichat/index.vue';
  import { useI18n } from 'vue-i18n';

  const appStore = useAppStore();
  const userStore = useUserStore();
  const { logout } = useUser();
  const { changeLocale, currentLocale } = useLocale();
  const { isFullscreen, toggle: toggleFullScreen } = useFullscreen();
  const locales = [...LOCALE_OPTIONS];
  const { t } = useI18n();
  const avatar = computed(() => {
    return userStore.avatar;
  });
  const theme = computed(() => {
    return appStore.theme;
  });
  const topMenu = computed(() => appStore.topMenu && appStore.menu);
  const isDark = useDark({
    selector: 'body',
    attribute: 'arco-theme',
    valueDark: 'dark',
    valueLight: 'light',
    storageKey: 'arco-theme',
    onChanged(dark: boolean) {
      // overridden default behavior
      appStore.toggleTheme(dark);
    },
  });
  const toggleTheme = useToggle(isDark);
  const handleToggleTheme = () => {
    toggleTheme();
  };
  const setVisible = () => {
    appStore.updateSettings({ globalSettings: true });
  };
  const triggerBtn = ref();
  const handleLogout = () => {
    logout();
  };
  const setDropDownVisible = () => {
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    triggerBtn.value.dispatchEvent(event);
  };
  const switchRoles = async () => {
    // const res = await userStore.switchRoles();
    // Message.success(res as string);
  };
  const toggleDrawerMenu = inject('toggleDrawerMenu') as () => void;
</script>

<style lang="less" scoped>
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    background-color: var(--color-bg-2);
    border-bottom: 1px solid var(--color-border);
  }

  .left-side {
    display: flex;
    align-items: center;
    padding-left: 20px;
  }

  .center-side {
    flex: 1;
  }

  .right-side {
    display: flex;
    padding-right: 20px;
    list-style: none;

    :deep(.locale-select) {
      border-radius: 20px;
    }

    li {
      display: flex;
      align-items: center;
      padding: 0 10px;
    }

    a {
      color: var(--color-text-1);
      text-decoration: none;
    }

    .nav-btn {
      border-color: rgb(var(--gray-2));
      color: rgb(var(--gray-8));
      font-size: 16px;
    }

    .trigger-btn,
    .ref-btn {
      position: absolute;
      bottom: 14px;
    }

    .trigger-btn {
      margin-left: 14px;
    }
  }
</style>

<style lang="less">
  .message-popover {
    .arco-popover-content {
      margin-top: 0;
    }
  }

  @keyframes flow-x {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    @keyframes flow-y {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100%); }
    }
    .animate-flow-x {
      animation: flow-x 2s linear infinite;
    }
    .animate-flow-y {
      animation: flow-y 2s linear infinite;
    }
</style>
