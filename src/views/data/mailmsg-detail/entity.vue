<template>
    <div class="p-4">

    </div>
</template>

<script setup lang="ts">


  // onBeforeMount(async () => {
  //   const route = useRoute();
  //   const id = Number(route.params.id); // 获取路由参数中的 id
  //   const res = await queryMailMsgDetail(id);
  //   info.value = reactive(res);
  // });

  const props = defineProps<{
    info: any
  }>();

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
