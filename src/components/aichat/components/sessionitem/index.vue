<script lang="ts" setup>
  import { ChatSession } from '../types';

  const props = defineProps<{ active: boolean; session: ChatSession }>();
  const emit = defineEmits(['delete']);
  const handleDeleteSession = () => {
    emit('delete', props.session);
  };
</script>

<template>
  <a-card hoverable class="session-item" :class="active? 'active-item': ''">
    <div class="row">
      <div class="name">{{ props.session.topic }}</div>
      <div class="btn-wrapper">
        <a-popconfirm
          content="确定要删除吗?"
          type="error"
          position="right"
          @ok="handleDeleteSession"
        >
          <icon-close-circle />
        </a-popconfirm>
      </div>
    </div>
    <div class="row">    
      <div class="time">{{ props.session.updatedAt }}</div>
    </div>
  
  </a-card>
</template>

<style lang="less" scoped>

  .active-item{
    border-color: #13c2c2;
    .name{
      color: #13c2c2;
    }
  }
  .session-item {
    margin-bottom: 0.5rem;
    cursor: default;
    .row{
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .name{
      max-width: 100%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .time{
      font-size: 0.8rem;
    }


  }
  .btn-wrapper{
    padding: 2px;
    cursor: pointer;
  }
  .btn-wrapper:hover{
    color: #13c2c2;
  }
</style>
