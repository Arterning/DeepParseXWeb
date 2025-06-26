<template>
  <a-layout class="flex-layout">
    <Breadcrumb />
    <a-card title="社交帖子描述" class="post-card">
      <a-descriptions>
        <a-descriptions-item label="标题">{{ post.name }}</a-descriptions-item>
        <a-descriptions-item label="发布时间">{{
          post.time
        }}</a-descriptions-item>
      </a-descriptions>
    </a-card>
    <Footer />
  </a-layout>
</template>

<script lang="ts" setup>
  import { reactive, onBeforeMount, ref } from 'vue';
  import Footer from '@/components/footer/index.vue';
  import { querySocialPostDetail } from '@/api/socialPost';
  import { useRoute } from 'vue-router';

  onBeforeMount(async () => {
    const route = useRoute();
    const id = Number(route.params.id); // 获取路由参数中的 id
    const res = await querySocialPostDetail(id);
    post.value = reactive(res);
  });

  const post = ref<any>();
</script>

<style scoped>
  .post-card {
    margin-bottom: 20px;
  }
</style>
