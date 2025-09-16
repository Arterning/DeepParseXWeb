<template>
  <div class="markdown-preview" v-html="renderedHtml"></div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{
  content: string;
}>();

const renderedHtml = computed(() => {
  return parseMarkdown(props.content);
});

function parseMarkdown(text: string): string {
  if (!text) return '';

  let html = text;

  // 转义HTML标签（除了我们要保留的链接）
  html = html.replace(/&/g, '&amp;');
  html = html.replace(/</g, '&lt;');
  html = html.replace(/>/g, '&gt;');

  // 恢复链接标签
  html = html.replace(/&lt;a\s+([^&]*)&gt;([^&]*)&lt;\/a&gt;/g, '<a $1>$2</a>');

  // 处理标题（需要在行首）
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

  // 处理粗体和斜体
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // 处理行内代码
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // 处理链接 [文本](链接)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // 处理有序列表
  html = html.replace(/^\d+\.\s+(.*)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>');

  // 处理无序列表
  html = html.replace(/^[-*+]\s+(.*)$/gm, '<li>$1</li>');
  // 避免重复包装已经在有序列表中的项目
  html = html.replace(/(?<!<ol>)(<li>(?!.*<\/ol>).*<\/li>)/s, '<ul>$1</ul>');

  // 处理换行
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');

  // 包装段落
  if (html && !html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<ol')) {
    html = '<p>' + html + '</p>';
  }

  return html;
}
</script>

<style lang="less" scoped>
.markdown-preview {
  line-height: 1.6;
  color: var(--color-text-1);

  :deep(h1) {
    font-size: 2em;
    font-weight: bold;
    margin: 0.67em 0;
    border-bottom: 1px solid var(--color-border-2);
    padding-bottom: 0.3em;
  }

  :deep(h2) {
    font-size: 1.5em;
    font-weight: bold;
    margin: 0.83em 0;
    border-bottom: 1px solid var(--color-border-2);
    padding-bottom: 0.3em;
  }

  :deep(h3) {
    font-size: 1.17em;
    font-weight: bold;
    margin: 1em 0;
  }

  :deep(p) {
    margin: 1em 0;
  }

  :deep(ul), :deep(ol) {
    margin: 1em 0;
    padding-left: 2em;
  }

  :deep(li) {
    margin: 0.25em 0;
  }

  :deep(a) {
    color: var(--color-link);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  :deep(strong) {
    font-weight: bold;
  }

  :deep(em) {
    font-style: italic;
  }

  :deep(code) {
    background-color: var(--color-fill-2);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: monospace;
    font-size: 0.85em;
  }

  :deep(br) {
    line-height: 1.6;
  }
}
</style>