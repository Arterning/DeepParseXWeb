<template>
  <div class="container">
    <a-layout class="flex-layout">
      <!-- <Breadcrumb :items="[$t('menu.data'), $t('搜索')]" /> -->
      <a-card :title="$t(' ')" class="general-card mt-8 min-h-screen">
        <a-tabs default-active-key="1">
          <a-tab-pane key="1" title="分词检索">
            <TextSearch />
          </a-tab-pane>
          <a-tab-pane key="2" title="相似检索">
            <SimilarSearch />
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </a-layout>
  </div>
  <div class="footer">
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Footer from '@/components/footer/index.vue';
import TextSearch from './text-search.vue';
import SimilarSearch from './similar-search.vue';
</script>
