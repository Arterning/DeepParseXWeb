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
        <a-space class="flex flex-nowrap mb-4">
          <div class="text-sm font-medium w-16">收件人</div>
          <!--            <a-tag-->
          <!--              v-for="(recipient, index) in info?.recipients"-->
          <!--              :key="index"-->
          <!--            >-->
          <!--              {{ recipient }}-->
          <!--            </a-tag>-->
          <a-tag>{{ info?.receiver }}</a-tag>
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
        </div>
      </div>
    </div>



      <a-split v-if="translate" v-model:size="splitSize" min="0.3" max="0.7" class="border-t pt-6 h-[calc(100vh-500px)]">
        <template #first>
          <div v-if="isHtmlContent(info?.original)" class="prose max-w-none" v-html="info?.original"></div>
          <div v-else class="whitespace-pre-wrap break-words dark:text-white text-gray-800 leading-relaxed">
            {{ info?.original }}
          </div>
        </template>
        <template #second v-if="translate">
          <a-typography-paragraph>

          </a-typography-paragraph>
        </template>
      </a-split>
      
      <!-- 邮件正文 -->
      <div v-else class="border-t pt-6 h-[calc(100vh-500px)]">
        <div v-if="isHtmlContent(info?.original)" class="prose max-w-none" v-html="info?.original"></div>
        <div v-else class="whitespace-pre-wrap break-words dark:text-white text-gray-800 leading-relaxed">
          {{ info?.original }}
        </div>
      </div>

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
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
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

  const splitSize = ref(0.5);

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
