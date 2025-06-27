<template>
  <a-layout class="flex-layout">
    <!-- <Breadcrumb /> -->
    <div class="general-card mt-8">
      <AllTable />
    </div>
    <Footer />
  </a-layout>
</template>

<script setup lang="ts">
import AllTable from '@/views/data/doc/components/all-table.vue'
import Footer from '@/components/footer/index.vue';
import { onActivated } from 'vue';
import { changeTheme } from '@/hooks/theme';


onActivated(() => {
  changeTheme();
})
</script>
