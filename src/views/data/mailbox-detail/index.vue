<template>
  <a-layout class="flex-layout">
    <a-card class="general-card">
      <Breadcrumb />
      <div class="p-6">
        <h4 class="text-lg font-semibold mb-3" style="color: var(--color-text-1);">基本信息</h4>
        <a-descriptions layout="vertical" class="mb-4">
          <a-descriptions-item label="邮箱名称">{{
            mailbox?.name
          }}</a-descriptions-item>
          <a-descriptions-item label="国家/地区">{{
            mailbox?.country
          }}</a-descriptions-item>
          <a-descriptions-item label="标签">{{
            mailbox?.tags
          }}</a-descriptions-item>
          <a-descriptions-item label="邮件数量">{{
            mailbox?.count
          }}</a-descriptions-item>
          <a-descriptions-item label="其他信息">{{
            mailbox?.other_info
          }}</a-descriptions-item>
        </a-descriptions>

        <h4 class="text-lg font-semibold mb-3" style="color: var(--color-text-1);">关系图谱</h4>
        <div class="w-full h-[320px] flex">
          
            <div class="space-y-4 w-[200px]">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">最大分析层级</label>
                <a-input-number v-model="maxLayers" :min="1" :max="10000"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">开始时间</label>
                <a-date-picker v-model:value="startTime"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">结束时间</label>
                <a-date-picker v-model:value="endTime"/>
              </div>
              <div class="pt-2">
                <a-button type="primary" long :loading="analyzing" :disabled="!mailbox?.name" @click="startAnalysis">筛选</a-button>
              </div>
            </div>
            <div ref="graphContainer" class="h-full flex-1"></div>
          </div>
        <!-- 相关邮件列表（跟随关系图后） -->
        <div class="mt-6">
          <h4 class="text-lg font-semibold mb-3" style="color: var(--color-text-1);">相关邮件</h4>
          <a-tabs>
            <a-tab-pane key="sender" title="作为发件人">
              <a-table
                :columns="mailColumns"
                :data="senderData"
                :loading="senderLoading"
                :pagination="senderPagination"
                row-key="id"
                @page-change="(p:number) => fetchSenderList({ page: p, size: senderPagination.pageSize })"
                @page-size-change="(s:number) => fetchSenderList({ page: 1, size: s })"
              >
                <template #time="{ record }">
                  {{ tableDateFormat(record.time) }}
                </template>
                <template #operate="{ record }">
                  <a-space>
                    <a-tooltip content="查看">
                      <a-link @click="
                        router.push({
                          name: 'MailMsgDetail',
                          params: { id: record.id },
                          query: { appendix: record.name },
                        })
                      ">
                        <icon-eye style="font-size:16px" />
                      </a-link>
                    </a-tooltip>
                  </a-space>
                </template>
              </a-table>
            </a-tab-pane>
            <a-tab-pane key="receiver" title="作为收件人">
              <a-table
                :columns="mailColumns"
                :data="receiverData"
                :loading="receiverLoading"
                :pagination="receiverPagination"
                row-key="id"
                @page-change="(p:number) => fetchReceiverList({ page: p, size: receiverPagination.pageSize })"
                @page-size-change="(s:number) => fetchReceiverList({ page: 1, size: s })"
              >
                <template #time="{ record }">
                  {{ tableDateFormat(record.time) }}
                </template>
                <template #operate="{ record }">
                  <a-space>
                    <a-tooltip content="查看">
                      <a-link @click="
                        router.push({
                          name: 'MailMsgDetail',
                          params: { id: record.id },
                          query: { appendix: record.name },
                        })
                      ">
                        <icon-eye style="font-size:16px" />
                      </a-link>
                    </a-tooltip>
                  </a-space>
                </template>
              </a-table>
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>

      <!-- 详情抽屉 -->
      <a-drawer
        v-model:visible="drawerVisible"
        title="详细信息"
        placement="right"
        :width="400"
        :footer="false"
      >
        <!-- 节点详情 -->
        <div v-if="selectedNode">
          <div class="space-y-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-lg font-semibold text-gray-800 mb-2">邮箱节点</h4>
              <div class="text-2xl font-bold text-blue-600">{{
                selectedNode.label
              }}</div>
            </div>

            <div class="space-y-3">
              <div class="flex justify-between items-center py-2 border-b">
                <span class="text-gray-600">邮件数量</span>
                <span class="font-semibold">{{ selectedNode.email_count }}</span>
              </div>

              <div class="flex justify-between items-center py-2 border-b">
                <span class="text-gray-600">分析层级</span>
                <span class="font-semibold">
                  <a-tag :color="getLayerColor(selectedNode.layer)">
                    第 {{ selectedNode.layer }} 层
                  </a-tag>
                </span>
              </div>

              <div class="flex justify-between items-center py-2 border-b">
                <span class="text-gray-600">权重</span>
                <span class="font-semibold">{{ selectedNode.weight }}</span>
              </div>
            </div>

            <!-- 相关邮件列表 -->
            <div class="mt-6">
              <h5 class="text-md font-semibold text-gray-800 mb-3">相关邮件</h5>
              <div class="max-h-60 overflow-y-auto space-y-2">
                <div
                  v-for="email in selectedNode.emails"
                  :key="email.id"
                  class="p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                >
                  <div class="text-sm font-medium text-gray-800 mb-1">{{
                    email.subject
                  }}</div>
                  <div class="text-xs text-gray-500">
                    {{
                      email.time
                        ? dayjs(email.time).format('YYYY-MM-DD HH:mm:ss')
                        : '时间未知'
                    }}
                  </div>
                </div>
                <div
                  v-if="!selectedNode.emails || selectedNode.emails.length === 0"
                  class="text-center text-gray-500 py-4"
                >
                  暂无相关邮件
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 边详情 -->
        <div v-if="selectedEdge">
          <div class="space-y-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-lg font-semibold text-gray-800 mb-2">关系连接</h4>
              <div class="flex items-center space-x-2">
                <span class="text-blue-600 font-medium">{{
                  selectedEdge.source
                }}</span>
                <span class="text-gray-400">→</span>
                <span class="text-blue-600 font-medium">{{
                  selectedEdge.target
                }}</span>
              </div>
            </div>

            <div class="space-y-3">
              <div class="flex justify-between items-center py-2 border-b">
                <span class="text-gray-600">关系类型</span>
                <span class="font-semibold">
                  <a-tag :color="getRelationTypeColor(selectedEdge.relation_type)">
                    {{ getRelationTypeText(selectedEdge.relation_type) }}
                  </a-tag>
                </span>
              </div>

              <div class="flex justify-between items-center py-2 border-b">
                <span class="text-gray-600">邮件数量</span>
                <span class="font-semibold">{{ selectedEdge.email_count }}</span>
              </div>

              <div class="flex justify-between items-center py-2 border-b">
                <span class="text-gray-600">关系权重</span>
                <span class="font-semibold">{{ selectedEdge.weight }}</span>
              </div>

              <div class="flex justify-between items-center py-2 border-b">
                <span class="text-gray-600">最新时间</span>
                <span class="font-semibold">
                  {{
                    selectedEdge.latest_time
                      ? dayjs(selectedEdge.latest_time).format(
                          'YYYY-MM-DD HH:mm:ss'
                        )
                      : '-'
                  }}
                </span>
              </div>
            </div>

            <!-- 相关邮件列表 -->
            <div class="mt-6">
              <h5 class="text-md font-semibold text-gray-800 mb-3">相关邮件</h5>
              <div class="max-h-60 overflow-y-auto space-y-2">
                <div
                  v-for="email in selectedEdge.emails"
                  :key="email.id"
                  class="p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                >
                  <div class="text-sm font-medium text-gray-800 mb-1">{{
                    email.subject
                  }}</div>
                  <div class="text-xs text-gray-500">
                    {{
                      email.time
                        ? dayjs(email.time).format('YYYY-MM-DD HH:mm:ss')
                        : '时间未知'
                    }}
                  </div>
                </div>
                <div
                  v-if="!selectedEdge.emails || selectedEdge.emails.length === 0"
                  class="text-center text-gray-500 py-4"
                >
                  暂无相关邮件
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-drawer>
    </a-card>
    <Footer />
  </a-layout>
</template>

<script lang="ts" setup>
  import { onBeforeMount, ref, nextTick, onMounted, reactive, computed } from 'vue';
  import Footer from '@/components/footer/index.vue';
  import { Message } from '@arco-design/web-vue';
  import dayjs, { type Dayjs } from 'dayjs';
  import { useRouter } from 'vue-router';
  import { queryMailMsgList, type MailMsgParams, type MailMsgRes } from '@/api/mailmsg';
  import { tableDateFormat } from '@/utils/date';
  import type { TableColumnData } from '@arco-design/web-vue';
  import type { Pagination } from '@/types/global';
  const router = useRouter();
  import cytoscape from 'cytoscape';
  import coseBilkent from 'cytoscape-cose-bilkent';
  import { queryMailBoxDetail, MailBoxRes, analyzeMailboxRelationships, type AnalyzeRelationshipsReq, type AnalyzeRelationshipsRes } from '@/api/mailbox';
  import { useRoute } from 'vue-router';

  const mailbox = ref<MailBoxRes>();
  const analyzing = ref(false);

  // 表单
  const maxLayers = ref<number>(2);
  const startTime = ref<Dayjs | null>(null);
  const endTime = ref<Dayjs | null>(null);

  // 图谱
  const graphContainer = ref<HTMLDivElement | null>(null);
  const cy = ref<cytoscape.Core | null>(null);
  const analysisResult = ref<AnalyzeRelationshipsRes | null>(null);

  // 抽屉
  const drawerVisible = ref(false);
  const selectedNode = ref<any>(null);
  const selectedEdge = ref<any>(null);

  cytoscape.use(coseBilkent);

  onBeforeMount(async () => {
    const route = useRoute();
    const id = Number(route.params.id); // 获取路由参数中的 id
    mailbox.value = await queryMailBoxDetail(id);
    await startAnalysis();
    // 初始拉取相关邮件
    if (mailbox.value?.name) {
      await Promise.all([
        fetchSenderList({ page: senderPagination.current, size: senderPagination.pageSize }),
        fetchReceiverList({ page: receiverPagination.current, size: receiverPagination.pageSize }),
      ]);
    }
  });
  const startAnalysis = async () => {
    if (!mailbox.value?.name) {
      Message.warning('邮箱信息加载中');
      return;
    }

    analyzing.value = true;
    try {
      const params: AnalyzeRelationshipsReq = {
        mailboxes: [mailbox.value.name],
        max_layers: maxLayers.value,
      };

      if (startTime.value) params.start_time = startTime.value.toISOString();
      if (endTime.value) params.end_time = endTime.value.toISOString();

      analysisResult.value = await analyzeMailboxRelationships(params);

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

  // ============ 相关邮件（发件人/收件人） ============
  const senderData = ref<MailMsgRes[]>([]);
  const receiverData = ref<MailMsgRes[]>([]);
  const senderLoading = ref(false);
  const receiverLoading = ref(false);
  const senderPagination: Pagination = reactive({ current: 1, pageSize: 10, showTotal: true, showPageSize: true, bufferSize: 3 });
  const receiverPagination: Pagination = reactive({ current: 1, pageSize: 10, showTotal: true, showPageSize: true, bufferSize: 3 });

  const mailColumns = computed<TableColumnData[]>(() => [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '邮件主题', dataIndex: 'name', ellipsis: true, tooltip: true },
    { title: '发件人', dataIndex: 'sender', width: 160, ellipsis: true, tooltip: true },
    { title: '收件人', dataIndex: 'receiver', width: 160, ellipsis: true, tooltip: true },
    { title: '日期', slotName: 'time', width: 170 },
    { title: '操作', slotName: 'operate', align: 'center', width: 100 },
  ]);

  const fetchSenderList = async ({ page, size }: { page: number; size: number }) => {
    if (!mailbox.value?.name) return;
    senderLoading.value = true;
    try {
      const params: MailMsgParams = { page, size, sender: mailbox.value.name } as any;
      const res = await queryMailMsgList(params);
      senderData.value = res.items;
      senderPagination.total = res.total;
      senderPagination.current = page;
      senderPagination.pageSize = size;
    } finally {
      senderLoading.value = false;
    }
  };
  const fetchReceiverList = async ({ page, size }: { page: number; size: number }) => {
    if (!mailbox.value?.name) return;
    receiverLoading.value = true;
    try {
      const params: MailMsgParams = { page, size, receiver: mailbox.value.name } as any;
      const res = await queryMailMsgList(params);
      receiverData.value = res.items;
      receiverPagination.total = res.total;
      receiverPagination.current = page;
      receiverPagination.pageSize = size;
    } finally {
      receiverLoading.value = false;
    }
  };

  const renderGraph = () => {
    if (!graphContainer.value || !analysisResult.value) return;

    if (cy.value) {
      cy.value.destroy();
    }

    const elements = [
      ...analysisResult.value.nodes.map((node) => ({
        data: {
          id: node.id,
          label: node.label,
          email_count: node.email_count,
          layer: node.layer,
          weight: node.email_count,
          emails: node.emails,
        },
      })),
      ...analysisResult.value.edges.map((edge) => ({
        data: {
          id: `${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target,
          weight: edge.weight,
          email_count: edge.email_count,
          latest_time: edge.latest_time,
          relation_type: edge.relation_type,
          emails: edge.emails,
        },
      })),
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
            'border-color': '#0891b2',
          },
        },
        {
          selector: 'node[layer = 0]',
          style: {
            'background-color': '#dc2626',
            'border-color': '#b91c1c',
          },
        },
        {
          selector: 'node[layer = 1]',
          style: {
            'background-color': '#ea580c',
            'border-color': '#c2410c',
          },
        },
        {
          selector: 'node[layer = 2]',
          style: {
            'background-color': '#d97706',
            'border-color': '#b45309',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 'mapData(weight, 0, 10, 2, 8)',
            'line-color': '#64748b',
            'target-arrow-color': '#64748b',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'opacity': 0.8,
          },
        },
        {
          selector: 'edge[relation_type = "send"]',
          style: {
            'line-color': '#059669',
            'target-arrow-color': '#059669',
          },
        },
        {
          selector: 'edge[relation_type = "receive"]',
          style: {
            'line-color': '#7c3aed',
            'target-arrow-color': '#7c3aed',
          },
        },
      ],
      layout: {
        name: 'cose-bilkent',
        animate: false,
        nodeDimensionsIncludeLabels: true,
        nodeRepulsion: 8000,
        idealEdgeLength: 100,
        edgeElasticity: 0.1,
      },
    });

    // 添加节点点击事件
    cy.value.on('tap', 'node', (event) => {
      const node = event.target;
      const data = node.data();
      selectedNode.value = data;
      selectedEdge.value = null;
      drawerVisible.value = true;
    });

    // 添加边点击事件
    cy.value.on('tap', 'edge', (event) => {
      const edge = event.target;
      const data = edge.data();
      selectedEdge.value = data;
      selectedNode.value = null;
      drawerVisible.value = true;
    });
  };

  // 辅助函数
  const getLayerColor = (layer: number) => {
    const colors = ['red', 'orange', 'gold', 'green', 'blue', 'purple'];
    return colors[layer] || 'gray';
  };

  const getRelationTypeColor = (type: string) => {
    switch (type) {
      case 'send':
        return 'green';
      case 'receive':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const getRelationTypeText = (type: string) => {
    switch (type) {
      case 'send':
        return '发送';
      case 'receive':
        return '接收';
      default:
        return '未知';
    }
  };
</script>

<style scoped>
  .email-card {
    margin-bottom: 20px;
  }
</style>
