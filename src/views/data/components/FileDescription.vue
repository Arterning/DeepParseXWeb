<template>
  <a-card class="info-card">
    <template #title>
      <div class="flex gap-5 items-center justify-between">
        <ReactSvg class="w-8 h-8" />
        <a-button type="primary" @click="handleExtractSummary" :loading="loading">提取文件总结</a-button>
      </div>
    </template>
    <a-skeleton-line v-if="loading" :rows="8" />
    <!-- <p class="text-xl max-w-6xl whitespace-pre-wrap break-words p-4 rounded-lg">
      {{ description }}
    </p> -->
    <MdPreview :theme=theme previewTheme="github" :model-value="description" class="p-2 rounded-lg" />
  </a-card>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import ReactSvg from '@/assets/svg/react.svg';
import { summarize } from '@/api/ai';
import { useAppStore } from '@/store';

const appStore = useAppStore();

const theme = computed(() => {
    return appStore.theme;
});

const props = defineProps<{
  info: any;
}>();

const loading = ref(false);
const description = ref(props.info.desc || '点击提取按钮，提取文件总结🚀');

const handleExtractSummary = async () => {
  loading.value = true;
  try {
    const response = await summarize({
      id: props.info.id,
    });
    description.value = response;
  } catch (error) {
    console.error('提取摘要失败：', error);
  } finally {
    loading.value = false;
  }
};
</script>