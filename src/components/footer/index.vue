<template>
  <a-layout-footer class="footer">{{ t('login.form.sub_title') }}</a-layout-footer>
</template>

<script lang="ts" setup>
import { onActivated } from 'vue';
import { changeTheme } from '@/hooks/theme';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();


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
