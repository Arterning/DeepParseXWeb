<template>
  <a-layout class="flex-layout">
    <Breadcrumb />
    <a-card title="资产描述" class="email-card">
      <a-descriptions>
        <a-descriptions-item label="资产名称">{{
            assets.assets_name
        }}</a-descriptions-item>
        <a-descriptions-item label="ip地址">{{
            assets.ip_addr
        }}</a-descriptions-item>
        <a-descriptions-item label="端口号">{{
            assets.assets_ports
        }}</a-descriptions-item>
        <a-descriptions-item label="服务">{{
            assets.assets_status
        }}</a-descriptions-item>
        <a-descriptions-item label="描述">{{
            assets.assets_desc
        }}</a-descriptions-item>
      </a-descriptions>
    </a-card>
    <Footer />
  </a-layout>
</template>

<script setup>
  import { reactive, onBeforeMount, ref } from 'vue';
  import Footer from '@/components/footer/index.vue';
  import { useRoute } from 'vue-router';
  import { querySysAssetsDetail } from '@/api/assets';

  const assets = ref({
  });

  onBeforeMount(async () => {
    const route = useRoute();
    const id = Number(route.params.id); // 获取路由参数中的 id
    const res = await querySysAssetsDetail(id);
    assets.value = reactive(res);
  });
</script>

<style scoped>
  .email-card {
    margin-bottom: 20px;
  }
</style>
