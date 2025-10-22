<template>
  <div class="p-6">
    <h2 class="text-xl font-semibold mb-6 dark:text-white">AI 配置管理</h2>
    
    <a-card class="mb-4 bg-white dark:bg-gray-800">
      <template #title>
        <div class="flex justify-between items-center">
          <span class="text-lg font-medium dark:text-white">AI 服务配置</span>
          <a-button 
            type="primary" 
            @click="saveConfig" 
            :loading="saving" 
            class="bg-blue-500 hover:bg-blue-600"
          >
            保存配置
          </a-button>
        </div>
      </template>
      
      <div class="flex flex-col md:flex-row gap-6">
        <!-- 左侧垂直 Tab -->
        <div class="md:w-1/4">
          <a-tabs 
            v-model:activeKey="activeTab" 
            type="card" 
            :tab-bar-style="{ padding: '0' }"
            direction="vertical"
            class="w-full"
          >
            <a-tab-pane key="1" title="大语言模型配置">
              <div class="h-full flex items-center justify-center text-gray-400">
                选择此选项卡配置大语言模型
              </div>
            </a-tab-pane>
            <a-tab-pane key="2" title="文本嵌入模型配置">
              <div class="h-full flex items-center justify-center text-gray-400">
                选择此选项卡配置文本嵌入模型
              </div>
            </a-tab-pane>
            <a-tab-pane key="3" title="OCR 配置">
              <div class="h-full flex items-center justify-center text-gray-400">
                选择此选项卡配置 OCR 服务
              </div>
            </a-tab-pane>
          </a-tabs>
        </div>
        
        <!-- 右侧配置表单 -->
        <div class="md:w-3/4">
          <a-spin :spinning="loading" tip="加载配置中...">
            <!-- 大语言模型配置 -->
            <div v-if="activeTab === '1'" class="space-y-6">
              <h3 class="text-lg font-medium dark:text-white">大语言模型配置</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">配置大语言模型的服务提供商、模型名称、API Key 和 API URL</p>
              
              <a-form layout="vertical" :model="llmConfig" class="mt-4">
                <a-form-item label="模型提供商" field="LLM_PROVIDER">
                  <a-input 
                    v-model="llmConfig.LLM_PROVIDER" 
                    placeholder="例如: openai, anthropic, azure-openai" 
                    class="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </a-form-item>
                
                <a-form-item label="模型名称" field="LLM_MODEL">
                  <a-input 
                    v-model="llmConfig.LLM_MODEL" 
                    placeholder="例如: gpt-4, claude-3-opus-20240229" 
                    class="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </a-form-item>
                
                <a-form-item label="API Key" field="LLM_API_KEY">
                  <a-input-password 
                    v-model="llmConfig.LLM_API_KEY" 
                    placeholder="请输入 API Key" 
                    class="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </a-form-item>
                
                <a-form-item label="API URL" field="LLM_API_URL">
                  <a-input 
                    v-model="llmConfig.LLM_API_URL" 
                    placeholder="例如: https://api.openai.com/v1" 
                    class="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </a-form-item>
              </a-form>
            </div>
            
            <!-- 文本嵌入模型配置 -->
            <div v-if="activeTab === '2'" class="space-y-6">
              <h3 class="text-lg font-medium dark:text-white">文本嵌入模型配置</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">配置文本嵌入模型的服务提供商、模型名称、API Key 和 API URL</p>
              
              <a-form layout="vertical" :model="embeddingConfig" class="mt-4">
                <a-form-item label="嵌入模型" field="EMBEDDING_MODEL">
                  <a-input 
                    v-model="embeddingConfig.EMBEDDING_MODEL" 
                    placeholder="例如: text-embedding-3-small, text-embedding-ada-002" 
                    class="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </a-form-item>
                
                <a-form-item label="API URL" field="EMBEDDING_URL">
                  <a-input 
                    v-model="embeddingConfig.EMBEDDING_URL" 
                    placeholder="例如: https://api.openai.com/v1/embeddings" 
                    class="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </a-form-item>
                
                <a-form-item label="API Key" field="EMBEDDING_API_KEY">
                  <a-input-password 
                    v-model="embeddingConfig.EMBEDDING_API_KEY" 
                    placeholder="请输入 API Key" 
                    class="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </a-form-item>
              </a-form>
            </div>
            
            <!-- OCR 配置 -->
            <div v-if="activeTab === '3'" class="space-y-6">
              <h3 class="text-lg font-medium dark:text-white">OCR 配置</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">配置 OCR 服务的 API URL 和 API Key</p>
              
              <a-form layout="vertical" :model="ocrConfig" class="mt-4">
                <a-form-item label="OCR URL" field="OCR_URL">
                  <a-input 
                    v-model="ocrConfig.OCR_URL" 
                    placeholder="例如: https://api.example.com/ocr" 
                    class="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </a-form-item>
                
                <a-form-item label="OCR API Key" field="OCR_API_KEY">
                  <a-input-password 
                    v-model="ocrConfig.OCR_API_KEY" 
                    placeholder="请输入 OCR API Key" 
                    class="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </a-form-item>
              </a-form>
            </div>
          </a-spin>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { getConfig, updateConfig, type GetConfigListDetails } from '@/api/config';

// 响应式数据
const activeTab = ref('1');
const loading = ref(false);
const saving = ref(false);
const configData = ref<GetConfigListDetails | null>(null);

// 配置表单数据
const llmConfig = reactive({
  LLM_PROVIDER: '',
  LLM_MODEL: '',
  LLM_API_KEY: '',
  LLM_API_URL: ''
});

const embeddingConfig = reactive({
  EMBEDDING_MODEL: '',
  EMBEDDING_URL: '',
  EMBEDDING_API_KEY: ''
});

const ocrConfig = reactive({
  OCR_URL: '',
  OCR_API_KEY: ''
});

// 加载配置
const loadConfig = async () => {
  loading.value = true;
  try {
    const data = await getConfig();
    configData.value = data;
    
    // 从 settings 中提取配置
    if (data.settings) {
      // 大语言模型配置
      llmConfig.LLM_PROVIDER = data.settings.LLM_PROVIDER || '';
      llmConfig.LLM_MODEL = data.settings.LLM_MODEL || '';
      llmConfig.LLM_API_KEY = data.settings.LLM_API_KEY || '';
      llmConfig.LLM_API_URL = data.settings.LLM_API_URL || '';
      
      // 文本嵌入模型配置
      embeddingConfig.EMBEDDING_MODEL = data.settings.EMBEDDING_MODEL || '';
      embeddingConfig.EMBEDDING_URL = data.settings.EMBEDDING_URL || '';
      embeddingConfig.EMBEDDING_API_KEY = data.settings.EMBEDDING_API_KEY || '';
      
      // OCR 配置
      ocrConfig.OCR_URL = data.settings.OCR_URL || '';
      ocrConfig.OCR_API_KEY = data.settings.OCR_API_KEY || '';
    }
  } catch (error) {
    console.error('加载配置失败:', error);
    Message.error('加载配置失败');
  } finally {
    loading.value = false;
  }
};

// 保存配置
const saveConfig = async () => {
  if (!configData.value) {
    Message.error('配置未加载，请刷新页面重试');
    return;
  }
  
  saving.value = true;
  try {
    // 合并所有配置
    const updatedSettings = {
      ...configData.value.settings,
      // 大语言模型配置
      LLM_PROVIDER: llmConfig.LLM_PROVIDER,
      LLM_MODEL: llmConfig.LLM_MODEL,
      LLM_API_KEY: llmConfig.LLM_API_KEY,
      LLM_API_URL: llmConfig.LLM_API_URL,
      // 文本嵌入模型配置
      EMBEDDING_MODEL: embeddingConfig.EMBEDDING_MODEL,
      EMBEDDING_URL: embeddingConfig.EMBEDDING_URL,
      EMBEDDING_API_KEY: embeddingConfig.EMBEDDING_API_KEY,
      // OCR 配置
      OCR_URL: ocrConfig.OCR_URL,
      OCR_API_KEY: ocrConfig.OCR_API_KEY
    };
    
    await updateConfig(configData.value.id, {
      ...configData.value,
      settings: updatedSettings
    });
    
    Message.success('配置保存成功');
  } catch (error) {
    console.error('保存配置失败:', error);
    Message.error('保存配置失败');
  } finally {
    saving.value = false;
  }
};

// 组件挂载时加载配置
onMounted(() => {
  loadConfig();
});
</script>

<style scoped>
/* 自定义样式 */
:deep(.arco-tabs-tab-vertical) {
  text-align: left !important;
  padding: 12px 16px;
}

:deep(.arco-tabs-active-tab-vertical) {
  background-color: #f5f7fa !important;
}

.dark :deep(.arco-tabs-active-tab-vertical) {
  background-color: #1f2937 !important;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .flex-col.md\:flex-row {
    flex-direction: column;
  }
  
  .md\:w-1\/4,
  .md\:w-3\/4 {
    width: 100%;
  }
  
  :deep(.arco-tabs-vertical) {
    flex-direction: column;
  }
  
  :deep(.arco-tabs-content) {
    border-left: none !important;
    border-top: 1px solid var(--color-border);
  }
}
</style>