<template>
  <a-layout class="flex-layout">
    <Breadcrumb />
    <a-card title="黑料描述" class="email-card">
      <a-descriptions>
        <a-descriptions-item label="id">{{
            email.name
          }}</a-descriptions-item>
        <a-descriptions-item label="名称">{{
            email.country
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
  name: '示例',
  country: '中国',
});
</script>

<style scoped>
.email-card {
  margin-bottom: 20px;
}
</style>
