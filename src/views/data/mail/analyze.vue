<template>
  <div class="h-full flex flex-col space-y-4">
    <!-- 参数设置区域 -->
    <div class="p-4 rounded-lg shadow-sm">
      <h3 class="text-lg font-semibold mb-4 dark:text-white">分析设置</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- 邮箱选择 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >选择邮箱</label
          >
          <a-select
            v-model="selectedMailboxes"
            multiple
            :allow-search="true"
            placeholder="请选择要分析的邮箱"
            class="w-full"
            :loading="loadingMailboxes"
            @search="handleSearch"
          >
            <a-option
              v-for="mailbox in mailboxes"
              :key="mailbox.name"
              :value="mailbox.name"
            >
              {{ mailbox.name }}
            </a-option>
          </a-select>
        </div>

        <!-- 最大分析层级 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >最大分析层级</label
          >
          <a-input-number
            v-model="maxLayers"
            :min="1"
            :max="10000"
            placeholder="默认2层"
            class="w-full"
          />
        </div>

        <!-- 开始时间 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >开始时间</label
          >
          <a-date-picker
            v-model:value="startTime"
            show-time
            placeholder="选择开始时间"
            class="w-full"
          />
        </div>

        <!-- 结束时间 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >结束时间</label
          >
          <a-date-picker
            v-model:value="endTime"
            show-time
            placeholder="选择结束时间"
            class="w-full"
          />
        </div>

        <!-- 基准时间 -->
        <!-- <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >基准时间（可选）</label
          >
          <a-date-picker
            v-model:value="referenceTime"
            show-time
            placeholder="时间权重计算的基准时间"
            class="w-full"
          />
        </div> -->
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
    <div v-if="analysisResult" class="rounded-lg shadow-sm flex-1">
      <div class="p-4">
        <h3 class="text-lg font-semibold dark:text-white">分析结果</h3>
        <div class="text-sm text-gray-500 mt-1">
          节点数量: {{ analysisResult.nodes.length }}，关系数量: 
          {{ analysisResult.edges.length }}
        </div>
      </div>

      <!-- 图谱容器 -->
      <div ref="graphContainer" class="h-96 w-full"></div>

      <!-- 网络分析结果 -->
      <div v-if="analysisResult.network_analysis" class="p-6">
        <h3 class="text-lg font-semibold mb-4 dark:text-white">网络分析结果</h3>

        <!-- 基本统计信息 -->
        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
          <h4 class="text-md font-medium mb-3 dark:text-white">网络基本统计</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center">
              <div class="text-gray-500 dark:text-gray-400 text-sm">节点数量</div>
              <div class="text-xl font-bold mt-1 dark:text-white">{{ analysisResult.network_analysis.number_of_nodes }}</div>
              <div class="text-xs text-gray-400 mt-1 max-w-[100px] mx-auto">邮件网络中的邮箱数量</div>
            </div>
            <div class="text-center">
              <div class="text-gray-500 dark:text-gray-400 text-sm">边数量</div>
              <div class="text-xl font-bold mt-1 dark:text-white">{{ analysisResult.network_analysis.number_of_edges }}</div>
              <div class="text-xs text-gray-400 mt-1 max-w-[100px] mx-auto">邮箱间的通信关系数量</div>
            </div>
            <div class="text-center">
              <div class="text-gray-500 dark:text-gray-400 text-sm">连通分量</div>
              <div class="text-xl font-bold mt-1 dark:text-white">{{ analysisResult.network_analysis.number_of_connected_components }}</div>
              <div class="text-xs text-gray-400 mt-1 max-w-[100px] mx-auto">相互连接的子网络数量</div>
            </div>
            <div class="text-center">
              <div class="text-gray-500 dark:text-gray-400 text-sm">是否有向</div>
              <div class="text-xl font-bold mt-1 dark:text-white">{{ analysisResult.network_analysis.is_directed ? '是' : '否' }}</div>
              <div class="text-xs text-gray-400 mt-1 max-w-[100px] mx-auto">是否区分通信方向</div>
            </div>
          </div>
        </div>

        <!-- 度数分布 -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-md font-medium dark:text-white">节点度数分布</h4>
            <div class="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
              度数：表示节点与其他节点的连接数量
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">节点</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">度数</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="(degree, node) in analysisResult.network_analysis.degrees" :key="node">
                  <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white max-w-xs truncate">{{ node }}</td>
                  <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ degree }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 中心性指标 -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-md font-medium dark:text-white">中心性指标</h4>
            <div class="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
              衡量节点在网络中的重要程度
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div class="flex flex-col space-y-1">
                      <span>节点</span>
                      <span class="text-[10px] font-normal">邮箱地址</span>
                    </div>
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div class="flex flex-col space-y-1">
                      <span>度中心性</span>
                      <span class="text-[10px] font-normal">连接数量的标准化指标</span>
                    </div>
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div class="flex flex-col space-y-1">
                      <span>介数中心性</span>
                      <span class="text-[10px] font-normal">作为桥梁的能力指标</span>
                    </div>
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div class="flex flex-col space-y-1">
                      <span>接近中心性</span>
                      <span class="text-[10px] font-normal">到其他节点的平均距离</span>
                    </div>
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div class="flex flex-col space-y-1">
                      <span>特征向量中心性</span>
                      <span class="text-[10px] font-normal">影响力的传递指标</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="node in getCentralityNodes()" :key="node">
                  <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white max-w-xs truncate">{{ node }}</td>
                  <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ analysisResult.network_analysis.centrality.degree[node]?.toFixed(4) || '0.0000' }}</td>
                  <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ analysisResult.network_analysis.centrality.betweenness[node]?.toFixed(4) || '0.0000' }}</td>
                  <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ analysisResult.network_analysis.centrality.closeness[node]?.toFixed(4) || '0.0000' }}</td>
                  <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ analysisResult.network_analysis.centrality.eigenvector[node]?.toFixed(4) || '0.0000' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 关键节点 -->
        <div>
          <h4 class="text-md font-medium mb-3 dark:text-white">关键节点识别</h4>
          
          <!-- 度数最高的节点 -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <h5 class="text-sm font-medium text-gray-600 dark:text-gray-300">度数最高的节点</h5>
              <div class="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                与其他邮箱通信最频繁的节点
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">排名</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">节点</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">度数</th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="(item, index) in analysisResult.network_analysis.key_nodes.top_degree_nodes" :key="index">
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ index + 1 }}</td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white max-w-xs truncate">{{ item[0] }}</td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ item[1] }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 介数中心性最高的节点 -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <h5 class="text-sm font-medium text-gray-600 dark:text-gray-300">介数中心性最高的节点</h5>
              <div class="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                在网络中起桥梁作用的节点
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">排名</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">节点</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">介数中心性</th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="(item, index) in analysisResult.network_analysis.key_nodes.top_betweenness_nodes" :key="index">
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ index + 1 }}</td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white max-w-xs truncate">{{ item[0] }}</td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ item[1].toFixed(4) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 节点影响度 -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <h5 class="text-sm font-medium text-gray-600 dark:text-gray-300">节点影响度</h5>
              <div class="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                对整体网络影响力的综合评估
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">节点</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">影响度</th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="item in analysisResult.network_analysis.key_nodes.node_impacts" :key="item.node">
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white max-w-xs truncate">{{ item.node }}</td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ item.impact }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 无结果提示 -->
    <div
      v-else-if="hasSearched && !analyzing"
      class="bg-white rounded-lg shadow-sm border flex-1 flex items-center justify-center"
    >
      <a-empty description="暂无分析结果" />
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
                <a-tag
                  :color="getRelationTypeColor(selectedEdge.relation_type)"
                >
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
    type AnalyzeRelationshipsRes,
    type EmailData,
  } from '@/api/mailbox';

  cytoscape.use(coseBilkent);

  // 表单数据
  const selectedMailboxes = ref<string[]>([]);
  const maxLayers = ref<number>(2);
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

  // 抽屉
  const drawerVisible = ref(false);
  const selectedNode = ref<any>(null);
  const selectedEdge = ref<any>(null);

  // 加载邮箱列表
  const loadMailboxes = async () => {
    if (mailboxes.value.length > 0) return;

    loadingMailboxes.value = true;
    try {
      const res = await queryMailBoxList({
        page: 1,
        size: 10,
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

  // 获取中心性指标中的所有节点名称
  const getCentralityNodes = () => {
    if (!analysisResult.value?.network_analysis?.centrality) {
      return [];
    }
    
    const nodes = new Set<string>();
    const { degree, betweenness, closeness, eigenvector } = analysisResult.value.network_analysis.centrality;
    
    // 合并所有中心性指标中的节点名称
    Object.keys(degree).forEach(node => nodes.add(node));
    Object.keys(betweenness).forEach(node => nodes.add(node));
    Object.keys(closeness).forEach(node => nodes.add(node));
    Object.keys(eigenvector).forEach(node => nodes.add(node));
    
    return Array.from(nodes);
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

  onMounted(() => {
  loadMailboxes();
});

defineExpose({
  getCentralityNodes,
});
</script>
