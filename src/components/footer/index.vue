<template>
  <a-layout-footer class="footer">启迪数据智能</a-layout-footer>
</template>

<script lang="ts" setup>
import { onActivated } from 'vue';
import { changeTheme } from '@/hooks/theme';


onActivated(() => {
  changeTheme();
})

</script>

<style lang="less" scoped>
  .footer {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 40px;
    color: var(--color-text-2);
    text-align: center;
  }
</style>
