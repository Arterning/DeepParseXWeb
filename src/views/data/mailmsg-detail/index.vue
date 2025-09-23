<template>
  <a-layout class="flex-layout">
    <!-- <a-page-header title="邮件详情" :show-back="true" @back="$router.back()"></a-page-header> -->
    <a-card v-if="info" class="general-card" :loading="loading">
      <Breadcrumb />
      <a-tabs>
        <a-tab-pane key="1" title="邮件内容">
          <Content :info="info" />
        </a-tab-pane>
        <a-tab-pane key="2" title="实体信息">
          
        </a-tab-pane>
      </a-tabs>
    </a-card>
    <Footer />
  </a-layout>
</template>

<script lang="ts" setup>
import { extractGraphData } from '@/api/doc';
import useLoading from '@/hooks/loading';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import Content from './content.vue';
import Footer from '@/components/footer/index.vue';
import { MailMsgRes, queryMailMsgDetail } from '@/api/mailmsg';

const graphData = ref({
  nodes: [],
  edges: []
});

const extractGraphLoading = ref(false);

const handleDataChange = (newData: any) => {
  graphData.value = newData;
};

const handleExtractGraph = async () => {
  if (!info.value) return;
  extractGraphLoading.value = true;
  const res = await extractGraphData(info.value.id);
  extractGraphLoading.value = false;
  handleDataChange(res);
}

const route = useRoute();
const { loading, setLoading } = useLoading(true);

const info = ref<MailMsgRes>();

const { id } = route.params;

onMounted(async () => {
  setLoading(true);
  info.value = await queryMailMsgDetail(Number(id));
  // graphData.value = info.value.graph_data as any;
  setLoading(false);
})

</script>

<style scoped lang="less">
.content-box {
  border: none;
  // width: 70vw;
}
</style>