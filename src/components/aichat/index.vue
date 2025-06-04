<script lang="ts" setup>
  import { useRouter } from 'vue-router';
  import RobotIconSvg from '@/assets/svg/robot-icon.svg';
  
  const router = useRouter();

  const handleOpen = () => {
    router.push({
      name: 'aiAssistant'
    })
  }

</script>

<template>
  <RobotIconSvg class="h-12 w-12 cursor-pointer" @click="handleOpen" />
</template>

<style lang="less" scoped>
  
</style>
