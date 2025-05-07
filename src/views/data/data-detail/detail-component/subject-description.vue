<template>
  <a-layout class="flex-layout">
    <Breadcrumb />
    <a-card title="议题描述" class="email-card">
      <a-descriptions>
        <a-descriptions-item label="名称">{{
          subject.name
        }}</a-descriptions-item>
        <a-descriptions-item label="来源">{{
          subject.source
        }}</a-descriptions-item>
      </a-descriptions>
    </a-card>
    <Footer />
  </a-layout>
</template>

<script setup>
  import { reactive, onBeforeMount, ref } from 'vue';
  import Footer from '@/components/footer/index.vue';
  import { querySubjectDetail } from '@/api/subject';
  import { useRoute } from 'vue-router';

  onBeforeMount(async () => {
    const route = useRoute();
    const id = Number(route.params.id); // 获取路由参数中的 id
    const res = await querySubjectDetail(id);
    subject.value = reactive(res);
  });

  const subject = ref({
  });
</script>

<style scoped>
  .email-card {
    margin-bottom: 20px;
  }
</style>
