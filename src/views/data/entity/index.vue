<template>
    <a-layout class="flex-layout">
      <div class="general-card">
        <a-tabs default-active-key="1">

          <a-tab-pane key="0">
            <template #title>
              <icon-layers /> 实体
            </template>
            <!-- <EmailMsgTable /> -->
          </a-tab-pane>
          
          <a-tab-pane key="1">
            <template #title>
              <icon-code /> 邮件
            </template>
            <EmailMsgTable />
          </a-tab-pane>
          
          <a-tab-pane key="2">
            <template #title>
              <icon-at /> 邮箱
            </template>
            <EmailBoxTable />
          </a-tab-pane>
        </a-tabs>
      </div>
      <Footer />
    </a-layout>
  </template>
  
  <script setup lang="ts">
  import EmailBoxTable from '@/views/data/mailbox/index.vue'
  import EmailMsgTable from '@/views/data/mailmsg/index.vue'
  </script>
  