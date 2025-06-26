<template>
  <a-layout class="flex-layout">
    <Breadcrumb />
    <a-card title="社交账号描述" class="social-card">
      <a-descriptions>
        <a-descriptions-item label="姓名">{{
          social.name
        }}</a-descriptions-item>
        <a-descriptions-item label="社交账户昵称">{{
          social.social_name
        }}</a-descriptions-item>
        <a-descriptions-item label="社交账户">{{
          social.social_account
        }}</a-descriptions-item>
        <a-descriptions-item label="国家/地区">{{
          social.country
        }}</a-descriptions-item>
        <a-descriptions-item label="性别">{{
          social.gender
        }}</a-descriptions-item>
        <a-descriptions-item label="政治面貌">{{
          social.political
        }}</a-descriptions-item>
        <a-descriptions-item label="其他信息">{{
          social.other_info
        }}</a-descriptions-item>
        <a-descriptions-item label="标签">{{
          social.tags
        }}</a-descriptions-item>
      </a-descriptions>
    </a-card>
    <Footer />
  </a-layout>
</template>

<script setup lang="ts">
  import { reactive, onBeforeMount, ref } from 'vue';
  import Footer from '@/components/footer/index.vue';
  import { querySocialAccountDetail } from '@/api/socialAccount';
  import { useRoute } from 'vue-router';

  onBeforeMount(async () => {
    const route = useRoute();
    const id = Number(route.params.id); // 获取路由参数中的 id
    const res = await querySocialAccountDetail(id);
    social.value = reactive(res);
  });

  const social = ref<any>();
</script>

<style scoped>
  .social-card {
    margin-bottom: 20px;
  }
</style>
