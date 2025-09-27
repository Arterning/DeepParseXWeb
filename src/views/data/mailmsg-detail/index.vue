<template>
  <a-layout class="flex-layout">
    <Breadcrumb />
    <div class="h-full flex flex-col rounded-lg shadow-sm overflow-hidden">
      <EmailDetail :mailData="mailData" />
    </div>
    <Footer />
  </a-layout>
</template>

<script setup lang="ts">
  import { ref, onBeforeMount, reactive } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import Footer from '@/components/footer/index.vue';
  import { useRoute } from 'vue-router';
  import { queryMailMsgDetail, MailMsgRes } from '@/api/mailmsg';
  import EmailDetail from '@/components/email-detail/index.vue';

  onBeforeMount(async () => {
    const route = useRoute();
    const id = Number(route.params.id); // 获取路由参数中的 id
    const res = await queryMailMsgDetail(id);
    mailData.value = reactive(res);
  });

  let mailData = ref<MailMsgRes>();

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
