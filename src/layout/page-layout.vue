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
    animation: slideInLeft 0.25s;
    animation-delay: 0.25s;
  }
  .move-leave-active {
    animation: slideOutRight 0.25s;
  }
  @keyframes slideOutRight {
    from {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }

    to {
      // visibility: hidden;
      transform: translate3d(2rem, 0, 0);
      opacity: 0;
    }
  }
  @keyframes slideInLeft {
    from {
      transform: translate3d(-2rem, 0, 0);
      // visibility: visible;
      opacity: 0;
    }

    to {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }
  }

  @keyframes backOutRight {
    0% {
      transform: scale(1);
      opacity: 1;
    }

    20% {
      transform: translateX(0px) scale(0.7);
      opacity: 0.7;
    }

    100% {
      transform: translateX(2000px) scale(0.7);
      opacity: 0.7;
    }
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
