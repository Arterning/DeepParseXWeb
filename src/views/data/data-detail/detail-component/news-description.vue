<template>
  <a-layout class="flex-layout">
    <Breadcrumb />
    <a-card title="新闻描述" class="news-card">
      <a-descriptions>
        <a-descriptions-item label="新闻标题">{{
            news.title
          }}</a-descriptions-item>
        <a-descriptions-item label="新闻简介">{{
            news.summary
          }}</a-descriptions-item>
        <a-descriptions-item label="新闻类型">{{
            news.type
          }}</a-descriptions-item>
        <a-descriptions-item label="新闻来源">{{
            news.source
          }}</a-descriptions-item>
        <a-descriptions-item label="新闻组织">{{
            news.organization
          }}</a-descriptions-item>
        <a-descriptions-item label="新闻作者">{{
            news.author
          }}</a-descriptions-item>
        <a-descriptions-item label="新闻时间">{{
            news.date
          }}</a-descriptions-item>
        <a-descriptions-item label="新闻地点">{{
            news.location
          }}</a-descriptions-item>
      </a-descriptions>
    </a-card>
    <Footer />
  </a-layout>
</template>

<script setup>
  import { reactive } from 'vue';
  import Footer from "@/components/footer/index.vue";

  const news = reactive({
    title: '示例新闻',
    summary: '这是一个新闻摘要',
    type: '政治',
    source: '某新闻社',
    organization: '某组织',
    author: '作者名',
    date: '2023-10-01',
    location: '某地',
  });
</script>

<style scoped>
  .news-card {
    margin-bottom: 20px;
  }
</style>
