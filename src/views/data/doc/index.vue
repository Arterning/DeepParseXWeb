<template>
  <a-layout class="flex-layout">
    <Breadcrumb />
    <div class="general-card">
      <a-tabs default-active-key="1">
        <a-tab-pane key="1">
          <template #title>
            <icon-layers /> 所有
          </template>
          <AllTable />
        </a-tab-pane>
        <a-tab-pane key="2">
          <template #title>
            <icon-file-image /> 图片
          </template>
          <PictureTable />
        </a-tab-pane>
        <a-tab-pane key="3">
          <template #title>
            <icon-file-video /> 媒体
          </template>
          <MediaTable />
        </a-tab-pane>
        <a-tab-pane key="4">
          <template #title>
            <icon-file /> 文本
          </template>
          <TextTable />
        </a-tab-pane>
        <a-tab-pane key="5">
          <template #title>
            <icon-nav /> Excel
          </template>
          <ExcelTable />
        </a-tab-pane>
        <a-tab-pane key="6">
          <template #title>
            <icon-file-pdf /> PDF
          </template>
          <PDFTable />
        </a-tab-pane>
      </a-tabs>
    </div>
    <Footer />
  </a-layout>
</template>

<script setup lang="ts">
import AllTable from '@/views/data/doc/components/all-table.vue'
import PDFTable from '@/views/data/doc/components/pdf-table.vue'
import PictureTable from '@/views/data/doc/components/picture-table.vue'
import MediaTable from '@/views/data/doc/components/media-table.vue'
import TextTable from '@/views/data/doc/components/text-table.vue'
import EmailTable from '@/views/data/doc/components/email-table.vue'
import ExcelTable from '@/views/data/doc/components/excel-table.vue'
import Footer from '@/components/footer/index.vue';
</script>
