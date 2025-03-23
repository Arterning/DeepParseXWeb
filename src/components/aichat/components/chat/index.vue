<script setup lang="ts">
  import { computed, nextTick, onMounted, ref, watch } from 'vue';
  import { useAppStore } from '@/store';
  import { useDateFormat, useNow } from '@vueuse/core';
  import { chat } from '@/api/ai';

  import Message from '../message/index.vue';
  import { ChatSession } from '../types';

  const formatted = useDateFormat(useNow(), 'YYYY-MM-DD HH:mm:ss');
  const message = ref('');
  const activeSession = ref<ChatSession>({} as ChatSession);
  // const avatarUrl = ref('');
  const contentBox = ref<HTMLElement | null>(null);
  const props = defineProps<{
    session: ChatSession;
    hiddenHeader?: boolean;
    darkMode?: boolean;
    isLoading?: boolean
  }>();
  const emits = defineEmits(['save', 'loading']);
  const textareaRef = ref<HTMLTextAreaElement>();
  // Configurable parameters
  // const MAX_RETRIES = 5;
  // const RETRY_INCREMENT_MS = 1000;
  // const DISPLAY_TEXT_INCREMENT_MS = 100;
  // const DISPLAY_TEXT_CHUNK_SIZE = 3;
  // const HISTORY_SIZE = 1;

  onMounted(() => {
    activeSession.value = props.session;
  });

  watch(
    () => props.session,
    (session) => {
      activeSession.value = session;
      scrollToBottom();
    }
  );

  // shift + enter 换行, enter 发送消息
  function handleKeyPress(event: KeyboardEvent) {
    // 检查是否按下了 Enter 键
    if (event.key === 'Enter') {
      // 检查是否同时按下了 Shift 键
      if (!event.shiftKey) {
        // 阻止默认行为，防止自动换行
        event.preventDefault();
        // emits('loading', true);
        // 调用发送消息的函数
        sendMessage();
      }
    }
  }

  async function getChatResponse(
    question: string,
    callback: (response: string, status: string) => void
  ): Promise<void> {
    try {
      const answer = await chat({ question });
      // const answer = "根据提供的上下文信息，没有直接提到线性层定义的公式。提供的信息主要涉及一个全新的数字电视发射机的提供情况，以及线性增强的说明和相关服务信息。线性层定义公式通常与深度学习或神经网络中的线性变换相关，但这些内容在给定的文本中并未提及。\n\n如果需要线性层定义的公式，可以从神经网络的基础知识中找到，一个简单的线性层定义公式可以表示为：\n\n\\[ y = Wx + b \\]\n\n其中：\n- \\( y \\) 是线性变换后的输出。\n- \\( W \\) 是权重矩阵。\n- \\( x \\) 是输入向量。\n- \\( b \\) 是偏置向量。\n\n这个公式表示通过权重矩阵 \\( W \\) 对输入 \\( x \\) 进行线性变换，并加上偏置 \\( b \\)，得到最终的输出 \\( y \\)。但请注意，这是根据一般知识给出的，不是根据提供的特定上下文信息。"
      const count = Math.ceil(answer.length / 10); // 分10段输出
      return new Promise((resolve) => {
        let i = 0;
        const timer = setInterval(() => {
          if (i < answer.length) {
            callback(answer.slice(0, i + 1), "success");
            i += count;
          } else {
            if (i < answer.length + count) {
              callback(answer, "success");
            }
            clearInterval(timer);
            resolve();
          }
        }, 50); // 每段间隔50ms
      });
    } catch (error) {
      callback("请求失败", "failure");
      return Promise.resolve(); 
    }
  }

  async function sendMessage() {
    
    if (props.isLoading || !message.value.trim()) {
      return;
    }
    emits('loading', true);

    // 发送消息后，将消息添加到当前会话的消息列表中
    activeSession.value.messages.push({
      sender: 'user',
      content: message.value.replace(/\n/g, "<br>"),
      timestamp: formatted.value,
      status: 'success'
    });
    
    const question = message.value;
    activeSession.value.topic = question.substring(0, 10); // 更新会话主题
    message.value = '';
    emits('save', activeSession.value);
    scrollToBottom();
    
    activeSession.value.messages.push({
      sender: 'bot',
      content: '',
      timestamp: formatted.value,
      status: 'waiting'
    });
    const res  = await getChatResponse(question, 
      (answer, status) => {
        activeSession.value.messages[
          activeSession.value.messages.length - 1
        ].content = answer;
        activeSession.value.messages[
          activeSession.value.messages.length - 1
        ].status = status;
        if( status === 'failure'){
          message.value = question;
        }
      })
      emits('save', activeSession.value);
      scrollToBottom();
      emits('loading', false);
    }


  // 滚动到底部
  const scrollToBottom = async () => {
    await nextTick(() => {
      contentBox.value?.scrollTo({
        top: contentBox.value.scrollHeight,
        behavior: 'smooth',
      });
    });
  };
  const store = useAppStore();

  function terminatConnection() {
    emits('loading', false);
    // 如果message.content为空，则删除该消息
    if (
      !activeSession.value.messages[activeSession.value.messages.length - 1].content
    ) {
      activeSession.value.messages.pop();
    }
    emits('save', activeSession.value);
  }
</script>

<template>
  <div class="chat-container">
    <div ref="contentBox" class="chat-content">
      <h1 class="start-tip" v-if="props.session.messages.length===0">有什么可以帮助的？</h1>
      <template v-for="(message, index) in props.session.messages" :key="index">
        <Message
          :message="message"
          :dark-mode="darkMode"
        ></Message>
      </template>
      <template v-if="isLoading">
        <div class="waiting">
          <a-spin />
          <span>AI正在思考中...</span>
        </div>
      </template>
    </div>
    <div class="chat-footer">
      <a-divider />
          <div class="chat-input">
            <textarea
              ref="textareaRef"
              class="input"
              v-model="message"
              placeholder="输入要询问的内容（同时按下Shift与Enter可换行）"
              @keydown="handleKeyPress"
            />
            <div class="button">
              <a-button
                @click="sendMessage"
                v-show="message.trim() && !isLoading"
                shape="circle"
                type="primary"
              >
                <icon-send />
              </a-button>
              
              <a-button
                v-show="isLoading"
                @click="terminatConnection"
                status="warning"
                shape="circle"
              >
                <icon-record-stop />
              </a-button>
            </div>
          </div>
    </div>

  </div>
</template>

<style lang="less" scoped>  
  .chat-container{
    padding: 1.25rem 0;
    min-width: 720px;
    display: flex;
    align-items: center;
    height: 100%;
    flex-direction: column;
  }
  // .chat-header{
  //   height: 2rem;
  //   text-overflow: ellipsis;
  //   white-space: nowrap;
  //   overflow: hidden;
  //   font-size: large;
  // }
  .chat-content{
    flex: 1;
    padding: 0.5rem;
    overflow-y: scroll;
  }
  .start-tip{
    text-align: center;
    font-weight: bold;
    font-size: x-larger;
  }
  .chat-footer{
    flex-direction: column;
    display: flex;
    align-items: center;
    bottom: 0;
    width: 100%;

    .chat-input{
      max-width: 720px;
      width: 100%;
      border: 1px solid var(--color-text-4);
      border-radius: 0.2rem;
      background-color:  var(--color-bg-4);
      padding: 0.5rem 0.75rem;
      .input{
        outline: none;
        width: 100%;
        background: transparent;
        border: none;
        line-height: 1.75rem;
        height: auto;
        overflow-y: auto;
        resize: none;
        color: var(--color-text-2);
      }
      .button{
        display: flex;
        justify-content: end;
      }
    }

  }
  .waiting{
    display: flex;
    align-items: center;
    span{
      margin-left: 0.5rem;
    }
  }
  .button{
    min-height: 2.5rem;
  }
  /* 自定义滚动条的样式 */
  ::-webkit-scrollbar {
    display: block;
    width: 5px;
    height: 5px;
    scroll-behavior:smooth;
  }

  ::-webkit-scrollbar-thumb {
    background: #858585;
    border-radius: 5px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #e2e2e2;
  }
</style>
