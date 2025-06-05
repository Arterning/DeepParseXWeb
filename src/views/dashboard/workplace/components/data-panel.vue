<template>
  <a-grid :cols="72" :row-gap="16" class="panel">
    <a-grid-item
      :span="{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12, xxl: 6 }"
      class="panel-col"
    >
      <a-space>
        <AssetSvg class="w-16 h-16"/>
        <a-statistic
          :title="$t('文件总数')"
          :value="dashboardCount.all"
          :value-from="0"
          animation
          show-group-separator
        >
          <template #suffix>
            <span class="unit">{{ $t('workplace.pecs') }}</span>
          </template>
        </a-statistic>
      </a-space>
    </a-grid-item>
    <a-grid-item
      :span="{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12, xxl: 6 }"
      class="panel-col"
    >
      <a-space>
        <PdfSvg class="w-16 h-16"/>
        <a-statistic
          :title="$t('PDF')"
          :value="dashboardCount.group.PDF"
          :value-from="0"
          animation
          show-group-separator
        >
          <template #suffix>
            <span class="unit">{{ $t('workplace.pecs') }}</span>
          </template>
        </a-statistic>
      </a-space>
    </a-grid-item>
    <a-grid-item
      :span="{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12, xxl: 6 }"
      class="panel-col"
    >
      <a-space>
        <TextSvg class="w-16 h-16"/>
        <a-statistic
          :title="$t('文本')"
          :value="dashboardCount.group.文本"
          :value-from="0"
          animation
          show-group-separator
        >
          <template #suffix>
            <span class="unit">{{ $t('workplace.pecs') }}</span>
          </template>
        </a-statistic>
      </a-space>
    </a-grid-item>
    <a-grid-item
      :span="{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12, xxl: 6 }"
      class="panel-col"
      style="border-right: none"
    >
      <a-space>
        <ExcelSvg class="w-16 h-16"/>
        <a-statistic
          :title="$t('表格')"
          :value="dashboardCount.group.表格"
          :value-from="0"
          animation
        >
        <template #suffix>
          <span class="unit">{{ $t('workplace.pecs') }}</span>
        </template>
        </a-statistic>
      </a-space>
    </a-grid-item>
    <a-grid-item
      :span="{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12, xxl: 6 }"
      class="panel-col"
      style="border-right: none"
    >
      <a-space>
        <PictureSvg class="w-16 h-16"/>
        <a-statistic
          :title="$t('图片')"
          :value="dashboardCount.group.图片"
          :value-from="0"
          animation
        >
        <template #suffix>
          <span class="unit">{{ $t('workplace.pecs') }}</span>
        </template>
        </a-statistic>
      </a-space>
    </a-grid-item>
    <a-grid-item
      :span="{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12, xxl: 6 }"
      class="panel-col"
      style="border-right: none"
    >
      <a-space>
        <MediaSvg class="w-16 h-16"/>
        <a-statistic
          :title="$t('媒体')"
          :value="dashboardCount.group.媒体"
          :value-from="0"
          animation
        >
        <template #suffix>
          <span class="unit">{{ $t('workplace.pecs') }}</span>
        </template>
        </a-statistic>
      </a-space>
    </a-grid-item>
    <a-grid-item :span="24">
      <a-divider class="panel-border" />
    </a-grid-item>
  </a-grid>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue';
import TextSvg from '@/assets/svg/text.svg';
import PdfSvg from '@/assets/svg/pdf.svg';
import MediaSvg from '@/assets/svg/media.svg';
import AssetSvg from '@/assets/svg/asset.svg';
import PictureSvg from '@/assets/svg/picture.svg';
import MailSvg from '@/assets/svg/email.svg';
import ExcelSvg from '@/assets/svg/excel.svg';
import { queyDashboard, DashboardRes } from '@/api/dashboard';

const dashboardCount = ref<DashboardRes>({
  
})
const fetchDashboardApi = async () => {
    const res = await queyDashboard();
    dashboardCount.value = res;
    // console.log(dashboardCount.value);
};

onMounted(async () => {
  await fetchDashboardApi();
});
// fetchDashboardApi();
</script>

<style lang="less" scoped>
  .arco-grid.panel {
    margin-bottom: 0;
    padding: 16px 20px 0 20px;
  }

  .panel-col {
    padding-left: 43px;
    border-right: 1px solid rgb(var(--gray-2));
  }

  .col-avatar {
    margin-right: 12px;
    background-color: var(--color-fill-2);
  }

  .up-icon {
    color: rgb(var(--red-6));
  }

  .unit {
    margin-left: 8px;
    color: rgb(var(--gray-8));
    font-size: 12px;
  }

  :deep(.panel-border) {
    margin: 4px 0 0 0;
  }
</style>