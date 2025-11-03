<template>
  <a-layout class="flex-layout">
    <!-- <Breadcrumb /> -->
    <a-card class="general-card">
      <div class="content flex">
        <div class="layout-sider">

          <div class="btn-line">

            <div class="flex gap-2 mt-2">
              <a-button type="text" long @click="handleCreateSession">
                <icon-plus />
                <span> 新建对话 </span>
              </a-button>

              <a-button
                v-if="sessionList && sessionList.length > 0"
                type="text"
                long
                @click="handleClearSession"
              >
                <icon-delete />
                <span> 清空对话 </span>
              </a-button>
            </div>

          </div>

          <div class="session-list">
            <SessionItem
              v-for="session in sessionList"
              :key="session.id"
              :active="session.id === activeSession.id"
              :session="session"
              @click="handleSessionSwitch(session)"
              @delete="handleDeleteSession"
            ></SessionItem>
          </div>
        </div>
        <a-layout-content>
          <Chat
            :session="activeSession"
            :loading="isWaitingForResponse"
            @save="saveSessions"
            @loading="handleLoading"
          />
        </a-layout-content>
      </div>
    </a-card>
    <Footer />

    <!-- RAG引用文本抽屉 -->
    <a-drawer
      v-model:visible="drawerVisible"
      title="引用文档"
      width="500px"
      placement="right"
      :closable="true"
    >
      <template #title>
        <div class="drawer-title">
          <icon-file-text />
          <span>引用文档</span>
        </div>
      </template>

      <div v-if="selectedDoc" class="reference-content">
        <div class="doc-info">
          <h3 class="doc-name">{{ selectedDoc.docName }}</h3>
          <p class="doc-id">文档ID: {{ selectedDoc.docId }}</p>
        </div>

        <a-divider />

        <div class="chunk-content">
          <h4>引用内容:</h4>
          <div class="text-content" v-html="selectedDoc.chunkText"></div>
        </div>
      </div>

      <div v-else class="no-content">
        <a-empty description="暂无引用内容" />
      </div>
    </a-drawer>
  </a-layout>
</template>

<script setup lang="ts">
  import Footer from '@/components/footer/index.vue';

  import { onMounted, onUnmounted, ref } from 'vue';
  import { useDateFormat, useNow } from '@vueuse/core';

  import Chat from './components/chat/index.vue';
  import SessionItem from './components/sessionitem/index.vue';
  import { ChatSession } from './components/types';

  const formatted = useDateFormat(useNow(), 'YYYY-MM-DD HH:mm:ss');
  const activeSession = ref<ChatSession>({} as ChatSession);
  const sessionList = ref<ChatSession[]>([]);
  const isWaitingForResponse = ref(false);

  const visible = ref(false);

  // RAG引用抽屉相关状态
  const drawerVisible = ref(false);
  const selectedDoc = ref<{
    docId: string;
    docName: string;
    chunkText: string;
  } | null>(null);

  const handleOpen = () => {
    visible.value = true;
  };

  // 生成一个新会话对象返回
  const getDefaultSession = () => {
    return {
      id: `${formatted.value}-${sessionList.value.length}`,
      topic: '新对话',
      messages: [],
      updatedAt: formatted.value,
    };
  };

  // 判断是否正在等待响应，如果在等待则不能切换会话,接收emit事件
  const handleLoading = (loading: boolean) => {
    isWaitingForResponse.value = loading;
  };

  // 切换会话
  const handleSessionSwitch = (session: ChatSession) => {
    if (isWaitingForResponse.value) {
      return;
    }
    activeSession.value = { ...session };
  };

  // 从会话列表中删除会话
  const handleDeleteSession = (session: ChatSession) => {
    const index = sessionList.value.findIndex((s) => s.id === session.id);
    sessionList.value.splice(index, 1);
    if (sessionList.value.length === 0) {
      // 删除完了
      sessionList.value = [getDefaultSession()]; // 新建默认
    } else {
      // 删除后切换到第一个会话
      activeSession.value = { ...sessionList.value[0] };
    }
    localStorage.setItem('sessionList', JSON.stringify(sessionList.value));
  };

  // 新增会话
  const handleCreateSession = () => {
    // sessionList头部插入一个新的会话，模拟新增会话
    sessionList.value.unshift(getDefaultSession());
    // 切换到新增的会话
    handleSessionSwitch(sessionList.value[0]);
    localStorage.setItem('sessionList', JSON.stringify(sessionList.value));
  };

  // 清空会话
  const handleClearSession = () => {
    sessionList.value = [getDefaultSession()];
    activeSession.value = { ...sessionList.value[0] };
    localStorage.setItem('sessionList', JSON.stringify(sessionList.value));
  };

  // 成功接收消息后，保存会话列表到本地存储
  const saveSessions = (session: ChatSession) => {
    const index = sessionList.value.findIndex((s) => s.id === session.id);
    sessionList.value[index] = session;
    localStorage.setItem('sessionList', JSON.stringify(sessionList.value));
  };

  // 从localStorage获取chunk的函数
  const findChunkById = (chunkId: string) => {
    const chunksData = localStorage.getItem('aiChatChunks');
    if (!chunksData) return null;
    
    try {
      const chunks = JSON.parse(chunksData);
      return chunks.find((chunk: any) => chunk.chunk_id === chunkId);
    } catch (error) {
      console.error('解析chunks数据失败:', error);
      return null;
    }
  };

  // 打开引用文档抽屉的方法
  const openDrawer = (element: HTMLElement) => {
    // 获取data-chunk-id属性
    const chunkId = element.dataset.chunkId;
    
    if (!chunkId) {
      console.error('缺少chunkId参数');
      return;
    }
    
    // 从localStorage中查找对应的chunk
    const chunk = findChunkById(chunkId);
    
    if (chunk) {
      selectedDoc.value = {
        docId: chunk.doc_id.toString(),
        docName: chunk.doc_name,
        chunkText: chunk.chunk_text
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
      };
      drawerVisible.value = true;
    } else {
      console.error(`未找到ID为${chunkId}的文本片段`);
    }
  };

  onMounted(() => {
    // 从本地存储中获取会话列表
    const localSessionList = localStorage.getItem('sessionList');
    if (localSessionList) {
      sessionList.value = JSON.parse(localSessionList);
    } else {
      sessionList.value = [getDefaultSession()];
    }
    // 默认选中第一个会话
    handleSessionSwitch(sessionList.value[0]);

    // 将openDrawer方法绑定到全局window对象
    (window as any).openDrawer = openDrawer;
  });

  onUnmounted(() => {
    // 组件销毁时保存会话列表到本地存储
    localStorage.setItem('sessionList', JSON.stringify(sessionList.value));

    // 清理全局方法
    delete (window as any).openDrawer;
  });
</script>

<style scoped>
  .layout-content {
    max-height: 100%;
    display: flex;
  }
  .layout-sider {
    width: 220px;
  }
  .btn-line {
    display: flex;
    justify-content: end;
    margin-right: 1rem;
    margin-bottom: 0.5rem;
  }
  .session-list {
    padding-right: 1rem;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    height: 65vh;
    width: 220px;
  }

  /* 自定义滚动条的样式 */
  ::-webkit-scrollbar {
    display: block;
    width: 5px;
    height: 5px;
    scroll-behavior: smooth;
  }

  ::-webkit-scrollbar-thumb {
    background: #858585;
    border-radius: 5px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #e2e2e2;
  }

  /* 抽屉样式 */
  .drawer-title {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .reference-content {
    padding: 16px 0;
  }

  .doc-info {
    margin-bottom: 16px;
  }

  .doc-name {
    margin: 0 0 8px 0;
    color: var(--color-text-1);
    font-size: 18px;
    font-weight: 600;
  }

  .doc-id {
    margin: 0;
    color: var(--color-text-3);
    font-size: 14px;
  }

  .chunk-content h4 {
    margin: 0 0 12px 0;
    color: var(--color-text-2);
    font-size: 16px;
    font-weight: 500;
  }

  .text-content {
    padding: 16px;
    background-color: var(--color-fill-2);
    border-radius: 8px;
    border-left: 4px solid var(--color-primary-6);
    line-height: 1.6;
    color: var(--color-text-1);
    word-wrap: break-word;
    white-space: pre-wrap;
  }

  .no-content {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
  }
</style>
