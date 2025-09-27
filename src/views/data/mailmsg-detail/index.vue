<template>
  <a-layout class="flex-layout">
    <!-- <a-page-header title="邮件详情" :show-back="true" @back="$router.back()"></a-page-header> -->
    <a-card v-if="info" class="general-card" :loading="loading">
      <Breadcrumb />
      <a-tabs>
        <a-tab-pane key="1" title="邮件内容">
          <Content :info="info" />
        </a-tab-pane>
        <a-tab-pane key="2" title="基本信息">
          <BasicInfo :info="doc" />
          <FileDescription :info="doc" class="mt-4"/>
        </a-tab-pane>
        <a-tab-pane key="3" title="实体信息">
          <Entity v-if="doc" :info="doc" />
        </a-tab-pane>
        <a-tab-pane key="4" title="关系图谱">
          <a-skeleton :loading="extractGraphLoading" :animation="true">
            <a-space direction="vertical" :style="{width:'100%'}" size="large">
              <a-skeleton-line :rows="8" />
            </a-space>
          </a-skeleton>
          <div class="flex flex-col h-screen" v-if="!extractGraphLoading">
            <div class="flex flex-col flex-1 overflow-hidden">
              <GraphControls 
                class="p-2 border-b"
                :initial-data="graphData"
                @extract-graph="handleExtractGraph"
                @dataChange="handleDataChange"
              />
              <KnowledgeGraph 
                class="flex-1" 
                :graph-data="graphData" 
                @dataChange="handleDataChange"
              />
            </div>
          </div>
        </a-tab-pane>       
      </a-tabs>
    </a-card>
    <Footer />
  </a-layout>
</template>

<script lang="ts" setup>
import { querySysDocDetail, extractGraphData } from '@/api/doc';
import useLoading from '@/hooks/loading';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import Content from './content.vue';
import Footer from '@/components/footer/index.vue';
import { MailMsgRes, queryMailMsgDetail } from '@/api/mailmsg';
import Entity from './entity.vue';
import BasicInfo from '../components/basic-info.vue';
import FileDescription from '../components/FileDescription.vue';
import GraphControls from './GraphControls.vue';
import KnowledgeGraph from './KnowledgeGraph.vue';

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
const doc = ref<any>();

const { id } = route.params;

onMounted(async () => {
  setLoading(true);
  info.value = await queryMailMsgDetail(Number(id));

  if (info.value.doc_id) {
    doc.value = await querySysDocDetail(info.value.doc_id);
    console.log(doc.value);
  }
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