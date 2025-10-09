<template>
  <a-card class="info-card">
    <template #title>
      <div class="flex flex-wrap gap-4 items-center justify-between">
        <div class="flex items-center gap-2">
          <GlobeSvg class="w-6 h-6 text-blue-500" />
          <span class="text-lg font-medium text-gray-800 dark:text-white">文件翻译</span>
        </div>
        <div class="flex flex-wrap gap-3">
          <!-- <a-select 
            v-model="targetLanguage" 
            style="width: 150px" 
            :options="languageOptions"
            class="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
          /> -->
          <a-button 
            type="primary" 
            @click="handleExtractTranslation" 
            :loading="loading"
            class="bg-blue-500 hover:bg-blue-600 text-white"
          >
            提取翻译
          </a-button>
        </div>
      </div>
    </template>
    <a-skeleton-line v-if="loading" :rows="8" class="p-4" />
    <div v-else class="p-4 rounded-lg bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 min-h-[200px]">
      <p v-if="!translation" class="text-center text-gray-500 dark:text-gray-400 py-8 italic">
        点击提取按钮，提取文件翻译 🚀
      </p>
      <div v-else class="whitespace-pre-wrap break-words text-gray-800 dark:text-gray-200">
        {{ translation }}
      </div>
    </div>
  </a-card>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import GlobeSvg from '@/assets/svg/globe.svg';
import { useAppStore } from '@/store';
import { translate } from '@/api/ai';

defineOptions({
  name: 'FileTranslation'
});

const appStore = useAppStore();

const theme = computed(() => {
  return appStore.theme;
});

const props = defineProps<{
  info: any;
}>();

const loading = ref(false);
const translation = ref<string>(props.info.translation || '');
const targetLanguage = ref<string>('zh_CN'); // 默认翻译成中文

// 语言选项
// const languageOptions = [
//   { label: '中文', value: 'zh_CN' },
//   { label: '英文', value: 'en_US' },
//   { label: '日文', value: 'ja_JP' },
//   { label: '韩文', value: 'ko_KR' },
//   { label: '法文', value: 'fr_FR' },
//   { label: '德文', value: 'de_DE' },
//   { label: '西班牙文', value: 'es_ES' },
//   { label: '俄文', value: 'ru_RU' },
// ];

const handleExtractTranslation = async () => {
  if (!props.info?.content && !props.info?.text_content) {
    console.error('没有找到可翻译的文本内容');
    return;
  }

  loading.value = true;
  try {
    // 获取文件内容作为翻译源
    const textToTranslate = props.info.content || props.info.text_content;

    const response = await translate({
      id: props.info.id,
      text: textToTranslate,
      target_language: targetLanguage.value
    });
    
    translation.value = response;
  } catch (error) {
    console.error('提取翻译失败：', error);
    // 可以添加错误提示给用户
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.info-card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.info-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 自定义滚动条 */
.info-card ::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.info-card ::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.info-card ::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.info-card ::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 暗色主题滚动条 */
.dark .info-card ::-webkit-scrollbar-track {
  background: #333;
}

.dark .info-card ::-webkit-scrollbar-thumb {
  background: #555;
}

.dark .info-card ::-webkit-scrollbar-thumb:hover {
  background: #666;
}
</style>