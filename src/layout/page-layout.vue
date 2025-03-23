<template>
  <router-view v-slot="{ Component, route }">
    <Transition name="move">
      <keep-alive>
        <component :is="Component" :key="route.fullPath" />
      </keep-alive>
    </Transition>
  </router-view>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { useTabBarStore } from '@/store';

  const tabBarStore = useTabBarStore();
  const cacheList = computed(() => tabBarStore.getCacheList);
</script>

<style lang="less" >
  .move-enter-active {
    animation: puffIn 0.2s ease-in-out;
    animation-delay: 0.1s;
  }
  .move-leave-active {
    animation: vanishOut 0.1s ease-in-out;
  }

  @keyframes puffIn {
    0% {
      opacity: 0;
      transform-origin: 50% 50%;
      transform: scale(0.99, 0.99);
      filter: blur(20px);
    }
    100% {
      opacity: 1;
      transform-origin: 50% 50%;
      transform: scale(1, 1);
      filter: blur(0px);
    }
  }
  @keyframes vanishOut {
    0% {
      opacity: 1;
      transform-origin: 50% 50%;
      transform: scale(1, 1);
      filter: blur(0px);
    }
    100% {
      opacity: 0;
      transform-origin: 50% 50%;
      transform: scale(0.99, 0.99);
      filter: blur(20px);
    }
  }
</style>
