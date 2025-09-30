<template>
  <!-- 邮件内容区域 -->
  <div class="p-5">
    <div class="flex">
      <div class="flex-1">
        <!-- 邮件标题 -->
        <h1 class="text-2xl font-semibold mb-2">
          {{ info?.name }}
        </h1>

        <!-- 元信息区域 -->
        <div class="flex flex-wrap gap-4 mb-4">
          <div class="flex items-center gap-2">
            <a-icon-user />
            <span>{{ info?.sender }}</span>
          </div>
          <div class="flex items-center gap-2">
            <a-icon-calendar />
            <span>{{ emailDateFormat(info?.time) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <a-icon-tag />
            <span>{{ info?.category }}</span>
          </div>
        </div>

        <!-- 收件人信息 -->        
        <a-space class="flex mb-4">
          <div class="text-sm font-medium w-16">收件人</div>
          <a-scrollbar style="max-height: 100px; overflow: auto">
            <div class="space-x-2 space-y-2">
              <a-tag
                v-for="(recipient, index) in parseReceiver"
                :key="index"
              >
                {{ recipient }}
              </a-tag>
            </div>
          </a-scrollbar>

          <!-- <a-tag>{{ parseReceiver }}</a-tag> -->
        </a-space>

        <!-- 抄送信息 -->  
        <a-space v-if="info?.cc" class="flex flex-nowrap mb-4">
          <div class="text-sm font-medium w-16">抄送</div>
          <!--            <a-tag v-for="(cc, index) in info?.cc" :key="index" type="gray">-->
          <!--              {{ cc }}-->
          <!--            </a-tag>-->
          <a-tag class="text-wrap h-auto">{{ info?.cc }}</a-tag>
        </a-space>
      </div>
      <div>
        <div class="flex gap-2 items-center">
        <a-switch type="round" v-model="translate">
          <template #checked>
            关闭翻译
          </template>
          <template #unchecked>
            启用翻译
          </template>
        </a-switch>
        <a-popconfirm content="确认删除此邮件？" @ok="handleDelete">
          <a-button status="danger" size="small">删除</a-button>
        </a-popconfirm>
        <a-button @click="showEntityTypeModal = true" type="primary" size="small">提取信息</a-button>
        </div>
      </div>
    </div>
    <a-divider />

    <a-split v-if="translate" v-model:size="splitSize" min="0.3" max="0.7" class="h-[calc(100vh-300px)]">
      <template #first>
        <a-typography-paragraph>
          <div v-if="isHtmlContent(info?.original)" class="prose max-w-none" v-html="info?.original"></div>
          <div v-else class="whitespace-pre-wrap break-words dark:text-white text-gray-800 leading-relaxed">
            {{ info?.original }}
          </div>
        </a-typography-paragraph>
      </template>
      <template #second v-if="translate">
        <a-typography-paragraph>
          {{ info?.zh_content }}
        </a-typography-paragraph>
      </template>
    </a-split>
    
    <!-- 邮件正文 -->
    <a-scrollbar v-else class="pr-6 h-[calc(100vh-300px)] overflow-y-auto">
      <div v-if="isHtmlContent(info?.original)" class="prose max-w-none" v-html="info?.original"></div>
      <div v-else class="whitespace-pre-wrap break-words dark:text-white text-gray-800 leading-relaxed">
        {{ info?.original }}
      </div>
    </a-scrollbar>

    <!-- 附件信息 -->
    <div v-if="info?.attachments && info.attachments.length > 0" class="mt-6 pt-6 border-t border-gray-200">
      <h2 class="text-sm font-medium text-gray-600 mb-3">附件</h2>
      <div class="space-y-2">
        <div
          v-for="attachment in info.attachments"
          :key="attachment.id"
          class="flex items-center text-blue-600 hover:text-blue-800 cursor-pointer"
          @click="handleAttachmentClick(attachment)"
        >
          <a-icon-file-text class="mr-2" />
          <span>{{ attachment.name }}</span>
        </div>
      </div>
    </div>

    <a-modal v-model:visible="showEntityTypeModal" title="实体类型选择" @ok="handleExtractConfirm">
      <div class="space-y-4">
        <div class="flex gap-2 items-center">
          <a-input 
            v-model="entityTypeInput" 
            placeholder="输入实体类型，如'人物'"
            class="w-40"
            @keyup.enter="addEntityType"
          />
          <button 
            @click="addEntityType"
            class="bg-[#2971CF] text-white px-3 py-1 rounded transition-colors duration-200"
          >
            添加
          </button>
        </div>
        
        <!-- 常用实体类型快速选择 -->
        <div class="mt-2 flex flex-wrap gap-2 items-center">
          <span class="text-sm text-gray-400 mr-2">常用类型：</span>
          <button 
            v-for="type in commonEntityTypes"
            :key="type"
            @click="addCommonEntityType(type)"
            class="text-sm bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded transition-colors duration-200"
          >
            {{ type }}
          </button>
        </div>
        
        <!-- 已选择的实体类型 -->
        <div v-if="selectedEntityTypes.length > 0" class="mt-3">
          <span class="text-sm text-gray-400">已选择：</span>
          <div class="flex flex-wrap gap-2 mt-1">
            <span 
              v-for="type in selectedEntityTypes"
              :key="type"
              class="inline-flex items-center bg-blue-900/50 text-blue-300 px-2 py-1 rounded text-sm"
            >
              {{ type }}
              <button 
                @click="removeEntityType(type)"
                class="ml-1 text-blue-300 hover:text-blue-100 w-5 h-5 flex items-center justify-center rounded-full hover:bg-blue-700/30 transition-colors"
              >
                ×
              </button>
            </span>
          </div>
        </div>
        
        <div v-else class="mt-2 text-gray-400 text-sm">
          请选择要提取的实体类型
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { MailMsgRes } from '@/api/mailmsg';
  import { emailDateFormat } from '@/utils/date';
  import { useRouter } from 'vue-router';

  const translate = ref(false);

  // onBeforeMount(async () => {
  //   const route = useRoute();
  //   const id = Number(route.params.id); // 获取路由参数中的 id
  //   const res = await queryMailMsgDetail(id);
  //   info.value = reactive(res);
  // });

  const props = defineProps<{
    info: MailMsgRes
  }>();
  const emit = defineEmits<{
    extractGraph: [entityTypes: string[]];
  }>();

  const splitSize = ref(0.5);

  const showEntityTypeModal = ref(false);
  // 实体类型选择相关
  const selectedEntityTypes = ref<string[]>([]);
  const entityTypeInput = ref('');
  const commonEntityTypes = ['邮箱账号', '联系方式', '电话号码', '网址', 'IP地址', '身份证号', '银行卡号', '车牌号', '组织机构代码', '税号'];

  const addEntityType = () => {
    if (entityTypeInput.value && !selectedEntityTypes.value.includes(entityTypeInput.value)) {
      selectedEntityTypes.value.push(entityTypeInput.value);
      entityTypeInput.value = '';
    }
  };

  const removeEntityType = (type: string) => {
    selectedEntityTypes.value = selectedEntityTypes.value.filter(t => t !== type);
  };

  const addCommonEntityType = (type: string) => {
    if (!selectedEntityTypes.value.includes(type)) {
      selectedEntityTypes.value.push(type);
    }
  };

  // 处理提取确认
  const handleExtractConfirm = () => {
    emit('extractGraph', selectedEntityTypes.value);
  };

  const handleDelete = () => {
    Message.success('邮件已删除');
  };

  function isHtmlContent(input: string): boolean {
    if (!input || typeof input !== 'string') {
      return false;
    }

    const trimmed = input.trim();
    
    // 检查是否包含HTML文档的基本结构
    const hasDoctype = /<!doctype\s+html/i.test(trimmed);
    const hasHtmlTag = /<html[^>]*>/i.test(trimmed) && /<\/html>/i.test(trimmed);
    const hasHeadTag = /<head[^>]*>/i.test(trimmed) && /<\/head>/i.test(trimmed);
    const hasBodyTag = /<body[^>]*>/i.test(trimmed) && /<\/body>/i.test(trimmed);
    const hasDivTag = /<div[^>]*>/i.test(trimmed) && /<\/div>/i.test(trimmed);
    
    // 至少需要html标签或者doctype + html结构
    return hasHtmlTag || (hasDoctype && (hasHeadTag || hasBodyTag || hasDivTag));
  }

  const router = useRouter();
  const handleAttachmentClick = (attachment: any) => {
    router.push({
      name: 'DocDetail',
      params: {
        id: attachment.id,
      },
      query: {
        appendix: attachment.name,
      },
    });
  };

  const parseReceiver = computed(() => {
    const raw = props.info.receiver || ''
    const results: string[] = []

    const regex = /"?([^",]+,\s*[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})"?|([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g
    let match
    while ((match = regex.exec(raw)) !== null) {
      if (match[1]) {
        results.push(match[1].trim())
      } else if (match[2]) {
        results.push(match[2].trim())
      }
    }

    return results
  })

</script>

<style scoped>
  /* 自定义滚动条样式 */
  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-track {
    @apply bg-gray-100;
  }
  ::-webkit-scrollbar-thumb {
    @apply bg-gray-300 rounded-full;
  }

  /* 美化正文内容样式 */
  :deep(.prose) {
    line-height: 1.6;
    p {
      @apply mb-4;
    }
    ol {
      @apply list-decimal pl-6 mb-4;
    }
    li {
      @apply mb-2;
    }
  }
</style>
