<template>
    <div class="h-full flex flex-col space-y-4">
      <!-- 参数设置区域 -->
      <div class="content rounded-lg shadow-sm">
        <h3 class="text-lg font-semibold mb-4 dark:text-white">分析设置</h3>
  
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- 邮箱选择 -->
          <div>
            <div class="mb-1"><label class="text-sm font-medium text-gray-700 mr-2">选择邮箱</label>
            <a-link class="text-sm" @click="()=>{
              selectedMailboxes = [];
              mailboxes.map((e:any)=>selectedMailboxes.push(e.name))
            }">全选</a-link></div>
            
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
        <div class="px-2 m-4">
          <h3 class="text-lg font-semibold dark:text-white">分析结果</h3>
          <div class="text-sm text-gray-500 mt-1">
            节点数量: {{ analysisResult.nodes.length }}，关系数量: 
            {{ analysisResult.edges.length }}
          </div>
        </div>
  
        <div v-if="analysisResult.network_analysis" class="relation-graph-container mx-6 relative h-96 bg-zinc-50 dark:bg-zinc-800">
          <!-- 图谱容器 -->
          <div ref="graphContainer"></div>
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
  
  
  
        <!-- 网络分析结果 -->
        <div v-if="analysisResult.network_analysis" class="content">
          <h3 class="text-lg font-semibold mb-4 dark:text-white">网络分析结果</h3>
  
          <!-- 基本统计信息 -->
          <div class="bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg mb-6">
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
                <a-link class="text-blue-600 font-medium" @click="updateSelecteNode(selectedNode.label)">{{
                  selectedNode.label
                }}</a-link>
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
  import { ref, onMounted, nextTick, onUnmounted } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import dayjs, { type Dayjs } from 'dayjs';
  import cytoscape from 'cytoscape';
  import fcose from 'cytoscape-fcose';
  import {
    queryMailBoxList,
    analyzeMailboxRelationships,
    type MailBoxRes,
    type AnalyzeRelationshipsReq,
    type AnalyzeRelationshipsRes,
    type EmailData,
  } from '@/api/mailbox';
  
  cytoscape.use(fcose);
  
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
  const isFullscreen = ref(false);
  
  // 图谱
  const graphContainer = ref<HTMLDivElement | null>(null);
  const cy = ref<cytoscape.Core | null>(null);
  
  // 抽屉
  const drawerVisible = ref(false);
  const selectedNode = ref<any>(null);
  const selectedEdge = ref<any>(null);
  
  const PRESET_COLORS = ['#b1d8f6','#baecc8','#fce5bf','#fccac4','#beeae7','#bcccf0','#f6eec2','#ccc3e6'];
  
  // 归一化到 0..1（越大越接近 1）
  const normalize01 = (val: number, min: number, max: number) => {
    if (!isFinite(val)) return 0;
    if (max === min) return 1;
    return Math.max(0, Math.min(1, (val - min) / (max - min)));
  };
  
  // 加载邮箱列表
  const loadMailboxes = async () => {
    if (mailboxes.value.length > 0) return;
  
    loadingMailboxes.value = true;
    try {
      const res = await queryMailBoxList({ page: 1, size: 10 });
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
      const res = await queryMailBoxList({ page: 1, size: 10, name: value });
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
  
      if (startTime.value) params.start_time = startTime.value.toISOString();
      if (endTime.value) params.end_time = endTime.value.toISOString();
      if (referenceTime.value) params.reference_time = referenceTime.value.toISOString();
  
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

    const minSize = 60;
    const maxSize = 100;

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
              const isSelected = selectedMailboxes.value.includes(ele.data('label'));
              if (isSelected) {
                return getDarkenColor(nodeColorMap[ele.id()], 1);
              }
              const normalizedCount = normalizeEmailCount(ele.data('email_count') || 1);
              return getDarkenColor(nodeColorMap[ele.id()], normalizedCount) || '#9192ab';
            },
            'text-outline-color': (ele: any) => selectedMailboxes.value.includes(ele.data('label'))? getDarkenColor(nodeColorMap[ele.id()], 1): '#9192ab',
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
            'width': 2,
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
            'border-style': 'double'
          },
        },
        {
          selector: 'edge:selected',
          style: {
            'line-color': (ele: any) => getDarkenColor('#9192ab', 1),
            'target-arrow-color': (ele: any) => getDarkenColor('#9192ab', 1),
            'width': 4,
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
            weight: impactMap.find( i => i.node === n.id)?.impact
          },
        })),
        edges: analysisResult.value.edges.map(e => ({
          data: {
            source: e.source,
            target: e.target,
            weight: e.weight,
            email_count: e.email_count,
            latest_time: e.latest_time,
            relation_type: e.relation_type,
            emails: e.emails,
          },
        })),
      },
       layout: {
         name: 'fcose',
         randomize: true,
         nodeRepulsion: 5000,
         // fcose 不支持函数形式理想长度的所有版本，为兼容性使用基于权重的数值映射：
         idealEdgeLength: 120,
         edgeElasticity: 0.2,
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

    // 布局完成后保存位置快照并 fit 视图
    // cy.value.once('layoutstop', () => {
    //   savePositions();
    //   // 由于布局已经考虑了容器尺寸，只需要简单的 fit
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
  
  // 获取中心性指标中的所有节点名称
  const getCentralityNodes = () => {
    if (!analysisResult.value?.network_analysis?.centrality) {
      return [];
    }
  
    const nodes = new Set<string>();
    const { degree = {}, betweenness = {}, closeness = {}, eigenvector = {} } = analysisResult.value.network_analysis.centrality;
  
    Object.keys(degree).forEach(node => nodes.add(node));
    Object.keys(betweenness).forEach(node => nodes.add(node));
    Object.keys(closeness).forEach(node => nodes.add(node));
    Object.keys(eigenvector).forEach(node => nodes.add(node));
  
    return Array.from(nodes);
  };
  
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
  
  
  const getRelationTypeText = (type: string) => {
    switch (type) {
      case 'send': return '发送';
      case 'receive': return '接收';
      default: return '未知';
    }
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
  
  const updateSelecteNode = async (label: string) => {
    selectedMailboxes.value = [label];
    await startAnalysis();
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      const container = document.querySelector('.relation-graph-container') as HTMLElement;
      if (container && container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement;
  };

  onMounted(() => {
    loadMailboxes(); 
    document.addEventListener('fullscreenchange', handleFullscreenChange);
  });

  onUnmounted(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
  });  
  
  defineExpose({ getCentralityNodes });
  </script>
  
  
  <style scoped>
  .fullscreen-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1000;
  }
  
  .relation-graph-container > div {
    width: 100%;
    height: 100%;
  }
  </style>
  