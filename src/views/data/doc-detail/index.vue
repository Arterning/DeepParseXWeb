<template>
  <a-layout class="flex-layout">
    <Breadcrumb />
    <div class="general-card">
      <a-card v-if="info" class="content-box" :loading="loading">
        <TextDetail v-if="info.type === 'text'" :info="info" />
        <ExcelDetail v-if="info.type === 'excel'" :info="info" />
        <PdfDetail v-if="info.type === 'pdf'" :info="info" />
        <PdfDetail v-if="info.type == 'picture'" :info="info" />
      </a-card>
    </div>
  </a-layout>
  <Footer />
</template>

<script lang="ts" setup>
import { querySysDocDetail, SysDocRes } from '@/api/doc';
import useLoading from '@/hooks/loading';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import Footer from '@/components/footer/index.vue';
import TextDetail from './text-detail.vue';
import PdfDetail from './pdf-detail.vue';
import ExcelDetail from './excel-detail.vue';



const route = useRoute();
const { loading, setLoading } = useLoading(true);

const info = ref<SysDocRes>();

const { id } = route.params;

onMounted(async () => {
  setLoading(true);
  info.value = await querySysDocDetail(Number(id));
  setLoading(false);
})

</script>

<style scoped lang="less">
.content-box {
  border: none;
  // width: 70vw;
}
</style>