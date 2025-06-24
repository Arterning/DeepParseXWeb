<template>
  <div class="container">
    <a-layout style="padding: 0 18px">
      <!-- <Breadcrumb :items="[$t('menu.data'), $t('搜索')]" /> -->
      <a-card :title="$t(' ')" class="general-card min-h-screen">
        <a-tabs default-active-key="2">
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
import TextSearch from './text-search.vue';
import SimilarSearch from './similar-search.vue';
import { onActivated } from 'vue';
import { changeTheme } from '@/hooks/theme';


onActivated(() => {
  changeTheme();
})

</script>
