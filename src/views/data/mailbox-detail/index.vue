<template>
  <a-layout class="flex-layout">
    <a-card title="邮箱描述" class="general-card">
      <Breadcrumb />
      <a-descriptions>
        <a-descriptions-item label="邮件名称">{{
          mailbox?.name
        }}</a-descriptions-item>
        <a-descriptions-item label="国家/地区">{{
          mailbox?.country
        }}</a-descriptions-item>
        <a-descriptions-item label="标签">{{
          mailbox?.tags
        }}</a-descriptions-item>
        <a-descriptions-item label="邮件数量">{{
          mailbox?.count
        }}</a-descriptions-item>
        <a-descriptions-item label="其他信息">{{
          mailbox?.other_info
        }}</a-descriptions-item>
      </a-descriptions>
    </a-card>
    <Footer />
  </a-layout>
</template>

<script lang="ts" setup>
  import { reactive, onBeforeMount, ref } from 'vue';
  import Footer from '@/components/footer/index.vue';
  import { queryMailBoxDetail, MailBoxRes } from '@/api/mailbox';
  import { useRoute } from 'vue-router';

  const mailbox = ref<MailBoxRes>();

  onBeforeMount(async () => {
    const route = useRoute();
    const id = Number(route.params.id); // 获取路由参数中的 id
    mailbox.value = await queryMailBoxDetail(id);
  });
</script>

<style scoped>
  .email-card {
    margin-bottom: 20px;
  }
</style>
