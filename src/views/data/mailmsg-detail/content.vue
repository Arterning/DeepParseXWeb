<template>
  <!-- 邮件内容区域 -->
  <div class="p-4">
      <!-- 邮件标题 -->
      <h1 class="text-2xl font-semibold text-gray-900 mb-2">
        {{ info?.name }}
      </h1>

      <!-- 元信息区域 -->
      <div class="flex flex-wrap gap-4 mb-6">
        <div class="flex items-center gap-2 text-gray-600">
          <a-icon-user />
          <span>{{ info?.sender }}</span>
        </div>
        <div class="flex items-center gap-2 text-gray-600">
          <a-icon-calendar />
          <span>{{ emailDateFormat(info?.time) }}</span>
        </div>
        <div class="flex items-center gap-2 text-gray-600">
          <a-icon-tag />
          <span>{{ info?.category }}</span>
        </div>
      </div>

      <!-- 收件人信息 -->        
      <a-space class="flex flex-nowrap mb-4">
        <div class="text-sm font-medium text-gray-600 w-16">收件人</div>
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
        <div class="text-sm font-medium text-gray-600 w-16">抄送</div>
        <!--            <a-tag v-for="(cc, index) in info?.cc" :key="index" type="gray">-->
        <!--              {{ cc }}-->
        <!--            </a-tag>-->
        <a-tag class="text-wrap h-auto">{{ info?.cc }}</a-tag>
      </a-space>

      <a-space class="flex justify-end mb-4">
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
      </a-space>

      <a-split v-if="translate" v-model:size="splitSize" min="0.3" max="0.7" class="border-t border-gray-200 pt-6 h-[calc(100vh-500px)]">
        <template #first>
          <a-typography-paragraph>
            <div class="prose max-w-none" v-html="info?.original"></div>
          </a-typography-paragraph>
        </template>
        <template #second v-if="translate">
          <a-typography-paragraph>

          </a-typography-paragraph>
        </template>
      </a-split>
      <div v-else class="border-t border-gray-200 pt-6 h-[calc(100vh-500px)]">
        <div class="prose max-w-none" v-html="info?.original"></div>
      </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { MailMsgRes } from '@/api/mailmsg';
  import { emailDateFormat } from '@/utils/date';

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
