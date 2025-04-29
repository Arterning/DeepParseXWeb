<template>
  <a-layout class="flex-layout">
    <Breadcrumb />
    <a-card title="邮箱描述" class="email-card">
      <a-descriptions>
        <a-descriptions-item label="邮件名称">{{
            email.name
          }}</a-descriptions-item>
        <a-descriptions-item label="国家/地区">{{
            email.country
          }}</a-descriptions-item>
        <a-descriptions-item label="标签">{{ email.tags }}</a-descriptions-item>
        <a-descriptions-item label="邮件数量">{{
            email.count
          }}</a-descriptions-item>
        <a-descriptions-item label="其他信息">{{
            email.otherInfo
          }}</a-descriptions-item>
      </a-descriptions>
    </a-card>
    <Footer />
  </a-layout>
</template>

<script setup>
  import { reactive } from 'vue';
  import Footer from "@/components/footer/index.vue";

  const email = reactive({
    name: '示例邮件',
    country: '中国',
    tags: '重要',
    count: 10,
    otherInfo: '其他信息',
  });
</script>

<style scoped>
  .email-card {
    margin-bottom: 20px;
  }
</style>
