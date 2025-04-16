<template>
  <Breadcrumb />
  <div class="general-card">
    <a-card v-if="info" class="content-box">
      <ExcelDetail v-if="info.type === 'excel'" :title="info.title" :desc="info.desc" :doc_data="info.doc_data"
        :file="info.file" />
      <EmailDetail v-else-if="info.type === 'email'" :info="info" />
      <GeneralDetail v-else :info="info" />
    </a-card>
  </div>
  <Footer />
</template>

<script lang="ts" setup>
import { querySysDocDetail, SysDocRes } from '@/api/doc';
import useLoading from '@/hooks/loading';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useDocStore, useTabBarStore } from '@/store';
import Footer from '@/components/footer/index.vue';
import GeneralDetail from './general-detail.vue';
import ExcelDetail from './excel-detail.vue';
import EmailDetail from './email-detail.vue';


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