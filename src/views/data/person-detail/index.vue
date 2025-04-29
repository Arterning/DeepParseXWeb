<template>
    <Breadcrumb />
    <div class="general-card">
      <a-card class="content-box" :loading="loading">
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
            邮件
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

    <Footer />
  </template>

<script setup lang="ts">
import { PersonRes, queryPersonDetail } from '@/api/person';
import useLoading from '@/hooks/loading';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import Footer from '@/components/footer/index.vue';
import EmailDetail from './email-detail.vue';
import BlackDetail from './black-detail.vue';
import NewsDetail from './news-detail.vue';
import SocialDetail from './social-detail.vue';
import OtherDetail from './other-detail.vue';


const info = ref<PersonRes>();
const route = useRoute();
const { loading, setLoading } = useLoading(true);

const { id } = route.params;

onMounted(async () => {
  setLoading(true);
  if (id) {
    info.value = await queryPersonDetail(Number(id));
  }
  setLoading(false);
})
</script>

<style scoped>
/* 可根据需要添加样式 */
</style>