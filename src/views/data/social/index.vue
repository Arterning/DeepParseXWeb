<template>
    <a-layout class="flex-layout">
      <Breadcrumb />
      <div class="general-card">
        <a-tabs default-active-key="1">
          
          <a-tab-pane key="1">
            <template #title>
              <icon-layers /> 社交帖子
            </template>
            <SocialPostTable />
          </a-tab-pane>
          
          <a-tab-pane key="2">
            <template #title>
              <icon-file /> 社交账号
            </template>
            <SocialAccountTable />
          </a-tab-pane>
        </a-tabs>
      </div>
      <Footer />
    </a-layout>
  </template>
  
  <script setup lang="ts">
  import SocialAccountTable from '@/views/data/social-account/index.vue'
  import SocialPostTable from '@/views/data/social-post/index.vue'
  </script>
  