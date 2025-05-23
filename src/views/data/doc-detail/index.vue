<template>
  <a-layout class="flex-layout">
    <Breadcrumb />
    <div class="general-card">
      <a-card v-if="info" class="content-box" :loading="loading">
        <a-tabs>
          <a-tab-pane key="1" title="基本信息">
            <TextDetail v-if="info.type === 'text'" :info="info" />
            <ExcelDetail v-if="info.type === 'excel'" :info="info" />
            <PdfDetail v-if="info.type === 'pdf'" :info="info" />
            <PictureDetail v-if="info.type == 'picture'" :info="info" />
            <MediaDetail v-if="info.type == 'media'" :info="info" />
          </a-tab-pane>
          <a-tab-pane key="2" title="知识图谱">
            <div class="flex flex-col h-screen bg-gray-900 text-gray-100">
              <div class="flex flex-col flex-1 overflow-hidden">
                <GraphControls 
                  class="bg-gray-800 p-2 border-b border-gray-700"
                  :initial-data="graphData"
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
import PictureDetail from './picture-detail.vue';
import MediaDetail from './media-detail.vue';
import GraphControls from './GraphControls.vue';
import KnowledgeGraph from './KnowledgeGraph.vue';

const graphData = ref({
  nodes: [],
  edges: []
});

const handleDataChange = (newData: any) => {
  graphData.value = newData;
};

const route = useRoute();
const { loading, setLoading } = useLoading(true);

const info = ref<SysDocRes>();

const { id } = route.params;

onMounted(async () => {
  setLoading(true);
  info.value = await querySysDocDetail(Number(id));
  graphData.value = info.value.graph_data as any;
  setLoading(false);
})

</script>

<style scoped lang="less">
.content-box {
  border: none;
  // width: 70vw;
}
</style>