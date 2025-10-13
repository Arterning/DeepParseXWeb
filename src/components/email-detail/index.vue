<template>
  <div class="h-full flex flex-col">
    <!-- 邮件内容区域 -->
    <div class="flex-1 overflow-y-auto p-6">
      <!-- 邮件标题 -->
      <h1 class="text-2xl font-semibold text-gray-900 mb-2">
        {{ mailData?.name }}
      </h1>

      <!-- 元信息区域 -->
      <div class="flex flex-wrap gap-4 mb-6">
        <div class="flex items-center gap-2 text-gray-600">
          <a-icon-user />
          <span>{{ mailData?.sender }}</span>
        </div>
        <div class="flex items-center gap-2 text-gray-600">
          <a-icon-calendar />
          <span>{{ mailData?.time }}</span>
        </div>
        <div class="flex items-center gap-2 text-gray-600">
          <a-icon-tag />
          <span>{{ mailData?.category }}</span>
        </div>
      </div>

      <!-- 收件人信息 -->
      <div class="mb-6">
        <h2 class="text-sm font-medium text-gray-600 mb-2">收件人</h2>
        <div class="flex flex-wrap gap-2">
          <a-tag>{{ mailData?.receiver }}</a-tag>
        </div>
      </div>

      <!-- 抄送信息 -->
      <div v-if="mailData?.cc" class="mb-6">
        <h2 class="text-sm font-medium text-gray-600 mb-2">抄送</h2>
        <div class="flex flex-wrap gap-2">
          <a-tag>{{ mailData?.cc }}</a-tag>
        </div>
      </div>

      <!-- 邮件正文 -->
      <div class="border-t border-gray-200 pt-6">
        <div v-if="isHtmlContent(mailData?.original)" class="prose max-w-none" v-html="mailData?.original"></div>
        <div v-else class="whitespace-pre-wrap break-words dark:text-white text-gray-800 leading-relaxed">
          {{ mailData?.original }}
        </div>
      </div>

      <!-- 附件信息 -->
      <div v-if="mailData?.attachments && mailData.attachments.length > 0" class="mt-6 pt-6 border-t border-gray-200">
        <h2 class="text-sm font-medium text-gray-600 mb-3">附件</h2>
        <div class="space-y-2">
          <div
            v-for="attachment in mailData.attachments"
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
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { MailMsgRes } from '@/api/mailmsg';

interface Props {
  mailData?: MailMsgRes;
}

const props = defineProps<Props>();
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
  const hasTableTag = /<table[^>]*>/i.test(trimmed) && /<\/table>/i.test(trimmed);
  
  // 至少需要html标签或者doctype + html结构
  return hasHtmlTag || (hasDoctype && (hasHeadTag || hasBodyTag)) || hasDivTag || hasTableTag;
}
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