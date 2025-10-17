<template>
  <a-layout class="flex-layout">
    <!-- <a-page-header title="邮件详情" :show-back="true" @back="$router.back()"></a-page-header> -->
    <a-card v-if="info" class="general-card" :loading="loading">
      <Breadcrumb />
      <a-tabs>
        <a-tab-pane key="1" title="邮件内容">
          <div class="content">
            <Content :info="info" @extract-graph="handleExtractGraph" />            
          </div>      
        </a-tab-pane>
        <a-tab-pane key="2" title="基本信息">
          <div class="content">
            <BasicInfo :info="doc" />
            <FileDescription :info="doc" class="mt-4"/>
            <FileTranslation :info="doc" class="mt-4"/>
          </div>
        </a-tab-pane>
        <a-tab-pane key="3" title="关系图谱">
          <div class="content">
            <a-skeleton :loading="extractGraphLoading" :animation="true">
              <a-space direction="vertical" :style="{width:'100%'}" size="large">
                <a-skeleton-line :rows="8" />
              </a-space>
            </a-skeleton>
            <div class="flex flex-col" v-if="!extractGraphLoading">
              <GraphControls 
                class="pb-4 border-b"
                :initial-data="graphData"
                @extract-graph="handleExtractGraph"
                @dataChange="handleDataChange"
              />
              <!-- <KnowledgeGraph 
                class="flex-1" 
                :graph-data="graphData" 
                @dataChange="handleDataChange"
              /> -->
              <RelationGraph
                :graph-data="graphData" 
                @dataChange="handleDataChange"
              /> 
            </div>
          </div>
        </a-tab-pane>   
        <a-tab-pane v-if="doc.entities" key="4" title="实体信息">
          <div class="content">
            <Entity :entities="doc.entities" />
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
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import Content from './content.vue';
import Footer from '@/components/footer/index.vue';
import { MailMsgRes, queryMailMsgDetail } from '@/api/mailmsg';
import BasicInfo from '../components/basic-info.vue';
import FileDescription from '../components/FileDescription.vue';
import FileTranslation from './components/FileTranslation.vue';
import GraphControls from './GraphControls.vue';
import KnowledgeGraph from './KnowledgeGraph.vue';
import RelationGraph from '../components/RelationGraph.vue';
import Entity from './entity.vue';
import { Message } from '@arco-design/web-vue';

const graphData = ref({
  nodes: [],
  edges: []
});

const extractGraphLoading = ref(false);

// localStorage 工具
const STORAGE_KEY = 'extractGraphLoadingMap';
const getLoadingMap = (): Record<string, boolean> => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};
const setLoadingMap = (docId: string, value: boolean) => {
  const map = getLoadingMap();
  map[docId] = value;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
};
const getLoadingStatus = (docId: string): boolean => {
  const map = getLoadingMap();
  return !!map[docId];
};

const handleDataChange = (newData: any) => {
  graphData.value = newData;
};

const info = ref<MailMsgRes>();
const doc = ref<any>();
const entities = ref<any[]>();

const route = useRoute();
const { loading, setLoading } = useLoading(true);

const { id } = route.params;

const handleExtractGraph = async (entityTypes: string[]) => {
  if (!info.value) return;
  extractGraphLoading.value = true;
  Message.success('提取进行中');
  const res = await extractGraphData(info.value.doc_id, entityTypes);
  extractGraphLoading.value = false;
  handleDataChange(res);
};

watch(extractGraphLoading, (val) => {
  if (info.value?.doc_id) {
    setLoadingMap(String(info.value.doc_id), val);
  }
});

onMounted(async () => {
  setLoading(true);
  info.value = await queryMailMsgDetail(Number(id));
  console.log(info.value);
  
  if (info.value.doc_id) {
    doc.value = await querySysDocDetail(info.value.doc_id);
    graphData.value = doc.value.graph_data;
    
    extractGraphLoading.value = getLoadingStatus(String(info.value.doc_id));
  }
  
  setLoading(false);
});
</script>
 