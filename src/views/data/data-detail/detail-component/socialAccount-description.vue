<template>
  <a-layout class="flex-layout">
    <Breadcrumb />
    <a-card title="社交账号描述" class="social-card">
      <a-descriptions>
        <a-descriptions-item label="姓名">{{ social.name }}</a-descriptions-item>
        <a-descriptions-item label="社交账户昵称">{{
            social.nickname
          }}</a-descriptions-item>
        <a-descriptions-item label="社交账户">{{
            social.account
          }}</a-descriptions-item>
        <a-descriptions-item label="国家/地区">{{
            social.country
          }}</a-descriptions-item>
        <a-descriptions-item label="性别">{{
            social.gender
          }}</a-descriptions-item>
        <a-descriptions-item label="政治面貌">{{
            social.politics
          }}</a-descriptions-item>
        <a-descriptions-item label="其他信息">{{
            social.otherInfo
          }}</a-descriptions-item>
        <a-descriptions-item label="标签">{{ social.tags }}</a-descriptions-item>
      </a-descriptions>
    </a-card>
    <Footer />
  </a-layout>
</template>

<script setup>
  import { reactive } from 'vue';
  import Footer from "@/components/footer/index.vue";

  const social = reactive({
    name: '张三',
    nickname: '三哥',
    account: 'zhangsan123',
    country: '中国',
    gender: '男',
    politics: '群众',
    otherInfo: '其他信息',
    tags: '活跃用户',
  });
</script>

<style scoped>
  .social-card {
    margin-bottom: 20px;
  }
</style>
