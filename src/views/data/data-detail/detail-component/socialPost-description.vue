<template>
  <a-layout class="flex-layout">
    <Breadcrumb />
    <a-card :title="$t('社交帖子')" class="general-card">
      <a-descriptions>
        <a-descriptions-item label="名称">{{ post.name }}</a-descriptions-item>
        <a-descriptions-item label="发布时间">{{
          post.publishTime
        }}</a-descriptions-item>
      </a-descriptions>
    </a-card>
    <Footer />
  </a-layout>
</template>

<script setup>
  import { reactive } from 'vue';
  import Footer from '@/components/footer/index.vue';

  const post = reactive({
    name: '示例帖子',
    publishTime: '2023-10-01 10:00',
  });
</script>

<style scoped>
  .post-card {
    margin-bottom: 20px;
  }
</style>
