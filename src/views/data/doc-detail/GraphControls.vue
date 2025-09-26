<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import screenfull from 'screenfull';
import type { NodeData, EdgeData, GraphData } from '@/types/graph';

const props = defineProps<{
  initialData: GraphData;
}>();

const emit = defineEmits<{
  dataChange: [data: GraphData];
  extractGraph: [entityTypes: string[]];
}>();

const isFullscreen = ref(false);

const toggleFullscreen = () => {
  const element = document.getElementById('knowledge-graph-container');
  if (screenfull.isEnabled && element) {
    screenfull.toggle(element);
  }
};

const onFullscreenChange = () => {
  if (screenfull.isEnabled) {
    isFullscreen.value = screenfull.isFullscreen;
  }
};

onMounted(() => {
  if (screenfull.isEnabled) {
    screenfull.on('change', onFullscreenChange);
  }
});

onUnmounted(() => {
  if (screenfull.isEnabled) {
    screenfull.off('change', onFullscreenChange);
  }
});

const graphData = ref<GraphData>({
  nodes: [],
  edges: []
});

// 从 localStorage 加载数据
const loadData = () => {
  // const savedData = localStorage.getItem('knowledge-graph');
  // if (savedData) {
  //   graphData.value = JSON.parse(savedData);
  //   emit('dataChange', graphData.value);
  // }
  graphData.value = props.initialData;
  emit('dataChange', graphData.value);
};

// 保存数据到 localStorage
const saveData = () => {
  localStorage.setItem('knowledge-graph', JSON.stringify(graphData.value));
};

// 节点表单
const newNode = ref({
  id: '',
  label: '',
  type: 'person'
});

// 边表单
const newEdge = ref({
  source: '',
  target: '',
  label: ''
});

// 添加节点
const addNode = () => {
  if (!newNode.value.label) return;

  const nodeId = newNode.value.id || `node_${Date.now()}`;

  graphData.value.nodes.push({
    id: nodeId,
    label: newNode.value.label,
    type: newNode.value.type
  });

  newNode.value = { id: '', label: '', type: 'person' };
  saveData();
  emit('dataChange', graphData.value);
};

// 添加边
const addEdge = () => {
  if (!newEdge.value.source || !newEdge.value.target || !newEdge.value.label) return;

  graphData.value.edges.push({
    id: `edge_${Date.now()}`,
    source: newEdge.value.source,
    target: newEdge.value.target,
    label: newEdge.value.label
  });

  newEdge.value = { source: '', target: '', label: '' };
  saveData();
  emit('dataChange', graphData.value);
};

// 删除选中的节点和边
const deleteSelected = (selectedIds: string[]) => {
  graphData.value.nodes = graphData.value.nodes.filter(node => !selectedIds.includes(node.id));
  graphData.value.edges = graphData.value.edges.filter(
    edge => !selectedIds.includes(edge.source) && !selectedIds.includes(edge.target)
  );
  saveData();
  emit('dataChange', graphData.value);
};


// 新增搜索和过滤状态
const searchTerm = ref('');
const filterType = ref('all');
const filterRelation = ref('');

// 过滤节点和边
const filteredGraphData = computed(() => {
  const filteredNodes = graphData.value.nodes.filter(node => {
    const matchesSearch = node.label.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      node.id.toLowerCase().includes(searchTerm.value.toLowerCase());
    const matchesType = filterType.value === 'all' || node.type === filterType.value;
    return matchesSearch && matchesType;
  });

  const filteredEdges = graphData.value.edges.filter(edge => {
    const matchesRelation = !filterRelation.value ||
      edge.label.toLowerCase().includes(filterRelation.value.toLowerCase());
    const sourceExists = filteredNodes.some(node => node.id === edge.source);
    const targetExists = filteredNodes.some(node => node.id === edge.target);
    return matchesRelation && sourceExists && targetExists;
  });

  return {
    nodes: filteredNodes,
    edges: filteredEdges
  };
});

// 触发过滤后的数据变化
watch(filteredGraphData, (newData) => {
  emit('dataChange', newData);
}, { deep: true });

// 初始化加载数据
loadData();

const showAddNodeModal = ref(false);
const showAddRelationModal = ref(false);
const showEntityTypeModal = ref(false);

// 实体类型选择相关
const selectedEntityTypes = ref<string[]>([]);
const entityTypeInput = ref('');
const commonEntityTypes = ['邮箱账号', '联系方式', '电话号码', '网址', 'IP地址', '身份证号', '银行卡号', '车牌号', '组织机构代码', '税号'];

const addEntityType = () => {
  if (entityTypeInput.value && !selectedEntityTypes.value.includes(entityTypeInput.value)) {
    selectedEntityTypes.value.push(entityTypeInput.value);
    entityTypeInput.value = '';
  }
};

const removeEntityType = (type: string) => {
  selectedEntityTypes.value = selectedEntityTypes.value.filter(t => t !== type);
};

const addCommonEntityType = (type: string) => {
  if (!selectedEntityTypes.value.includes(type)) {
    selectedEntityTypes.value.push(type);
  }
};

// 处理提取确认
const handleExtractConfirm = () => {
  emit('extractGraph', selectedEntityTypes.value);
};
</script>

<template>
  <div class="space-y-4">
    <!-- 添加节点 -->
    <a-modal v-model:visible="showAddNodeModal" :title="$t('添加节点')" @ok="addNode">
      <div class="p-2 rounded-lg shadow">
        <div class="space-y-3">
          <div>
            <a-input v-model="newNode.id"
              placeholder="ID" />
          </div>
          <div>
            <a-input v-model="newNode.label"
              required placeholder="节点名称" />
          </div>
          <div>
            <a-select v-model="newNode.type">
              <a-option value="人物">人物</a-option>
              <a-option value="组织">组织</a-option>
              <a-option value="地点">地点</a-option>
              <a-option value="事件">事件</a-option>
              <a-option value="概念">概念</a-option>
            </a-select>
          </div>
          <!-- <button @click="addNode"
            class="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded transition-colors duration-200 flex items-center justify-center">
            <span class="i-heroicons-plus-circle-solid mr-2"></span>
            确认
          </button> -->
        </div>
      </div>
    </a-modal>

    <a-modal v-model:visible="showAddRelationModal" :title="$t('添加关系')" @ok="addEdge">
      <!-- 添加关系 -->
      <div class="p-4 rounded-lg shadow">
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">源节点</label>
            <select v-model="newEdge.source"
              class="w-full dark:bg-gray-600 border border-gray-500 rounded px-3 py-2 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
              <option value="" disabled>选择源节点</option>
              <option v-for="node in graphData.nodes" :key="node.id" :value="node.id">
                {{ node.label }} ({{ node.id }})
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">目标节点</label>
            <select v-model="newEdge.target"
              class="w-full dark:bg-gray-600 border border-gray-500 rounded px-3 py-2 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
              <option value="" disabled>选择目标节点</option>
              <option v-for="node in graphData.nodes" :key="node.id" :value="node.id">
                {{ node.label }} ({{ node.id }})
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">关系类型*</label>
            <a-input v-model="newEdge.label"
              required placeholder="例如: 朋友, 同事, 属于" />
          </div>
          <!-- <button @click="addEdge"
            class="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors duration-200 flex items-center justify-center">
            <span class="i-heroicons-link-solid mr-2"></span>
            确认
          </button> -->
        </div>
      </div>
    </a-modal>

    <!-- 实体类型选择弹框 -->
    <a-modal v-model:visible="showEntityTypeModal" title="实体类型选择" @ok="handleExtractConfirm">
      <div class="space-y-4">
        <div class="flex gap-2 items-center">
          <a-input 
            v-model="entityTypeInput" 
            placeholder="输入实体类型，如'人物'"
            class="w-40"
            @keyup.enter="addEntityType"
          />
          <button 
            @click="addEntityType"
            class="bg-[#2971CF] text-white px-3 py-1 rounded transition-colors duration-200"
          >
            添加
          </button>
        </div>
        
        <!-- 常用实体类型快速选择 -->
        <div class="mt-2 flex flex-wrap gap-2 items-center">
          <span class="text-sm text-gray-400 mr-2">常用类型：</span>
          <button 
            v-for="type in commonEntityTypes"
            :key="type"
            @click="addCommonEntityType(type)"
            class="text-sm bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded transition-colors duration-200"
          >
            {{ type }}
          </button>
        </div>
        
        <!-- 已选择的实体类型 -->
        <div v-if="selectedEntityTypes.length > 0" class="mt-3">
          <span class="text-sm text-gray-400">已选择：</span>
          <div class="flex flex-wrap gap-2 mt-1">
            <span 
              v-for="type in selectedEntityTypes"
              :key="type"
              class="inline-flex items-center bg-blue-900/50 text-blue-300 px-2 py-1 rounded text-sm"
            >
              {{ type }}
              <button 
                @click="removeEntityType(type)"
                class="ml-1 text-blue-300 hover:text-blue-100 w-5 h-5 flex items-center justify-center rounded-full hover:bg-blue-700/30 transition-colors"
              >
                ×
              </button>
            </span>
          </div>
        </div>
        
        <div v-else class="mt-2 text-gray-400 text-sm">
          请选择要提取的实体类型
        </div>
      </div>
    </a-modal>

    <div class="p-4 rounded-lg shadow">
      <div class="flex justify-between">
        <!-- <h3 class="text-lg font-semibold text-cyan-400 mb-3">操作</h3> -->
        <div class="flex gap-2">

          <!-- 提取知识图谱 -->
          <button @click="showEntityTypeModal = true"
            class="bg-[#2971CF] hover:bg-blue-700 text-white p-2 rounded transition-colors duration-200 flex items-center justify-center">
            <span class="i-heroicons-arrow-path-solid"></span>
            提取图谱
          </button>

          <button @click="() => (showAddNodeModal = true)"
            class="bg-[#2971CF] hover:bg-blue-700 text-white p-2 rounded transition-colors duration-200 flex items-center justify-center">
            <span class="i-heroicons-plus-circle-solid"></span>
            添加节点
          </button>


          <button @click="() => (showAddRelationModal = true)"
            class="bg-[#2971CF] hover:bg-blue-700 text-white p-2 rounded transition-colors duration-200 flex items-center justify-center">
            <span class="i-heroicons-link-solid"></span>
            添加关系
          </button>

          <button @click="emit('dataChange', graphData)"
            class="bg-[#2971CF] hover:bg-blue-700 text-white p-2 rounded transition-colors duration-200 flex items-center justify-center">
            <span class="i-heroicons-arrow-path-solid"></span>
            刷新
          </button>

          <button @click="toggleFullscreen"
            class="bg-[#2971CF] hover:bg-blue-700 text-white p-2 rounded transition-colors duration-200 flex items-center justify-center">
            <span :class="isFullscreen ? 'i-heroicons-arrows-pointing-in-solid' : 'i-heroicons-arrows-pointing-out-solid'"></span>
            {{ isFullscreen ? '退出全屏' : '全屏' }}
          </button>

          <!-- <button @click="emit('dataChange', { nodes: [], edges: [] })"
            class="bg-red-300 hover:bg-red-700 text-white p-2 rounded transition-colors duration-200 flex items-center justify-center">
            <span class="i-heroicons-trash-solid mr-2"></span>
            清空
          </button> -->
        </div>

        <div class="flex gap-2 ml-auto">
          <a-input v-model="searchTerm"
              placeholder="搜索ID或名称" />
          <a-select v-model="filterType">
            <a-option value="all">所有类型</a-option>
            <a-option value="人物">人物</a-option>
            <a-option value="组织">组织</a-option>
            <a-option value="地点">地点</a-option>
            <a-option value="事件">事件</a-option>
            <a-option value="概念">概念</a-option>
          </a-select>
          <a-input v-model="filterRelation"
              placeholder="输入关系类型" />
        </div>
      </div>
    </div>

  </div>
</template>