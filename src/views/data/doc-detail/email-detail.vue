<template>
  <a-layout class="flex-layout">
    <div
      class="h-full flex flex-col bg-white rounded-lg shadow-sm overflow-hidden"
    >
      <!-- 邮件头部 -->
      <!-- <a-page-header
        class="border-b border-gray-200 bg-blue-50"
        title=""
        :show-back="true"
        @back="$router.back()"
      >
        <template #extra>
          <a-space>
              <a-button type="outline" size="small">回复</a-button>
              <a-button type="outline" size="small">转发</a-button>
              <a-popconfirm content="确认删除此邮件？" @ok="handleDelete">
                <a-button status="danger" size="small">删除</a-button>
              </a-popconfirm>
          </a-space>
        </template>
      </a-page-header> -->

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
          <div class="flex flex-wrap gap-2">
            <h2 class="text-sm font-medium text-gray-600 mb-2">收件人</h2>
            <a-tag>{{ mailData?.receiver }}</a-tag>
          </div>
        </div>

        <!-- 抄送信息 -->
        <div v-if="mailData?.cc" class="mb-6">
          <h2 class="text-sm font-medium text-gray-600 mb-2">抄送</h2>
          <div class="flex flex-wrap gap-2">
            <!--            <a-tag v-for="(cc, index) in mailData?.cc" :key="index" type="gray">-->
            <!--              {{ cc }}-->
            <!--            </a-tag>-->
            <a-tag>{{ mailData?.cc }}</a-tag>
          </div>
        </div>

        <!-- 邮件正文 -->
        <div class="border-t border-gray-200 pt-6">
          <div
            class="prose max-w-none text-gray-800"
            v-html="mailData?.original"
          ></div>
        </div>
      </div>
    </div>
  </a-layout>
</template>

<script setup lang="ts">
  import { ref, onBeforeMount, reactive } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import Footer from '@/components/footer/index.vue';
  import { useRoute } from 'vue-router';
  import { queryMailMsgDetail, MailMsgRes } from '@/api/mailmsg';

  interface Props {
    mailData?: MailMsgRes;
  }
  
  const props = defineProps<Props>();


  const handleDelete = () => {
    Message.success('邮件已删除');
  };
</script>

<style scoped>
  
</style>
