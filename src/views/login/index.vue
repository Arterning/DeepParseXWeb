<template>
  <div class="container">
    <div class="logo">
      <img
        alt="logo"
        src="@/assets/images/logo.png"
        style="width:2rem"
      />
      <div class="logo-text">{{ $t('login.form.sub_title') }}</div>
    </div>
    <LoginBanner />
    <div class="content">
      <div class="content-inner">
        <!-- 第三方登录方式（显示一键登录按钮） -->
        <div v-if="hasAccessTicket" class="one-click-login-container">
          <h2 class="text-xl font-medium mb-6 text-center">{{ '第三方账号登录' }}</h2>
          <div class="flex justify-center">
            <a-button 
              type="primary" 
              size="large" 
              :loading="isLoggingIn" 
              @click="handleOneClickLogin"
              class="w-64 bg-blue-500 hover:bg-blue-600"
            >
              {{ '一键登录' }}
            </a-button>
          </div>
        </div>
        
        <!-- 传统登录方式（显示登录表单） -->
        <LoginForm v-else />
      </div>
      <div class="footer">
        <Footer />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { Message } from '@arco-design/web-vue';
  import Footer from '@/components/footer/index.vue';
  import LoginBanner from './components/banner.vue';
  import LoginForm from './components/login-form.vue';
  import { useI18n } from 'vue-i18n';
  import { thirdPartyLogin } from '@/api/auth';
  import { clearToken, setToken } from '@/utils/auth';

  const { t } = useI18n();
  const router = useRouter();
  const route = useRoute();
  
  // 响应式数据
  const accessTicket = ref<string | null>(null);
  const isLoggingIn = ref(false);
  
  // 计算属性：是否有访问票据
  const hasAccessTicket = computed(() => {
    return accessTicket.value !== null;
  });
  
  // 从URL获取参数
  const getUrlParams = () => {
    // 支持从route.query获取参数（Vue Router）
    if (route.query.accessTicket) {
      accessTicket.value = String(route.query.accessTicket);
      return;
    }
    
    // 同时支持直接从window.location获取，确保兼容性
    const urlParams = new URLSearchParams(window.location.search);
    const ticket = urlParams.get('accessTicket');
    if (ticket) {
      accessTicket.value = ticket;
    }
  };
  
  // 处理一键登录
  const handleOneClickLogin = async () => {
    if (!accessTicket.value) {
      Message.error('登录票据无效');
      return;
    }
    
    isLoggingIn.value = true;
    try {
      // 调用第三方登录接口，传入ticket参数
      const result = await thirdPartyLogin({
        ticket: accessTicket.value
      });
      
      // 保存token到localStorage
      setToken(result.access_token);  
      
      if (result) {
        Message.success('登录成功');
        // 登录成功后跳转到首页或指定页面
        router.push('/');
      }
    } catch (error) {
      console.error('一键登录失败:', error);
      Message.error('登录失败，请重试');
    } finally {
      isLoggingIn.value = false;
    }
  };
  
  // 组件挂载时获取URL参数
  onMounted(() => {
    getUrlParams();
  });
</script>

<style lang="less" scoped>
  .container {
    display: flex;
    height: 100vh;

    .banner {
      width: 550px;
      background: linear-gradient(163.85deg, #021946 0%, #1c7db9 100%);
  }

  .content {
      position: relative;
    display: flex;
    flex: 1;
      justify-content: center;
      align-items: center;
      padding-bottom: 40px;
  }

  .footer {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 100%;
  }
  }

  .logo {
    position: fixed;
    top: 24px;
    left: 22px;
    z-index: 1;
    display: inline-flex;
    align-items: center;

    &-text {
      margin-right: 4px;
      margin-left: 4px;
      color: var(--color-fill-1);
      font-size: 20px;
  }
  }
</style>

<style lang="less" scoped>
  // responsive
  @media (max-width: @screen-lg) {
    .container {
      .banner {
        width: 25%;
    }
    }
  }
</style>
