<script lang="ts" setup>
  import { computed } from 'vue';

  import RobotIconSvg from '@/assets/svg/robot-icon.svg';
  import { Message } from '../types';

  // message：接受消息对象，展示消息内容和头像，并且根据角色调整消息位置。
  const props = defineProps<{
    message: Message;
  }>();


  const messageContent = computed(()=>{
    return props.message.content;
  })

</script>
<template>
  <div class="flex items-center gap-x-2 overflow-auto min-w-3xl mt-2" 
    :class="message.sender === 'user'? 'justify-end': 'justify-start'">
    <a-avatar v-if="message.sender === 'bot'" class="bg-transparent">
      <RobotIconSvg class="h-20 w-20"/>
    </a-avatar>
    <!-- <RobotIconSvg v-if="message.sender === 'bot'" class="h-20 w-20"/> -->
    <div>
      <div v-if="message.status==='waiting'">
        <a-spin />
      </div>
      <MdPreview v-else-if="message.status==='success'&&message.sender==='bot'" class="bg-slate-200 p-2 rounded-lg"  :preview-theme="'github'" :model-value="messageContent" ></MdPreview>        
      <MdPreview v-else-if="message.status==='success'&&message.sender==='user'" class="bg-slate-200 p-2 rounded-lg" :preview-theme="'github'" :model-value="messageContent" ></MdPreview> 
      <MdPreview v-else-if="message.status==='failure'" class="fail-response" :model-value="messageContent" />
    </div>
    <a-avatar v-if="message.sender === 'user'" class="avator">
      <IconUser />
    </a-avatar>
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
