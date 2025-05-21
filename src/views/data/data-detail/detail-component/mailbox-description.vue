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
          email.other_info
        }}</a-descriptions-item>
      </a-descriptions>
    </a-card>
    <Footer />
  </a-layout>
</template>

<script lang="ts" setup>
  import { reactive, onBeforeMount, ref } from 'vue';
  import Footer from '@/components/footer/index.vue';
  import { queryMailBoxDetail } from '@/api/mailbox';
  import { useRoute } from 'vue-router';

  const email = ref({
  });

  onBeforeMount(async () => {
    const route = useRoute();
    const id = Number(route.params.id); // 获取路由参数中的 id
    const res = await queryMailBoxDetail(id);
    email.value = reactive(res);
  });
</script>

<style scoped>
  .email-card {
    margin-bottom: 20px;
  }
</style>
