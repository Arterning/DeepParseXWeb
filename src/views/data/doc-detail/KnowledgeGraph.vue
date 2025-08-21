<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import type { GraphData } from '@/types/graph';

cytoscape.use(coseBilkent);

const props = defineProps<{
  graphData: GraphData;
}>();

const emit = defineEmits(['dataChange']);

const cy = ref<cytoscape.Core | null>(null);
const container = ref<HTMLDivElement | null>(null);
const selectedElements = ref<string[]>([]);

// 初始化图谱
const initGraph = () => {
  if (!container.value) return;

  cy.value = cytoscape({
    container: container.value,
    elements: [],
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
          'width': 'mapData(weight, 0, 100, 20, 60)',
          'height': 'mapData(weight, 0, 100, 20, 60)',
          'font-size': '12px',
          'text-wrap': 'wrap',
          'text-max-width': '80px',
          'overlay-opacity': 0,
          'border-width': 0
        }
      },
      {
        selector: 'node[type="人物"]',
        style: {
          'shape': 'ellipse',
          'background-color': '#06b6d4'
        }
      },
      {
        selector: 'node[type="组织"]',
        style: {
          'shape': 'rectangle',
          'background-color': '#8b5cf6'
        }
      },
      {
        selector: 'node[type="地点"]',
        style: {
          'shape': 'diamond',
          'background-color': '#10b981'
        }
      },
      {
        selector: 'node[type="事件"]',
        style: {
          'shape': 'star',
          'background-color': '#f59e0b'
        }
      },
      {
        selector: 'node[type="概念"]',
        style: {
          'shape': 'triangle',
          'background-color': '#ec4899'
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 2,
          'line-color': '#9ca3af',
          'curve-style': 'bezier',
          'target-arrow-shape': 'triangle',
          'target-arrow-color': '#9ca3af',
          'label': 'data(label)',
          'color': '#ffffff',
          'text-outline-color': '#4b5563',
          'text-outline-width': '2px',
          'font-size': '10px',
          'text-background-color': '#1f2937',
          'text-background-opacity': 0.8,
          'text-background-padding': '2px',
          'text-background-shape': 'roundrectangle',
          'text-margin-y': -5
        }
      },
      {
        selector: ':selected',
        style: {
          'background-color': '#ef4444',
          'line-color': '#ef4444',
          'target-arrow-color': '#ef4444',
          'source-arrow-color': '#ef4444'
        }
      },
      {
        selector: '.highlight',
        style: {
          'background-color': '#ef4444',
          'line-color': '#ef4444',
          'target-arrow-color': '#ef4444',
          'z-index': 9999,
          'border-width': '2px',
          'border-color': '#ffffff'
        }
      }
    ],
    layout: {
      name: 'cose-bilkent',
      animate: true,
      randomize: true,
      nodeRepulsion: 4500,
      idealEdgeLength: 100,
      nodeDimensionsIncludeLabels: true
    }
  });

  // 添加交互事件
  cy.value.on('select', 'node, edge', (event) => {
    selectedElements.value = event.target.map((el: any) => el.id());
  });

  cy.value.on('unselect', 'node, edge', () => {
    selectedElements.value = [];
  });

  // 右键菜单 - 删除元素
  cy.value.on('cxttap', (event) => {
    if (event.target === cy.value) return;
    
    event.target.remove();
    const newData = {
      nodes: cy.value?.nodes().map(n => n.data()) || [],
      edges: cy.value?.edges().map(e => e.data()) || []
    };
    localStorage.setItem('knowledge-graph', JSON.stringify(newData));
    emit('dataChange', newData);
  });

  // 双击节点编辑
  cy.value.on('dbltap', 'node', (event) => {
    const node = event.target;
    const newLabel = prompt('编辑节点名称', node.data('label'));
    if (newLabel !== null) {
      node.data('label', newLabel);
      const newData = {
        nodes: cy.value?.nodes().map(n => n.data()) || [],
        edges: cy.value?.edges().map(e => e.data()) || []
      };
      localStorage.setItem('knowledge-graph', JSON.stringify(newData));
      emit('dataChange', newData);
    }
  });

  // 双击边编辑
  cy.value.on('dbltap', 'edge', (event) => {
    const edge = event.target;
    const newLabel = prompt('编辑关系类型', edge.data('label'));
    if (newLabel !== null) {
      edge.data('label', newLabel);
      const newData = {
        nodes: cy.value?.nodes().map(n => n.data()) || [],
        edges: cy.value?.edges().map(e => e.data()) || []
      };
      localStorage.setItem('knowledge-graph', JSON.stringify(newData));
      emit('dataChange', newData);
    }
  });
};

// 更新图谱数据
const updateGraph = (data: GraphData) => {
  if (!cy.value) return;

  // 清除现有元素
  cy.value.elements().remove();

  // 添加新元素
  cy.value.add([
    ...data.nodes.map(node => ({
      group: 'nodes',
      data: {
        id: node.id,
        label: node.label,
        type: node.type
      }
    })),
    ...data.edges.map(edge => ({
      group: 'edges',
      data: {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label
      }
    }))
  ]);

  // 重新布局
  cy.value.layout({
    name: 'cose-bilkent',
    animate: true,
    randomize: true,
    nodeRepulsion: 4500,
    idealEdgeLength: 100,
    nodeDimensionsIncludeLabels: true
  }).run();
};

// 初始化
onMounted(() => {
  initGraph();
  updateGraph(props.graphData);
});

// 监听数据变化
watch(() => props.graphData, (newData) => {
  updateGraph(newData);
}, { deep: true });
</script>

<template>
  <a-empty v-if="!graphData.nodes.length"/>
  <div v-else ref="container" class="w-full h-full rounded-lg"></div>
</template>