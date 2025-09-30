<template>
  <a-layout class="flex-layout">
    <a-card class="general-card">
      <a-tabs default-active-key="1">

        <a-tab-pane key="1">
          <template #title> <icon-layers /> 实体 </template>
          <EntityInfo />
        </a-tab-pane>

        <a-tab-pane key="2">
          <template #title> <icon-share-alt /> 关系 </template>
          <SPOTable />
        </a-tab-pane>

        
      </a-tabs>
    </a-card>
    <Footer />
  </a-layout>
</template>

<script setup lang="ts">
  import EntityInfo from './entity-info.vue';
  import SPOTable from './spo.vue';
  import Footer from '@/components/footer/index.vue';
</script>
