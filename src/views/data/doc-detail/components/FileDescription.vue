<template>
  <a-card class="info-card">
    <template #title>
      <div class="flex gap-5 items-center justify-between">
        <ReactSvg class="w-8 h-8" />
        <a-button type="primary" @click="handleExtractSummary" :loading="loading">提取文件总结</a-button>
      </div>
    </template>
    <p class="text-xl max-w-6xl whitespace-pre-wrap break-words p-4 rounded-lg">
      {{ description }}
    </p>
  </a-card>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import ReactSvg from '@/assets/svg/react.svg';
import { chat } from '@/api/ai';

const props = defineProps<{
  info: any;
}>();

const loading = ref(false);
const description = ref(props.info.desc || '');

const handleExtractSummary = async () => {
  loading.value = true;
  try {
    const response = await chat({
      question: `请根据以下文件内容生成一个简洁的摘要：\n${props.info.content}`
    });
    description.value = response;
  } catch (error) {
    console.error('提取摘要失败：', error);
  } finally {
    loading.value = false;
  }
};
</script>