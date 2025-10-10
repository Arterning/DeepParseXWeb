<template>
  <div class="relation-graph-container">
    <a-empty v-if="!graphData.nodes.length" />
    <div v-else ref="chartContainer" class="w-full h-full rounded-lg"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';
import type { GraphData, NodeData, EdgeData } from '@/types/graph';

const props = defineProps<{
  graphData: GraphData;
}>();

const emit = defineEmits(['dataChange']);

const chartContainer = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;
const selectedElements = ref<string[]>([]);

// 节点类型颜色映射 - 使用更优雅的配色方案
const nodeTypeColors: Record<string, string> = {
  '人物': '#4A90E2',      // 优雅蓝色
  '组织': '#7B68EE',      // 柔和紫色
  '地点': '#50C878',      // 清新绿色
  '事件': '#FF8C00',      // 温暖橙色
  '概念': '#E91E63'       // 现代粉色
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
          return `${params.data.label}<br/>类型: ${params.data.type || '未知'}`;
        } else if (params.dataType === 'edge') {
          return `关系: ${params.data.label}`;
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
        { name: '人物', itemStyle: { color: '#4A90E2' } },
        { name: '组织', itemStyle: { color: '#7B68EE' } },
        { name: '地点', itemStyle: { color: '#50C878' } },
        { name: '事件', itemStyle: { color: '#FF8C00' } },
        { name: '概念', itemStyle: { color: '#E91E63' } }
      ],
      textStyle: {
        color: '#374151',
        fontSize: 12,
        fontWeight: 'bold'
      },
      itemGap: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      padding: [10, 15]
    },
    series: [{
      type: 'graph',
      layout: 'force',
      data: [],
      links: [],
      categories: [
        { name: '人物', itemStyle: { color: '#4A90E2' } },
        { name: '组织', itemStyle: { color: '#7B68EE' } },
        { name: '地点', itemStyle: { color: '#50C878' } },
        { name: '事件', itemStyle: { color: '#FF8C00' } },
        { name: '概念', itemStyle: { color: '#E91E63' } }
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
      edgeLabel: {
        show: true,
        formatter: '{c}',
        fontSize: 10,
        color: '#ffffff',
        backgroundColor: '#3A6CCA',
        // borderColor: '#6B7280',
        // borderWidth: 1,
        borderRadius: 5,
        padding: [0, 4]
      },
      label: {
        show: true,
        position: 'inside',
        fontSize: 14,
        color: '#ffffff',
        fontWeight: 'bold',
        textBorderColor: '#3A6CCA',
        textBorderWidth: 2
      },
      emphasis: {
        focus: 'adjacency',
        lineStyle: {
          width: 1
        }
      },
      force: {
        repulsion: 800,
        edgeLength: 80,
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
    const connections = connectionCount[node.id];
    // 根据连接数计算节点大小 (20-80像素范围)
    const baseSize = 20;
    const maxSize = 80;
    const sizeRange = maxSize - baseSize;
    const normalizedConnections = maxConnections > minConnections 
      ? (connections - minConnections) / (maxConnections - minConnections)
      : 0.5;
    const symbolSize = baseSize + (sizeRange * normalizedConnections);
    
    return {
      id: node.id,
      name: node.label,
      category: node.type || '未知',
      symbol: 'circle', // 统一使用圆形
      symbolSize: symbolSize,
      itemStyle: {
        color: nodeTypeColors[node.type || ''] || '#9CA3AF'
      },
      label: {
        show: true,
        position: 'inside',
        fontSize: Math.max(10, Math.min(16, symbolSize / 4)), // 根据节点大小调整字体
        color: '#ffffff',
        fontWeight: 'bold',
        textBorderColor: '#000000',
        textBorderWidth: 2
      }
    };
  });

  // 转换边数据
  const links = data.edges.map((edge: EdgeData) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    // label: edge.label,
    lineStyle: {
      color: '#6B7280',
      width: 2,
      curveness: 0.1
    },
    label: {
      show: true,
      formatter: edge.label,
      fontSize: 10,
      color: '#ffffff',
      backgroundColor: '#374151',
      borderColor: '#6B7280',
      borderWidth: 1,
      borderRadius: 4,
      padding: [2, 4]
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
  const newLabel = prompt('编辑节点名称', nodeData.name);
  if (newLabel !== null && newLabel !== nodeData.name) {
    // 更新数据并触发事件
    const updatedData = {
      nodes: props.graphData.nodes.map(node => 
        node.id === nodeData.id ? { ...node, label: newLabel } : node
      ),
      edges: props.graphData.edges
    };
    emit('dataChange', updatedData);
  }
};

// 编辑边
const editEdge = (edgeData: any) => {
  const newLabel = prompt('编辑关系类型', edgeData.label);
  if (newLabel !== null && newLabel !== edgeData.label) {
    // 更新数据并触发事件
    const updatedData = {
      nodes: props.graphData.nodes,
      edges: props.graphData.edges.map(edge => 
        edge.id === edgeData.id ? { ...edge, label: newLabel } : edge
      )
    };
    emit('dataChange', updatedData);
  }
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

// 初始化
onMounted(async () => {
  await nextTick();
  initChart();
  updateChart(props.graphData);
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
});

// 监听数据变化
watch(() => props.graphData, (newData) => {
  updateChart(newData);
}, { deep: true });

// 组件卸载时清理
import { onUnmounted } from 'vue';
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
  }
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.relation-graph-container {
  width: 100%;
  height: calc(100vh - 380px);
  /* min-height: 400px; */
}

/* .relation-graph-container > div {
  width: 100%;
  height: 100%;
} */
</style>
