<template>
    <Breadcrumb />
    <div class="general-card">
      <a-card class="content-box">
      <a-tabs default-active-key="1">
        <a-tab-pane key="1">
          <template #title>
            基本信息
          </template>
          <GeneralDetail :info="info" :person="{}" />
        </a-tab-pane>
        <a-tab-pane key="2">
          <template #title>
            新闻管理
          </template>
          <NewsDetail :info="info" :person="{}" />
        </a-tab-pane>
        <a-tab-pane key="3">
          <template #title>
            社交记录管理
          </template>
          <SocialDetail :info="info" :person="{}" />
        </a-tab-pane>
        <a-tab-pane key="4">
          <template #title>
            邮件管理
          </template>
          <EmailDetail :info="info" :person="{}" />
        </a-tab-pane>
        <a-tab-pane key="5">
          <template #title>
            黑料管理
          </template>
          <BlackDetail :info="info" :person="{}" />
        </a-tab-pane>
        <a-tab-pane key="6">
          <template #title>
            其他记录
          </template>
          <OtherDetail :info="info" :person="{}" />
        </a-tab-pane>
      </a-tabs>
    </a-card>
    </div>
    <!-- <div class="general-card">
      <a-card class="content-box">
        <GeneralDetail :info="info" :person="{}" />
      </a-card>
    </div> -->

    <Footer />
  </template>

<script setup lang="ts">
import { PersonRes } from '@/api/person';
import useLoading from '@/hooks/loading';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore, useTabBarStore } from '@/store';
// import { ref } from 'vue';

import Footer from '@/components/footer/index.vue';

import { Form, FormItem } from '@arco-design/web-vue';

import GeneralDetail from './general-detail.vue';
import EmailDetail from './email-detail.vue';
import BlackDetail from './black-detail.vue';
import NewsDetail from './news-detail.vue';
import SocialDetail from './social-detail.vue';
import OtherDetail from './other-detail.vue';

// import Breadcrumb from '@/components/Breadcrumb.vue';
// 局部导入 Arco Design 组件

const info = ref<PersonRes>();
const route = useRoute();
const { loading, setLoading } = useLoading(true);
const userStore = useUserStore();

const { id } = route.params;

onMounted(() => {
  setLoading(true);
  const max = 30 * 1000; // 超时时间
  const slice = 200; // 每次检查间隔时间
  const maxNumber = max / slice;
  let count = 0
  if (id) {
    const inter = setInterval(() => {
      // info.value = userStore.get.get(Number(id));
      count += 1;
      if (info.value || count >= maxNumber) {
        setLoading(false);
        clearInterval(inter);
      }
    }, slice)
  }
})
</script>

<style scoped>
/* 可根据需要添加样式 */
</style>