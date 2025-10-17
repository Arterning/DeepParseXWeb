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
        <!-- <div class="w-full h-[320px] flex"> -->
          
        <a-row :gutter="16">
          <a-col :span="6">
            <label class="block text-sm font-medium text-gray-700 mb-2">最大分析层级</label>
            <a-input-number v-model="maxLayers" :min="1" :max="10000"/>
          </a-col>
          <a-col :span="6">
            <label class="block text-sm font-medium text-gray-700 mb-2">开始时间</label>
            <a-date-picker class="w-full" v-model:value="startTime"/>
          </a-col>
          <a-col :span="6">
            <label class="block text-sm font-medium text-gray-700 mb-2">结束时间</label>
            <a-date-picker class="w-full" v-model:value="endTime"/>
          </a-col>
          <a-col :span="6">
            <a-button class="mt-7" type="primary" :loading="analyzing" :disabled="!mailbox?.name" @click="startAnalysis">筛选</a-button>
          </a-col>
        </a-row>

        <div class="relation-graph-container h-[480px] relative mt-5">
          <!-- 图谱容器 -->
          <div ref="graphContainer" class="h-full rounded-lg bg-gray-50 dark:bg-gray-200">
            <a-button 
              class="fullscreen-btn" 
              size="small" 
              type="text"
              @click="toggleFullscreen"
            >
              <template #icon>
                <icon-fullscreen-exit v-if="isFullscreen" />
                <icon-fullscreen v-else />
              </template>
              {{ isFullscreen ? '退出全屏' : '全屏' }}
            </a-button>
          </div>
        </div>
           
          <!-- </div> -->
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
                          query: { appendix: record.name, category:'doc' }
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
                          query: { appendix: record.name, category:'doc' }
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

              <!-- <div class="flex justify-between items-center py-2 border-b">
                <span class="text-gray-600">分析层级</span>
                <span class="font-semibold">
                  <a-tag :color="getLayerColor(selectedNode.layer)">
                    第 {{ selectedNode.layer }} 层
                  </a-tag>
                </span>
              </div> -->

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
                  class="cursor-pointer p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                  @click="getMail(email)"
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
              <span class="whitespace-normal break-words text-left block">
                <span class="text-blue-600 font-medium">{{
                  selectedEdge.source
                }}</span>
                <span class="text-gray-400">→</span>
                <span class="text-blue-600 font-medium">{{
                  selectedEdge.target
                }}</span>
              </span>
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
                <span class="font-semibold">
                  {{ selectedEdge.weight }}
                  <a-tooltip :content="selectedEdge.description">
                    <icon-question-circle />
                  </a-tooltip>
                </span>
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
              <div class="max-h-96 overflow-y-auto space-y-2">
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
  import { onBeforeMount, ref, nextTick, onMounted, reactive, computed, onUnmounted } from 'vue';
  import Footer from '@/components/footer/index.vue';
  import { Message } from '@arco-design/web-vue';
  import dayjs, { type Dayjs } from 'dayjs';
  import { useRouter } from 'vue-router';
  import { queryMailMsgDetail, queryMailMsgList, type MailMsgParams, type MailMsgRes } from '@/api/mailmsg';
  import { tableDateFormat } from '@/utils/date';
  import type { TableColumnData } from '@arco-design/web-vue';
  import type { Pagination } from '@/types/global';
  import cytoscape from 'cytoscape';
  import fcose from 'cytoscape-fcose';
  import { queryMailBoxDetail, MailBoxRes, analyzeMailboxRelationships, type AnalyzeRelationshipsReq, type AnalyzeRelationshipsRes } from '@/api/mailbox';
  import { useRoute } from 'vue-router';

  cytoscape.use(fcose);

  const router = useRouter();

  const mailbox = ref<MailBoxRes>();
  const analyzing = ref(false);
  const isFullscreen = ref(false);

  // 表单
  const maxLayers = ref<number>(2);
  const startTime = ref<Dayjs | null>(null);
  const endTime = ref<Dayjs | null>(null);

  // 图谱
  const graphContainer = ref<HTMLDivElement | null>(null);
  const cy = ref<cytoscape.Core | null>(null);
  const analysisResult = ref<AnalyzeRelationshipsRes | null>(null);

  const PRESET_COLORS = ['#b1d8f6','#baecc8','#fce5bf','#fccac4','#beeae7','#bcccf0','#f6eec2','#ccc3e6'];
  // 抽屉
  const drawerVisible = ref(false);
  const selectedNode = ref<any>(null);
  const selectedEdge = ref<any>(null);

  // 归一化到 0..1（越大越接近 1）
  const normalize01 = (val: number, min: number, max: number) => {
    if (!isFinite(val)) return 0;
    if (max === min) return 1;
    return Math.max(0, Math.min(1, (val - min) / (max - min)));
  };

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

  // 渲染图谱
  const renderGraph = () => {
    if (!graphContainer.value || !analysisResult.value) return;

    if (cy.value) {
      cy.value.destroy();
      cy.value = null;
    }

    const communityList = analysisResult.value.network_analysis?.communities?.communities || [];
    // map community_id -> color (use preset colors cyclically)
    const communityColorMap: Record<number, string> = {};
    communityList.forEach((comm, idx) => {
      const id = (comm as any).id;
      communityColorMap[id] = PRESET_COLORS[idx % PRESET_COLORS.length];
    });

    // node-level community info returned by backend (可能存在)
    const backendNodeCommunityMap = analysisResult.value.network_analysis?.communities?.nodes || {};

    // nodeColorMap: nodeId -> color (deterministic fallback if no community)
    const nodeColorMap: Record<string, string> = {};
    analysisResult.value.nodes.forEach((n, idx) => {
      const nodeId = n.id;
      const backendEntry = backendNodeCommunityMap?.[nodeId];
      if (backendEntry && backendEntry.community_id != null) {
        const cid = backendEntry.community_id;
        nodeColorMap[nodeId] = communityColorMap[cid] ?? PRESET_COLORS[cid % PRESET_COLORS.length];
      } else {
        // fallback: assign by index to keep determinism
        nodeColorMap[nodeId] = PRESET_COLORS[idx % PRESET_COLORS.length];
      }
    });

    // --- 使用 node_impact 指标来决定节点大小（归一到 min/max）
    const impactMap = analysisResult.value.network_analysis?.key_nodes?.node_impacts || [];
    const impactValues = impactMap.map(item => item.impact).filter(v => typeof v === 'number') as number[];
    const useImpact = impactValues.length > 0;

    let minImpact = 0, maxImpact = 0;
    if (useImpact) {
      minImpact = Math.min(...impactValues);
      maxImpact = Math.max(...impactValues);
    }

    const emailCounts = analysisResult.value.nodes.map(n => n.email_count || 1);
    const minCount = Math.min(...emailCounts);
    const maxCount = Math.max(...emailCounts);

    const minSize = 30;
    const maxSize = 80;

    // node size map
    const nodeSizeMap: Record<string, number> = {};
    analysisResult.value.nodes.forEach((n) => {
      const id = n.id;
      let size = minSize;
      
      // 查找该节点的 impact 值
      const nodeImpact = impactMap.find(item => item.node === id);
      if (useImpact && nodeImpact && nodeImpact.impact != null) {
        const z = normalize01(nodeImpact.impact, minImpact, maxImpact); // 0..1
        size = Math.round(minSize + z * (maxSize - minSize));
      } else {
        // fallback to email_count normalization
        const z2 = normalize01(n.email_count || 1, minCount, maxCount);
        size = Math.round(minSize + z2 * (maxSize - minSize));
      }
      nodeSizeMap[id] = Math.max(minSize, Math.min(maxSize, size));
    });

    // 计算邮件数量的归一化参数，用于颜色明暗度
    const emailCountForColor = analysisResult.value.nodes.map(n => n.email_count || 1);
    const minEmailCount = Math.min(...emailCountForColor);
    const maxEmailCount = Math.max(...emailCountForColor);
    
    // 归一化函数：将 email_count 映射到 0-0.8 范围
    const normalizeEmailCount = (count: number) => {
      if (maxEmailCount === minEmailCount) return 0.4; // 如果所有节点邮件数相同，使用中等明暗度
      return normalize01(count, minEmailCount, maxEmailCount) * 0.8;
    };

    // 构造 Cytoscape 实例
    cy.value = cytoscape({
      container: graphContainer.value,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': (ele: any) => {
              const normalizedCount = normalizeEmailCount(ele.data('email_count') || 1);
              return getDarkenColor(nodeColorMap[ele.id()], normalizedCount) || '#9192ab';
            },
            'border-color': (ele: any) => {
              const isSelected = mailbox.value?.name === ele.data('label');
              if (isSelected) {
                return getDarkenColor(nodeColorMap[ele.id()], 1);
              }
              const normalizedCount = normalizeEmailCount(ele.data('email_count') || 1);
              return getDarkenColor(nodeColorMap[ele.id()], normalizedCount) || '#9192ab';
            },
            'text-outline-color': (ele: any) =>  mailbox.value?.name === ele.data('label')? getDarkenColor(nodeColorMap[ele.id()], 1): '#9192ab',
            // 'border-style': (ele: any) => selectedMailboxes.value.includes(ele.data('label'))? 'dashed': 'solid',
            'border-width': (ele: any) => Math.max(nodeSizeMap[ele.data('id')] / 12),
            'opacity': 0.9,
            'label': 'data(label)',
            'color': '#fff',
            'font-size': (ele: any) => Math.max(nodeSizeMap[ele.data('id')] / 4),
            'font-weight': 'bold',
            // 'text-outline-color': '#9192ab',
            'text-outline-width': 2,
            'text-valign': 'center',
            'text-halign': 'center',
            'width': (ele: any) => nodeSizeMap[ele.id()] || minSize,
            'height': (ele: any) => nodeSizeMap[ele.id()] || minSize,
            'overlay-opacity': 0,
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 1,
            'opacity': 0.8,
            'line-color': (ele: any) => '#9192ab',
            'target-arrow-color': (ele: any) => '#9192ab',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-style': 'double',
            'z-index': 9999
          },
        },
        {
          selector: 'edge:selected',
          style: {
            'line-color': (ele: any) => getDarkenColor('#9192ab', 1),
            'target-arrow-color': (ele: any) => getDarkenColor('#9192ab', 1),
            'width': 2,
            'z-index': 9999
          },
        },
      ],
      elements: {
        nodes: analysisResult.value.nodes.map(n => ({
          data: {
            id: n.id,
            label: n.label,
            email_count: n.email_count,
            emails: n.emails,
            weight: impactMap.find( i => i.node === n.id)?.impact || 0
          },
        })),
         edges: analysisResult.value.edges.map(e => {
           // 根据权重计算理想边长和弹性
           // 权重越大，边越短（关系越紧密）
           const normalizedWeight = e.weight || 1;
           const idealLength = Math.max(50, 200 - normalizedWeight * 20);
           const elasticity = Math.min(1, normalizedWeight / 10);
           
           return {
             data: {
               source: e.source,
               target: e.target,
               weight: e.weight,
              description: e.description,
               email_count: e.email_count,
               latest_time: e.latest_time,
               relation_type: e.relation_type,
               emails: e.emails,
               // 添加边的布局参数
               idealLength: idealLength,
               elasticity: elasticity
             },
           };
         }),
      },
      layout: {
        name: 'fcose',
        randomize: true,
        nodeRepulsion: 5000,
        // 使用函数根据边的权重动态设置边长
        idealEdgeLength: (edge: any) => {
          return edge.data('idealLength') || 120;
        },
        edgeElasticity: (edge: any) => {
          return edge.data('elasticity') || 0.2;
        },
        gravity: 0.5,
        numIter: 1000,
        // 根据容器尺寸调整布局范围
        fit: true,
        boundingBox: {
          x1: 0,
          y1: 0,
          x2: graphContainer.value?.clientWidth || 800,
          y2: graphContainer.value?.clientHeight || 400
        }
      },
      wheelSensitivity: 0.2,
    });

    // const savedPositions: Record<string, { x: number; y: number }> = {};
    // const savePositions = () => {
    //   cy.value?.nodes().forEach((n: any) => {
    //     const p = n.position();
    //     savedPositions[n.id()] = { x: p.x, y: p.y };
    //   });
    // };

    // 点击事件
    cy.value.on('tap', 'node', (evt) => {
      selectedNode.value = evt.target.data();
      selectedEdge.value = null;
      drawerVisible.value = true;
    });

    cy.value.on('tap', 'edge', (evt) => {
      selectedEdge.value = evt.target.data();
      selectedNode.value = null;
      drawerVisible.value = true;
    });

    // 背景点击关闭抽屉
    cy.value.on('tap', (evt) => {
      if (evt.target === cy.value) {
        drawerVisible.value = false;
      }
    });

    // // 布局完成后保存位置快照并 fit 视图
    // cy.value.once('layoutstop', () => {
    //   savePositions();
    //   try { cy.value?.fit(undefined, 40); } catch (e) { /* ignore */ }
    // });

    // // 当用户拖动释放节点（dragfree）时，用动画把节点返回到保存的位置
    // cy.value.on('dragfree', 'node', (evt: any) => {
    //   const node = evt.target;
    //   const id = node.id();
    //   const pos = savedPositions[id];
    //   if (!pos) return;
    //   const origEvent = evt.originalEvent;
    //   node.animate({ position: { x: pos.x, y: pos.y } }, { duration: 600, easing: 'ease-out' });
    // });
  };


  // const getLayerColor = (layer: number) => {
  //   const colors = ['#63b2ee', '#76da91', '#f8cb7f', '#f89588', '#7cd6cf', '#7898e1'];
  //   return colors[layer] || '#9192ab';
  // };

  const getDarkenColor = (hex: string, weight = 0.5): string => {
    // 限制 weight
    weight = Math.max(0, Math.min(1, weight));

    // 规范 hex
    let h = (hex || '').replace('#', '').trim();
    if (!h) return '#000000';
    if (h.length === 3) h = h.split('').map(c => c + c).join('');

    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;

    // RGB -> HSL
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let hDeg = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: hDeg = (g - b) / d + (g < b ? 6 : 0); break;
        case g: hDeg = (b - r) / d + 2; break;
        case b: hDeg = (r - g) / d + 4; break;
      }
      hDeg = hDeg * 60; // to degrees
    }

    const darkenFactor = 1 - 0.85 * weight; // 控制亮度缩放（更平滑）
    const saturateFactor = 1 + 0.6 * weight; // 提升饱和度的倍数

    const newL = Math.max(0, Math.min(1, l * darkenFactor));
    const newS = Math.max(0, Math.min(1, s * saturateFactor));

    // HSL -> RGB
    const hNorm = ((hDeg % 360) + 360) % 360 / 360; // 0..1
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let nr = 0, ng = 0, nb = 0;
    if (newS === 0) {
      nr = ng = nb = newL; // achromatic
    } else {
      const q = newL < 0.5 ? newL * (1 + newS) : newL + newS - newL * newS;
      const p = 2 * newL - q;
      nr = hue2rgb(p, q, hNorm + 1/3);
      ng = hue2rgb(p, q, hNorm);
      nb = hue2rgb(p, q, hNorm - 1/3);
    }

    const toHex = (v: number) => {
      const v255 = Math.round(Math.max(0, Math.min(1, v)) * 255);
      return v255.toString(16).padStart(2, '0');
    };

    return `#${toHex(nr)}${toHex(ng)}${toHex(nb)}`;
  };


  const getRelationTypeColor = (type: string) => {
    switch (type) {
      case 'send':
        return '#63b2ee';
      case 'receive':
        return '#76da91';
      default:
        return '#9192ab';
    }
  };

  const getRelationTypeText = (type: string) => {
    switch (type) {
      case 'send': return '发送';
      case 'receive': return '接收';
      default: return '未知';
    }
  };

  // 全屏切换
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      const container = document.querySelector('.relation-graph-container') as HTMLElement;
      if (container && container.requestFullscreen) {
        container.requestFullscreen();
        isFullscreen.value = true;
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        isFullscreen.value = false;
      }
    }
  };

  const handleFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement;
  };

  const getMail = async (email: any) => {
    const { doc_id } = await queryMailMsgDetail(email.id);
    if(doc_id) {
      router.push({name: 'DocDetail', params: { id: doc_id }, query: { appendix: email.subject, category: 'doc' }})
    }
  }

  onMounted(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
  });

  onUnmounted(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
  });  
</script>

<style scoped>
  .email-card {
    margin-bottom: 20px;
  }

  .fullscreen-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1;
  }

  .relation-graph-container > div {
    width: 100%;
    height: 100%;
  }
</style>
