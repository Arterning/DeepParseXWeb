<template>
  <a-layout class="flex-layout">
    <!-- <Breadcrumb /> -->
    <div class="general-card mt-8">
      <FileTable />
    </div>
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
