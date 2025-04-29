<template>
  <div
    class="h-full flex flex-col bg-white rounded-lg shadow-sm overflow-hidden"
  >
    <!-- 邮件头部 -->
    <a-page-header
      class="border-b border-gray-200 bg-blue-50"
      title="邮件详情"
      :show-back="true"
      @back="$router.back()"
    >
      <template #extra>
        <a-space>
          <!--          <a-button type="outline" size="small">回复</a-button>-->
          <!--          <a-button type="outline" size="small">转发</a-button>-->
          <!--          <a-popconfirm content="确认删除此邮件？" @ok="handleDelete">-->
          <!--            <a-button status="danger" size="small">删除</a-button>-->
          <!--          </a-popconfirm>-->
        </a-space>
      </template>
    </a-page-header>

    <!-- 邮件内容区域 -->
    <div class="flex-1 overflow-y-auto p-6">
      <!-- 邮件标题 -->
      <h1 class="text-2xl font-semibold text-gray-900 mb-2">
        {{ mailData.subject }}
      </h1>

      <!-- 元信息区域 -->
      <div class="flex flex-wrap gap-4 mb-6">
        <div class="flex items-center gap-2 text-gray-600">
          <a-icon-user />
          <span>{{ mailData.sender }}</span>
        </div>
        <div class="flex items-center gap-2 text-gray-600">
          <a-icon-calendar />
          <span>{{ formatDate(mailData.sendTime) }}</span>
        </div>
        <div class="flex items-center gap-2 text-gray-600">
          <a-icon-tag />
          <span>{{ mailData.type }}</span>
        </div>
      </div>

      <!-- 收件人信息 -->
      <div class="mb-6">
        <h2 class="text-sm font-medium text-gray-600 mb-2">收件人</h2>
        <div class="flex flex-wrap gap-2">
          <a-tag v-for="(recipient, index) in mailData.recipients" :key="index">
            {{ recipient }}
          </a-tag>
        </div>
      </div>

      <!-- 抄送信息 -->
      <div v-if="mailData.cc && mailData.cc.length" class="mb-6">
        <h2 class="text-sm font-medium text-gray-600 mb-2">抄送</h2>
        <div class="flex flex-wrap gap-2">
          <a-tag v-for="(cc, index) in mailData.cc" :key="index" type="gray">
            {{ cc }}
          </a-tag>
        </div>
      </div>

      <!-- 邮件正文 -->
      <div class="border-t border-gray-200 pt-6">
        <div
          class="prose max-w-none text-gray-800"
          v-html="mailData.content"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { Message } from '@arco-design/web-vue';

  interface MailData {
    subject: string;
    sender: string;
    recipients: string[];
    cc?: string[];
    sendTime: Date;
    type: string;
    content: string;
  }

  const mailData = ref<MailData>({
    subject: '关于2024年第二季度项目计划的重要通知',
    sender: 'project@company.com',
    recipients: ['user1@example.com', 'user2@example.com'],
    cc: ['manager@company.com', 'director@company.com'],
    sendTime: new Date(),
    type: '工作邮件',
    content: `<p>尊敬的各位同事：</p>
           <p>现将2024年第二季度项目计划相关事项通知如下：</p>
           <ol>
             <li>项目启动会将于3月25日14:00在会议室A召开</li>
             <li>请各小组在4月1日前提交初步方案</li>
             <li>预算申报截止日期调整为4月10日</li>
             <li>项目启动会将于3月25日14:00在会议室A召开</li>
             <li>请各小组在4月1日前提交初步方案</li>
             <li>预算申报截止日期调整为4月10日</li>
             <li>项目启动会将于3月25日14:00在会议室A召开</li>
             <li>请各小组在4月1日前提交初步方案</li>
             <li>预算申报截止日期调整为4月10日</li>
             <li>项目启动会将于3月25日14:00在会议室A召开</li>
             <li>请各小组在4月1日前提交初步方案</li>
             <li>预算申报截止日期调整为4月10日</li>
             <li>项目启动会将于3月25日14:00在会议室A召开</li>
             <li>请各小组在4月1日前提交初步方案</li>
             <li>预算申报截止日期调整为4月10日</li>
           </ol>
           <p>请务必准时参加并做好相关准备。</p>
           <p>此致<br>敬礼</p>
           <p>项目办公室</p>`,
  });

  const formatDate = (date: Date) => {
    return date;
  };

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
