<script lang="ts" setup>
  import { computed } from 'vue';

  import RobotIconSvg from '@/assets/svg/robot-icon.svg';
  import { useAppStore } from '@/store';
  import { Message } from '../types';
  import SimpleMarkdownPreview from '../SimpleMarkdownPreview.vue';
  
  // message：接受消息对象，展示消息内容和头像，并且根据角色调整消息位置。
  const props = defineProps<{
    message: Message;
  }>();


  const messageContent = computed(()=>{
    return props.message.content;
  })

  const themeStore = useAppStore();

</script>
<template>
  <div class="flex items-center gap-x-2 overflow-auto min-w-[50rem] mt-2" 
    :class="message.sender === 'user'? 'justify-end': 'justify-start'">
    
    <!-- 机器人头像 - 设置固定宽度并防止压缩 -->
    <div class="flex-shrink-0 w-12" v-if="message.sender === 'bot'">
      <a-avatar>
        <RobotIconSvg class="h-12 w-12"/>
      </a-avatar>
    </div>

    <div class="max-w-[calc(100%-4rem)] overflow-auto">
      <div v-if="message.status==='waiting'">
        <a-spin />
      </div>
      <SimpleMarkdownPreview v-else-if="message.status==='success'&&message.sender==='bot'" class="p-2 rounded-lg" :content="messageContent" />
      <SimpleMarkdownPreview v-else-if="message.status==='success'&&message.sender==='user'" class="p-2 rounded-lg" :content="messageContent" />
      <SimpleMarkdownPreview v-else-if="message.status==='failure'" class="p-2 rounded-lg" :content="messageContent" />
    </div>
    
    <!-- 用户头像 - 设置固定宽度并防止压缩 -->
    <div class="flex-shrink-0 w-12" v-if="message.sender === 'user'">
      <a-avatar class="avator">
        <IconUser />
      </a-avatar>
    </div>
  </div>
</template>

<style lang="less" scoped>
	
  .avator{
    min-width: 3rem;
  }

  
  .fail-response{
    color:  var(--color-text-2);
  }
  
</style>
