<template>
  <a-layout class="flex-layout">
    <Breadcrumb />
    <a-card title="黑料描述" class="email-card">
      <a-descriptions>
        <a-descriptions-item label="名称">{{
          scandal.name
        }}</a-descriptions-item>
      </a-descriptions>
    </a-card>
    <Footer />
  </a-layout>
</template>

<script setup>
  import { reactive, onBeforeMount, ref } from 'vue';
  import Footer from '@/components/footer/index.vue';
  import { queryScandalDetail } from '@/api/scandal';
  import { useRoute } from 'vue-router';

  onBeforeMount(async () => {
    const route = useRoute();
    const id = Number(route.params.id); // 获取路由参数中的 id
    const res = await queryScandalDetail(id);
    scandal.value = reactive(res);
  });

  const scandal = ref({
  });
</script>

<style scoped>
  .email-card {
    margin-bottom: 20px;
  }
</style>
