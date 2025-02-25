<script lang="ts" setup>
  import { computed } from 'vue';
  import  { marked } from 'marked';
  import katex from 'katex';
  import 'katex/dist/katex.min.css';  

  import { Message } from '../types';

  // message：接受消息对象，展示消息内容和头像，并且根据角色调整消息位置。
  const props = defineProps<{
    message: Message;
  }>();

  const botAnswer = computed(() => {
    const raw = props.message.content as string;
    // 处理内联数学公式（比如: \( ... \)）
    let htmlContent = raw.replace(
      /\\\((.*?)\\\)/g,  // 匹配 \( ... \)
      (_: any, formula: string) => `<span>${katex.renderToString(formula)}</span>`
    );

    // 处理块级数学公式（比如: \[ ... \]）
    htmlContent = htmlContent.replace(
      /\\\[(.*?)\\\]/gs,  // 匹配 \[ ... \]
      (_: any, formula: string) => `<div>${katex.renderToString(formula)}</div>`
    );
    
    // 处理markdown格式
    htmlContent = marked(htmlContent) as string; 

    return htmlContent;
  })

  const userQuestion = computed(()=>{
    return props.message.content;
  })

</script>
<template>
  <div class="msg"
  :class="message.sender === 'user'? 'user-mode': 'bot-mode'">
    <a-avatar v-if="message.sender === 'bot'" class="avator">
      <IconRobot />
    </a-avatar>
    <div class="chat-area">
      <div v-if="message.status==='waiting'">
        <a-spin />
      </div>
      <div v-else-if="message.status==='success'&&message.sender==='bot'" v-html="botAnswer" class="markdown-body"></div>        
      <div v-else-if="message.status==='success'&&message.sender==='user'" v-html="userQuestion" class="user-question"></div> 
      <div v-else-if="message.status==='failure'" class="fail-response">
        <icon-exclamation-polygon-fill /> {{ message.content }}
      </div>
    </div>
    <a-avatar v-if="message.sender === 'user'" class="avator">
      <IconUser />
    </a-avatar>
  </div>
</template>

<style lang="less" scoped>
  .msg{
    display: flex;
  }
	.markdown-body {
    // font-size: 15px;
		box-sizing: border-box;
		min-width: 960px;
    max-width: 1024px;
    background: transparent;
    color: var(--color-text-2);
    line-height: 2rem;
    letter-spacing: 1px;
	}
	@media (max-width:1600px) {
		.markdown-body {
      min-width: 650px;
		}
	}
	@media (max-width:1024px) {
		.markdown-body {
      min-width: 540px;
      width: 540px;
		}
	}

  .avator{
    min-width: 3rem;
  }

  .chat-area{
    margin: 0.5rem 1rem 1rem 1rem;
    flex: 1;
    min-width: 960px;
    max-width: 1024px;
    white-space: wrap;
  }
  .user-question{
    float: right;
    max-width: 480px;
    background: var(--color-bg-2);
    box-shadow: 0 0 2px var(--color-text-3);
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
    word-wrap: break-word;
    word-break: normal;
  }
  .fail-response{
    color:  var(--color-text-2);
  }
  .katex{
    position: relative;
  }
  :deep(.md-editor-preview-wrapper) {
    padding: 4px;
  }
  :deep(.github-theme p:last-child) {
    margin-bottom: 0;
  }

  :deep(.github-theme ul:last-child) {
    margin-bottom: 0;
  }

  :deep(.github-theme ol:last-child) {
    margin-bottom: 0;
  }

  :deep(.github-theme ul) {
    list-style-type: disc;
  }
  :deep(.github-theme ol) {
    list-style-type: decimal;
  }
</style>
