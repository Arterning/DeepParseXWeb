<template>
  <div class="h-full flex flex-col space-y-4">
    <!-- 参数设置区域 -->
    <div class="bg-white p-6 rounded-lg shadow-sm border">
      <h3 class="text-lg font-semibold mb-4">分析参数设置</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- 邮箱选择 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">选择邮箱</label>
          <a-select
            v-model="selectedMailboxes"
            multiple
            :allow-search="true"
            placeholder="请选择要分析的邮箱"
            class="w-full"
            :loading="loadingMailboxes"
            @search="handleSearch"
          >
            <a-option v-for="mailbox in mailboxes" :key="mailbox.name" :value="mailbox.name">
              {{ mailbox.name }}
            </a-option>
          </a-select>
        </div>

        <!-- 最大分析层级 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">最大分析层级</label>
          <a-input-number
            v-model:value="maxLayers"
            :min="1"
            :max="10"
            placeholder="默认3层"
            class="w-full"
          />
        </div>

        <!-- 开始时间 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">开始时间</label>
          <a-date-picker
            v-model:value="startTime"
            show-time
            placeholder="选择开始时间"
            class="w-full"
          />
        </div>

        <!-- 结束时间 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">结束时间</label>
          <a-date-picker
            v-model:value="endTime"
            show-time
            placeholder="选择结束时间"
            class="w-full"
          />
        </div>

        <!-- 基准时间 -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">基准时间（可选）</label>
          <a-date-picker
            v-model:value="referenceTime"
            show-time
            placeholder="时间权重计算的基准时间"
            class="w-full"
          />
        </div>
      </div>

      <!-- 分析按钮 -->
      <div class="mt-6 flex justify-center">
        <a-button
          type="primary"
          size="large"
          :loading="analyzing"
          :disabled="selectedMailboxes.length === 0"
          @click="startAnalysis"
        >
          开始分析
        </a-button>
      </div>
    </div>

    <!-- 分析结果区域 -->
    <div v-if="analysisResult" class="bg-white rounded-lg shadow-sm border flex-1">
      <div class="p-4 border-b">
        <h3 class="text-lg font-semibold">分析结果</h3>
        <div class="text-sm text-gray-500 mt-1">
          节点数量: {{ analysisResult.nodes.length }}，关系数量: {{ analysisResult.edges.length }}
        </div>
      </div>

      <!-- 图谱容器 -->
      <div ref="graphContainer" class="h-96 w-full"></div>
    </div>

    <!-- 无结果提示 -->
    <div v-else-if="hasSearched && !analyzing" class="bg-white rounded-lg shadow-sm border flex-1 flex items-center justify-center">
      <a-empty description="暂无分析结果" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { Message } from '@arco-design/web-vue';
import dayjs, { type Dayjs } from 'dayjs';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import {
  queryMailBoxList,
  analyzeMailboxRelationships,
  type MailBoxRes,
  type AnalyzeRelationshipsReq,
  type AnalyzeRelationshipsRes
} from '@/api/mailbox';

cytoscape.use(coseBilkent);

// 表单数据
const selectedMailboxes = ref<string[]>([]);
const maxLayers = ref<number>(3);
const startTime = ref<Dayjs | null>(null);
const endTime = ref<Dayjs | null>(null);
const referenceTime = ref<Dayjs | null>(null);

// 状态
const loadingMailboxes = ref(false);
const analyzing = ref(false);
const hasSearched = ref(false);

// 数据
const mailboxes = ref<MailBoxRes[]>([]);
const analysisResult = ref<AnalyzeRelationshipsRes | null>(null);

// 图谱
const graphContainer = ref<HTMLDivElement | null>(null);
const cy = ref<cytoscape.Core | null>(null);

// 加载邮箱列表
const loadMailboxes = async () => {
  if (mailboxes.value.length > 0) return;

  loadingMailboxes.value = true;
  try {
    const res = await queryMailBoxList({
      page: 1,
      size: 10
    });
    mailboxes.value = res.items;
  } catch (error) {
    Message.error('加载邮箱列表失败');
  } finally {
    loadingMailboxes.value = false;
  }
};

const handleSearch = async (value: string) => {
  loadingMailboxes.value = true;
  try {
    const res = await queryMailBoxList({
      page: 1,
      size: 10,
      name: value,
    });
    mailboxes.value = res.items;
  } catch (error) {
    Message.error('加载邮箱列表失败');
  } finally {
    loadingMailboxes.value = false;
  }
};

// 开始分析
const startAnalysis = async () => {
  if (selectedMailboxes.value.length === 0) {
    Message.warning('请先选择邮箱');
    return;
  }

  analyzing.value = true;
  hasSearched.value = true;

  try {
    const params: AnalyzeRelationshipsReq = {
      mailboxes: selectedMailboxes.value,
      max_layers: maxLayers.value,
    };

    if (startTime.value) {
      params.start_time = startTime.value.toISOString();
    }

    if (endTime.value) {
      params.end_time = endTime.value.toISOString();
    }

    if (referenceTime.value) {
      params.reference_time = referenceTime.value.toISOString();
    }

    analysisResult.value = await analyzeMailboxRelationships(params);

    // 渲染图谱
    await nextTick();
    renderGraph();

    Message.success('分析完成');
  } catch (error) {
    Message.error('分析失败');
    analysisResult.value = null;
  } finally {
    analyzing.value = false;
  }
};

// 渲染图谱
const renderGraph = () => {
  if (!graphContainer.value || !analysisResult.value) return;

  // 清理之前的图谱
  if (cy.value) {
    cy.value.destroy();
  }

  const elements = [
    ...analysisResult.value.nodes.map(node => ({
      data: {
        id: node.id,
        label: node.label,
        email_count: node.email_count,
        layer: node.layer,
        weight: node.email_count
      }
    })),
    ...analysisResult.value.edges.map(edge => ({
      data: {
        id: `${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        weight: edge.weight,
        email_count: edge.email_count,
        latest_time: edge.latest_time,
        relation_type: edge.relation_type
      }
    }))
  ];

  cy.value = cytoscape({
    container: graphContainer.value,
    elements,
    wheelSensitivity: 0.2,
    style: [
      {
        selector: 'node',
        style: {
          'label': 'data(label)',
          'text-valign': 'center',
          'text-halign': 'center',
          'background-color': '#06b6d4',
          'color': '#ffffff',
          'text-outline-color': '#0e7490',
          'text-outline-width': '2px',
          'width': 'mapData(weight, 0, 100, 30, 80)',
          'height': 'mapData(weight, 0, 100, 30, 80)',
          'font-size': '12px',
          'text-wrap': 'wrap',
          'text-max-width': '100px',
          'overlay-opacity': 0,
          'border-width': 2,
          'border-color': '#0891b2'
        }
      },
      {
        selector: 'node[layer = 0]',
        style: {
          'background-color': '#dc2626',
          'border-color': '#b91c1c'
        }
      },
      {
        selector: 'node[layer = 1]',
        style: {
          'background-color': '#ea580c',
          'border-color': '#c2410c'
        }
      },
      {
        selector: 'node[layer = 2]',
        style: {
          'background-color': '#d97706',
          'border-color': '#b45309'
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 'mapData(weight, 0, 10, 2, 8)',
          'line-color': '#64748b',
          'target-arrow-color': '#64748b',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'opacity': 0.8
        }
      },
      {
        selector: 'edge[relation_type = "send"]',
        style: {
          'line-color': '#059669',
          'target-arrow-color': '#059669'
        }
      },
      {
        selector: 'edge[relation_type = "receive"]',
        style: {
          'line-color': '#7c3aed',
          'target-arrow-color': '#7c3aed'
        }
      }
    ],
    layout: {
      name: 'cose-bilkent',
      animate: false,
      nodeDimensionsIncludeLabels: true,
      nodeRepulsion: 8000,
      idealEdgeLength: 100,
      edgeElasticity: 0.1
    }
  });

  // 添加节点点击事件
  cy.value.on('tap', 'node', (event) => {
    const node = event.target;
    const data = node.data();
    Message.info(`邮箱: ${data.label}, 邮件数量: ${data.email_count}, 层级: ${data.layer}`);
  });

  // 添加边点击事件
  cy.value.on('tap', 'edge', (event) => {
    const edge = event.target;
    const data = edge.data();
    Message.info(`关系: ${data.source} -> ${data.target}, 权重: ${data.weight}, 邮件数: ${data.email_count}`);
  });
};

onMounted(() => {
  loadMailboxes();
});
</script>