<template>
  <div class="relation-graph-container">
    <a-empty v-show="!graphData.nodes.length" class="mt-6"/>
    <div v-show="graphData.nodes.length" class="chart-wrapper bg-white dark:bg-[var(--color-bg-2)]">
      <div ref="chartContainer" class="w-full h-full rounded-lg"></div>
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

    <!-- 编辑节点弹窗 -->
    <a-modal
      v-model:visible="showEditModal"
      :title="editType === 'node' ? '编辑节点' : '编辑关系'"
      @ok="handleEdit"
      @cancel="showEditModal = false"
    >
      <a-input 
        v-model="editValue" 
        :placeholder="editType === 'node' ? '请输入节点名称' : '请输入关系类型'"
        @press-enter="handleEdit"
      />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';
import type { GraphData, NodeData, EdgeData } from '@/types/graph';
import { IconFullscreen, IconFullscreenExit } from '@arco-design/web-vue/es/icon';

const props = defineProps<{
  graphData: GraphData;
}>();

const emit = defineEmits(['dataChange']);

const chartContainer = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;
const selectedElements = ref<string[]>([]);

// 全屏状态
const isFullscreen = ref(false);

// 编辑弹窗状态
const showEditModal = ref(false);
const editType = ref<'node' | 'edge'>('node');
const editValue = ref('');
const editData = ref<any>(null);

const nodeTypeColors: Record<string, string> = {
  '人物': '#f59311', 
  '组织': '#0e72cc', 
  '地点': '#fa4343',
  '事件': '#16afcc',
  '概念': '#6ca30f' 
};

// 初始化图表
const initChart = () => {
  if (!chartContainer.value) return;

  chartInstance = echarts.init(chartContainer.value);
  
  // 设置基础配置
  const option = {
    tooltip: {
      show: true,
      formatter: (params: any) => {
        if (params.dataType === 'node') {
          return `<b>${params.data.category || '未知'}</b><br/>${params.data.name}`;
        } else if (params.dataType === 'edge') {
          return `${params.data.source}<br/><b>${params.data.name}</b><br/>${params.data.target}`;
        }
        return '';
      }
    },
    legend: {
      show: true,
      orient: 'vertical',
      left: 0,
      bottom: 0,
      data: [
        { name: '人物', itemStyle: { color: '#f59311' } },
        { name: '组织', itemStyle: { color: '#0e72cc' } },
        { name: '地点', itemStyle: { color: '#fa4343' } },
        { name: '事件', itemStyle: { color: '#16afcc' } },
        { name: '概念', itemStyle: { color: '#6ca30f' } }
      ],
      textStyle: {
        color: '#9192ab',
        fontSize: 12,
        fontWeight: 'bold'
      },
      itemGap: 8,
      padding: [10, 15]
    },
    series: [{
      type: 'graph',
      layout: 'force',
      data: [],
      links: [],
      categories: [
        { name: '人物', itemStyle: { color: '#f59311' } },
        { name: '组织', itemStyle: { color: '#0e72cc' } },
        { name: '地点', itemStyle: { color: '#fa4343' } },
        { name: '事件', itemStyle: { color: '#16afcc' } },
        { name: '概念', itemStyle: { color: '#6ca30f' } }
      ],
      legendHoverLink: true,
      roam: true,
      draggable: true,
      focusNodeAdjacency: true,
      lineStyle: {
        color: '#6B7280',
        width: 2,
        curveness: 0.1
      },
      force: {
        repulsion: 1000,
        edgeLength: 100,
        layoutAnimation: true
      }
    }]
  };

  chartInstance.setOption(option);

  // 添加交互事件
  chartInstance.on('click', (params: any) => {
    if (params.dataType === 'node') {
      // 节点点击事件
      handleNodeClick(params.data);
    } else if (params.dataType === 'edge') {
      // 边点击事件
      handleEdgeClick(params.data);
    }
  });

  chartInstance.on('dblclick', (params: any) => {
    if (params.dataType === 'node') {
      // 双击节点编辑
      editNode(params.data);
    } else if (params.dataType === 'edge') {
      // 双击边编辑
      editEdge(params.data);
    }
  });

  // 右键菜单
  chartInstance.getZr().on('contextmenu', (params: any) => {
    const pointInPixel = [params.offsetX, params.offsetY];
    const pointInGrid = chartInstance!.convertFromPixel('grid', pointInPixel);
    
    // 查找点击的元素
    const clickedNode = findNodeAtPosition(pointInGrid);
    const clickedEdge = findEdgeAtPosition(pointInGrid);
    
    if (clickedNode) {
      handleNodeRightClick(clickedNode);
    } else if (clickedEdge) {
      handleEdgeRightClick(clickedEdge);
    }
  });
};

// 计算节点的连接数
const calculateNodeConnections = (data: GraphData) => {
  const connectionCount: Record<string, number> = {};
  
  // 初始化所有节点的连接数为0
  data.nodes.forEach(node => {
    connectionCount[node.id] = 0;
  });
  
  // 统计每个节点的连接数
  data.edges.forEach(edge => {
    connectionCount[edge.source]++;
    connectionCount[edge.target]++;
  });
  
  return connectionCount;
};

// 更新图表数据
const updateChart = (data: GraphData) => {
  if (!chartInstance) return;

  // 计算节点连接数
  const connectionCount = calculateNodeConnections(data);
  const maxConnections = Math.max(...Object.values(connectionCount));
  const minConnections = Math.min(...Object.values(connectionCount));
  
  // 转换节点数据
  const nodes = data.nodes.map((node: NodeData) => {
    const connections = Math.ceil(connectionCount[node.id] / 2);
    // 根据连接数计算节点大小
    const baseSize = 50;
    const maxSize = 100;
    const sizeRange = maxSize - baseSize;
    const normalizedConnections = maxConnections > minConnections 
      ? (connections - minConnections) / (maxConnections - minConnections)
      : 0.5;
    const symbolSize = baseSize + (sizeRange * normalizedConnections);
    
    return {
      id: node.id,
      name: node.label,
      category: node.type || '未知',
      symbol: 'circle',
      symbolSize: symbolSize,
      itemStyle: {
        // color: {
        //   type: 'radial',
        //   x: 0.5,
        //   y: 0.5,
        //   r: 0.8,
        //   colorStops: [
        //     { offset: 0, color: '#FFFFFF' }, // 中心亮
        //     { offset: 0.5, color: nodeTypeColors[node.type || ''] || '#9CA3AF' }, // 主体色
        //     { offset: 1, color: '#000000' } // 边缘微暗
        //   ],
        //   global: false
        // },
        color: nodeTypeColors[node.type || ''] || '#9CA3AF',
        shadowBlur: 10,
        shadowColor: nodeTypeColors[node.type || ''] || '#9CA3AF',
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        opacity: 0.8
      },
      label: {
        show: true,
        position: 'inside',
        fontSize: Math.max(12, Math.min(20, symbolSize / 4)), // 根据节点大小调整字体
        color: '#ffffff',
        fontWeight: 'bold',
        textBorderColor: '#9192ab',
        textBorderWidth: 2
      }
    };
  });

  // 转换边数据
  const links = data.edges.map((edge: EdgeData) => ({
    id: edge.id,
    name: edge.label,
    source: edge.source,
    target: edge.target,
    // label: edge.label,
    lineStyle: {
      color: '#9192ab',
      width: 2,
      curveness: 0.1
    },
    label: {
      show: true,
      formatter: edge.label,
      fontSize: 12,
      color: '#ffffff',
      backgroundColor: '#3A6CCA',
      borderWidth: 0,
      borderRadius: 12,
      padding: [4, 8]
    }
  }));

  // 更新图表
  chartInstance.setOption({
    series: [{
      data: nodes,
      links: links
    }]
  });
};

// 处理节点点击
const handleNodeClick = (nodeData: any) => {
  selectedElements.value = [nodeData.id];
  // 可以添加更多交互逻辑
};

// 处理边点击
const handleEdgeClick = (edgeData: any) => {
  selectedElements.value = [edgeData.id];
  // 可以添加更多交互逻辑
};

// 编辑节点
const editNode = (nodeData: any) => {
  editType.value = 'node';
  editValue.value = nodeData.name;
  editData.value = nodeData;
  showEditModal.value = true;
};

// 编辑边
const editEdge = (edgeData: any) => {
  editType.value = 'edge';
  editValue.value = edgeData.name;
  editData.value = edgeData;
  showEditModal.value = true;
};

// 处理编辑确认
const handleEdit = () => {
  if (!editValue.value.trim()) return;
  
  if (editType.value === 'node') {
    const updatedData = {
      nodes: props.graphData.nodes.map(node => 
        node.id === editData.value.id ? { ...node, label: editValue.value } : node
      ),
      edges: props.graphData.edges
    };
    emit('dataChange', updatedData);
  } else {
    const updatedData = {
      nodes: props.graphData.nodes,
      edges: props.graphData.edges.map(edge => 
        edge.id === editData.value.id ? { ...edge, label: editValue.value } : edge
      )
    };
    emit('dataChange', updatedData);
  }
  
  showEditModal.value = false;
};

// 查找指定位置的节点
const findNodeAtPosition = (position: number[]): any => {
  if (!chartInstance) return null;
  
  const option = chartInstance.getOption();
  const nodes = option.series[0].data;
  
  // 简化的位置检测（实际应用中需要更精确的算法）
  return nodes.find((node: any) => {
    const nodePosition = chartInstance!.convertToPixel('grid', [node.x, node.y]);
    const distance = Math.sqrt(
      Math.pow(position[0] - nodePosition[0], 2) + 
      Math.pow(position[1] - nodePosition[1], 2)
    );
    return distance < 30; // 30像素的容差
  });
};

// 查找指定位置的边
const findEdgeAtPosition = (position: number[]): any => {
  if (!chartInstance) return null;
  
  const option = chartInstance.getOption();
  const links = option.series[0].links;
  
  // 简化的边检测（实际应用中需要更精确的算法）
  return links.find((link: any) => {
    // 这里需要更复杂的边位置检测算法
    return false; // 暂时返回false，实际应用中需要实现
  });
};

// 处理节点右键点击
const handleNodeRightClick = (nodeData: any) => {
  if (confirm(`确定要删除节点 "${nodeData.name}" 吗？`)) {
    const updatedData = {
      nodes: props.graphData.nodes.filter(node => node.id !== nodeData.id),
      edges: props.graphData.edges.filter(edge => 
        edge.source !== nodeData.id && edge.target !== nodeData.id
      )
    };
    emit('dataChange', updatedData);
  }
};

// 处理边右键点击
const handleEdgeRightClick = (edgeData: any) => {
  if (confirm(`确定要删除关系 "${edgeData.label}" 吗？`)) {
    const updatedData = {
      nodes: props.graphData.nodes,
      edges: props.graphData.edges.filter(edge => edge.id !== edgeData.id)
    };
    emit('dataChange', updatedData);
  }
};

// 窗口大小变化时重新调整图表
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

// 全屏切换
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    // 进入全屏
    const container = document.querySelector('.relation-graph-container') as HTMLElement;
    if (container && container.requestFullscreen) {
      container.requestFullscreen();
    }
  } else {
    // 退出全屏
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
};

// 全屏状态变化监听
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement;
  // 全屏状态变化时重新调整图表大小
  setTimeout(() => {
    if (chartInstance) {
      chartInstance.resize();
    }
  }, 100);
};

// 初始化
onMounted(async () => {
  await nextTick();
  initChart();
  updateChart(props.graphData);
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
  // 监听全屏状态变化
  document.addEventListener('fullscreenchange', handleFullscreenChange);
});

// 监听数据变化
watch(() => props.graphData, (newData) => {
  updateChart(newData);
}, { deep: true });

// 当过滤导致数据为空后再恢复为非空时，确保图表能重新初始化并显示
watch(() => props.graphData.nodes.length, async (len) => {
  if (len > 0) {
    await nextTick();
    if (!chartInstance && chartContainer.value) {
      initChart();
    }
    updateChart(props.graphData);
    // 恢复显示后调整尺寸
    setTimeout(() => {
      if (chartInstance) {
        chartInstance.resize();
      }
    }, 0);
  }
});

// 组件卸载时清理
import { onUnmounted } from 'vue';
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
  }
  window.removeEventListener('resize', handleResize);
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
});
</script>

<style scoped>
.relation-graph-container {
  width: 100%;
  height: calc(100vh - 380px);
  position: relative;
}

.chart-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
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
