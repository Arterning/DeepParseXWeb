<template>
  <a-layout class="flex-layout">
    <Breadcrumb />
    <div class="general-card">
      <a-card v-if="info" class="content-box" :loading="loading">
        <a-tabs>
          <a-tab-pane key="1" title="文件内容">
            <TextDetail v-if="info.type === '文本'" :info="info" />
            <ExcelDetail v-else-if="info.type === '表格'" :info="info" />
            <PdfDetail v-else-if="info.type === 'PDF'" :info="info" />
            <PictureDetail v-else-if="info.type == '图片'" :info="info" />
            <MediaDetail v-else-if="info.type == '媒体'" :info="info" />
            <EmailDetail v-else-if="info.type == '邮件'" :mailData="info.email_msg" />
            <TextDetail v-else :info="info" />
          </a-tab-pane>
          <a-tab-pane key="2" title="基本信息">
            <BasicInfo :info="info" />
            <FileDescription :info="info" class="mt-2"/>
          </a-tab-pane>
          <!-- <a-tab-pane key="3" title="文件总结">
            <FileDescription :info="info" />
          </a-tab-pane> -->
          <a-tab-pane key="4" title="知识图谱">
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

          <a-tab-pane key="5" title="问问AI">
            <DocAIChat :doc-info="info" />
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </div>
  </a-layout>
  <Footer />
</template>

<script lang="ts" setup>
import { querySysDocDetail, SysDocRes, extractGraphData } from '@/api/doc';
import useLoading from '@/hooks/loading';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import Footer from '@/components/footer/index.vue';
import ReactSvg from '@/assets/svg/react.svg';
import BasicInfo from './basic-info.vue';
import TextDetail from './text-detail.vue';
import PdfDetail from './pdf-detail.vue';
import ExcelDetail from './excel-detail.vue';
import PictureDetail from './picture-detail.vue';
import MediaDetail from './media-detail.vue';
import EmailDetail from './email-detail.vue';
import GraphControls from './GraphControls.vue';
import KnowledgeGraph from './KnowledgeGraph.vue';
import DocAIChat from './components/DocAIChat.vue';
import FileDescription from './components/FileDescription.vue';

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