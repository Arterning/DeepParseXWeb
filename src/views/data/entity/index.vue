<template>
    <a-layout class="flex-layout">
      <div class="general-card py-4">
        <a-tabs default-active-key="1">

          <a-tab-pane key="0">
            <template #title>
              <icon-layers /> 实体
            </template>
            <EntityInfo />
          </a-tab-pane>

          <a-tab-pane key="1">
            <template #title>
              <icon-share-alt /> 关系
            </template>
            <SPOTable />
          </a-tab-pane>
          
          <a-tab-pane key="2">
            <template #title>
              <icon-code /> 邮件
            </template>
            <EmailMsgTable />
          </a-tab-pane>
          
          <a-tab-pane key="3">
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
  import EntityInfo from './entity-info.vue';
  import EmailBoxTable from '@/views/data/mailbox/index.vue'
  import EmailMsgTable from '@/views/data/mailmsg/index.vue'
  import SPOTable from './spo.vue';
  </script>
  