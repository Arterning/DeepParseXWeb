<template>
  <a-layout class="flex-layout">
    <Breadcrumb />
    <a-card title="新闻描述" class="news-card">
      <a-descriptions>
        <a-descriptions-item label="新闻标题">{{
          news.name
        }}</a-descriptions-item>
        <a-descriptions-item label="新闻简介">{{
          news.summary
        }}</a-descriptions-item>
        <a-descriptions-item label="新闻类型">{{
          news.news_type
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
          news.time
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
  import { reactive, onBeforeMount, ref } from 'vue';
  import Footer from '@/components/footer/index.vue';
  import { queryNewsDetail } from '@/api/news';
  import { useRoute } from 'vue-router';

  onBeforeMount(async () => {
    const route = useRoute();
    const id = Number(route.params.id); // 获取路由参数中的 id
    const res = await queryNewsDetail(id);
    news.value = reactive(res);
  });

  const news = ref({
  });
</script>

<style scoped>
  .news-card {
    margin-bottom: 20px;
  }
</style>
