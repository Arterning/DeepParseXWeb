<template>
  <a-layout class="flex-layout">
    <!-- <Breadcrumb /> -->
    <a-card class="general-card" title="文件数据">
      <FileTable />
    </a-card >
    <Footer />
  </a-layout>
</template>

<script setup lang="ts">
  import FileTable from '@/views/data/doc/components/all-table.vue';
  import Footer from '@/components/footer/index.vue';
  import { onActivated } from 'vue';
  import { changeTheme } from '@/hooks/theme';

  onActivated(() => {
    changeTheme();
  });
</script>
