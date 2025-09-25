<template>
  <a-layout class="flex-layout">
    <!-- <Breadcrumb /> -->
    <div class="general-card mt-8">
      <a-tabs default-active-key="1">
        
        <a-tab-pane key="1">
          <template #title> <icon-file /> 文件 </template>
          <FileTable />
        </a-tab-pane>

        <a-tab-pane key="2">
          <template #title> <icon-list /> 上传任务 </template>
          <UploadTaskTable />
        </a-tab-pane>
        
      </a-tabs>
    </div>
    <Footer />
  </a-layout>
</template>

<script setup lang="ts">
  import FileTable from '@/views/data/doc/components/all-table.vue';
  import UploadTaskTable from '@/views/data/doc/components/upload-task.vue';
  import Footer from '@/components/footer/index.vue';
  import { onActivated } from 'vue';
  import { changeTheme } from '@/hooks/theme';

  onActivated(() => {
    changeTheme();
  });
</script>
