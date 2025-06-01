<template>
  <div class="doc-ai-chat">
    <Chat
      :session="activeSession"
      :loading="isWaitingForResponse"
      @save="saveSessions"
      @loading="handleLoading"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useDateFormat, useNow } from '@vueuse/core';
import Chat from '@/components/aichat/components/chat/index.vue';
import { ChatSession } from '@/components/aichat/components/types';

const props = defineProps<{
  docInfo: any; // 文档信息
}>();

const formatted = useDateFormat(useNow(), 'YYYY-MM-DD HH:mm:ss');
const activeSession = ref<ChatSession>({} as ChatSession);
const isWaitingForResponse = ref(false);

// 初始化会话
const initSession = () => {
  activeSession.value = {
    id: `doc-${props.docInfo.id}-${formatted.value}`,
    topic: `${props.docInfo.name} 问答`,
    messages: [],
    updatedAt: formatted.value,
    context: props.docInfo // 保存文档上下文
  };
};

const saveSessions = (session: ChatSession) => {
  activeSession.value = session;
  localStorage.setItem(`doc-chat-${props.docInfo.id}`, JSON.stringify(session));
};

const handleLoading = (loading: boolean) => {
  isWaitingForResponse.value = loading;
};

onMounted(() => {
  // 尝试从本地存储恢复会话
  const savedSession = localStorage.getItem(`doc-chat-${props.docInfo.id}`);
  if (savedSession) {
    activeSession.value = JSON.parse(savedSession);
  } else {
    initSession();
  }
});

onUnmounted(() => {
  // 保存会话到本地存储
  saveSessions(activeSession.value);
});
</script>

<style lang="less" scoped>
.doc-ai-chat {
  height: 100%;
  padding: 16px;
}
</style>