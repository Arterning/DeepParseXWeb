<template>
  <div ref="container" class="relation-container">
    <!-- 控制按钮组 -->
    <div class="controls" :class="{ 'fullscreen-controls': isFullscreen }">
      <div class="operations-group">
        <div class="left-actions">
          <a-tooltip content="放大">
            <a-button @click="zoomIn" size="mini">
            <icon-plus />
          </a-button>
        </a-tooltip>
        <a-tooltip content="缩小">
          <a-button @click="zoomOut" size="mini">
            <icon-minus />
          </a-button>
        </a-tooltip>
        <a-tooltip :content="isFullscreen ? '退出全屏' : '全屏'">
          <a-button @click="toggleFullscreen" size="mini">
            <icon-expand v-if="!isFullscreen" />
            <icon-shrink v-else />
          </a-button>
        </a-tooltip>
        <span class="scale-text">{{ Math.round(scale * 100) }}%</span>
        <a-button @click="resetView" size="mini">复位视图</a-button>
        <a-button @click="openAddNodeModal" size="mini" type="primary">新增结点</a-button>
      </div>
        
       <!-- 下部筛选区 -->
      <div class="filter-group">
        <div class="filter-item">
          <span class="filter-label">结点筛选：</span>
          <a-radio-group 
            type="button" 
            v-model="checkedSex" 
            @change="doFilter"
            size="mini"
          >
            <a-radio value="All">全部</a-radio>
            <a-radio value="Man">男</a-radio>
            <a-radio value="Woman">女</a-radio>
          </a-radio-group>
        </div>
        <div class="filter-item">
          <span class="filter-label">关系筛选：</span>
          <a-checkbox-group 
            v-model="relCheckList" 
            @change="doFilter"
            size="mini"
          >
            <a-checkbox value="领导">领导</a-checkbox>
            <a-checkbox value="夫妻">夫妻</a-checkbox>
            <a-checkbox value="情侣">情侣</a-checkbox>
            <a-checkbox value="队友">队友</a-checkbox>
            <a-checkbox value="助理">助理</a-checkbox>
          </a-checkbox-group>
        </div>
      </div>
    </div>
  </div>
    <!-- <a-space direction="vertical" size="large" fill> -->
    
      <div class="graph-container">
        <div ref="cyContainer" class="cy-container"></div>
      </div>
    <a-modal
      v-model:visible="showAddNodeModal"
      :on-before-ok="beforeSubmit"
      title="新增结点"
      :width="600"
      unmount-on-close
      @cancel="cancelReq"
      @ok="addNode"
    >
      <a-form
        ref="formRef"
        :model="newNodeForm"
        layout="vertical"
        class="node-form"
      >
        <!-- 结点名称 -->
        <a-form-item field="name" label="结点名称">
          <a-input 
            v-model="newNodeForm.name" 
            placeholder="请输入结点名称"
            allow-clear
          />
        </a-form-item>
        <!-- 连接结点 -->
        <a-form-item field="connectNode" label="连接结点">
          <a-select 
            v-model="newNodeForm.connectNode"
            placeholder="请选择连接结点"
          >
            <a-option
              v-for="node in elements.nodes"
              :key="node.data.id"
              :value="node.data.id"
            >
              {{ node.data.label }}
              <span v-if="!node.data.label" class="text-red-500">
                (ID: {{ node.data.id }})
              </span>
            </a-option>
          </a-select>
        </a-form-item>
        <!-- 关系类型 -->
        <a-form-item field="relation" label="关系类型">
          <a-select v-model="newNodeForm.relation" placeholder="请选择关系类型">
            <a-option 
              v-for="(color, type) in relationColors"
              :key="type"
              :value="type"
            >
              <span class="flex items-center gap-2">
                <span 
                  class="inline-block w-4 h-4 rounded-full border"
                  :style="{ backgroundColor: color }"
                ></span>
                {{ type }}
              </span>
            </a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
</div>
</template>

<script setup lang="ts">
    import { ref, reactive, onMounted, onUnmounted } from 'vue'
    import Footer from '@/components/footer/index.vue';
    import { Form, Input, Select, Button, Modal } from '@arco-design/web-vue';
    import cytoscape, { Core } from 'cytoscape';
    import dagre from 'cytoscape-dagre';
    import { TableColumnData } from '@arco-design/web-vue/es/table/interface';
    import { values } from 'lodash';

    import m1Avatar from '@/assets/images/logo.png';
    import m2Avatar from '@/assets/images/logo.png';
    import m3Avatar from '@/assets/images/logo.png';
    import m4Avatar from '@/assets/images/logo.png';
    import m5Avatar from '@/assets/images/logo.png';
    import m6Avatar from '@/assets/images/logo.png';
    import m7Avatar from '@/assets/images/logo.png';
    import l1Avatar from '@/assets/images/logo.png';
    import o1Avatar from '@/assets/images/logo.png';

  // 这里假设从父组件传递人物数据，实际中可以根据需求调整
  // const props = defineProps(['info']);
  // 注册布局插件
  cytoscape.use(dagre);
// 类型定义
interface CyNode {
    data: {
      id: string;
      label: string;
      group: 'member' | 'leader' | 'helper';
      color: string;
      avatar: string;
      visible?: boolean;
    };
  }

  interface CyEdge {
    data: {
      id: string;
      source: string;
      target: string;
      relation: string;
      label: string;
      color: string;
      visible?: boolean;
    };
  }

  const cy = ref<Core>();
  const container = ref<HTMLElement>()
  const formRef = ref();
    // 状态管理
    const isFullscreen = ref(false)
    const scale = ref(1)
  // 对话框
  const cancelReq = () => {
    showAddNodeModal.value = false;
  };
    // 修正表单验证逻辑
    const beforeSubmit = async (done: (closed: boolean) => void) => {
    try {
        await formRef.value?.validate();
        done(true); // 验证通过，关闭对话框
    } catch (error) {
        done(false); // 验证失败，保持打开
    }
    };
      // 新增：关系图谱数据和方法
  const cyContainer = ref<HTMLElement>();
  const elements = ref({
    nodes: [
      // 成员节点（显式定义颜色）
      { data: { id: 'm1', label: 'mjq', group: 'member', color: '#4CAF50', avatar: m1Avatar, sexType: 'Man' } },
      { data: { id: 'm2', label: 'dcx', group: 'member', color: '#4CAF50', avatar: m2Avatar, sexType: 'Woman' } },
      { data: { id: 'm3', label: 'syx', group: 'member', color: '#4CAF50', avatar: m3Avatar, sexType: 'Man' } },
      { data: { id: 'm4', label: 'lyw', group: 'member', color: '#4CAF50', avatar: m4Avatar, sexType: 'Woman' } },
      { data: { id: 'm5', label: 'zzy', group: 'member', color: '#4CAF50', avatar: m5Avatar, sexType: 'Man' } },
      { data: { id: 'm6', label: 'yhx', group: 'member', color: '#4CAF50', avatar: m6Avatar, sexType: 'Man' } },
      { data: { id: 'm7', label: 'hjl', group: 'member', color: '#4CAF50', avatar: m7Avatar, sexType: 'Woman' } },
      // 领导节点
      { data: { id: 'l1', label: '李飞', group: 'leader', color: '#FF9800', avatar: l1Avatar , sexType: 'Man'} },
      // 其他结点
      { data: { id: 'o1', label: '刘文耀', group: 'helper', color: 'pink', avatar: o1Avatar, sexType: 'Man' } }
    ],
    edges: [
      // 初始只显示领导关系
      { data: { id: 'l1-m1', source: 'l1', target: 'm1', label: '领导', color: '#4CAF50', relation: '领导' } },
      { data: { id: 'l1-m2', source: 'l1', target: 'm2', label: '领导', color: '#4CAF50', relation: '领导' } },
      { data: { id: 'l1-m3', source: 'l1', target: 'm3', label: '领导', color: '#4CAF50', relation: '领导' } },
      { data: { id: 'l1-m4', source: 'l1', target: 'm4', label: '领导', color: '#4CAF50', relation: '领导' } },
      { data: { id: 'l1-m5', source: 'l1', target: 'm5', label: '领导', color: '#4CAF50', relation: '领导' } },
      { data: { id: 'l1-m6', source: 'l1', target: 'm6', label: '领导', color: '#4CAF50', relation: '领导' } },
      { data: { id: 'l1-m7', source: 'l1', target: 'm7', label: '领导', color: '#4CAF50', relation: '领导' } }, 
      // 隐藏的其他关系
      { data: { id: 'm1-m2', source: 'm1', target: 'm2', label: '夫妻', color: 'red', relation: '夫妻' } },
      { data: { id: 'm6-m7', source: 'm6', target: 'm7', label: '情侣', color: 'pink', relation: '情侣' } },
      { data: { id: 'm4-o1', source: 'm4', target: 'o1', label: '助理', color: 'blue', relation: '助理' } },
      // ...this.generateHiddenEdges()
    ],
  });

      // 新增筛选相关数据
  const checkedSex = ref('');
  const relCheckList = ref(['领导', '夫妻', '情侣', '助理', '队友']);

    // 新增筛选方法
  const doFilter = () => {
    if (!cy.value) return;

    cy.value?.startBatch();
    console.log(checkedSex.value)

    // 节点筛选
    cy.value?.nodes().forEach((node) => {
      const nodeData = node.data();
      // 计算激活状态
      const isActive = checkedSex.value === 'All' || nodeData.sexType === checkedSex.value;
      node.data('active', isActive);
    });
    // 边筛选
    cy.value?.edges().forEach((edge) => {
      const relationType = edge.data('relation');
      edge.data('visible', relCheckList.value.includes(relationType));
    });
    cy.value?.endBatch();
  };
  // 新增：新增结点模态框状态
  const showAddNodeModal = ref(false);
  // 新增：新增结点表单数据
  const newNodeForm = reactive({
    name: '',
    connectNode: '',
    relation: '队友',
  });

  const openAddNodeModal = () => {
    console.log('openAddNodeModal function called');
    showAddNodeModal.value = true;
  };

  // 预设关系颜色映射
  const relationColors = reactive<Record<string, string>>({
    队友: '#81D4FA',
    夫妻: '#FF6B6B',
    情侣: '#FF8EFF',
    领导: '#4CAF50',
    助理: '#2196F3',
  });
  // 已使用的颜色集合
  const usedColors = reactive(new Set<string>(Object.values(relationColors)));

  // 初始化时收集现有关系颜色
  const initRelationColors = () => {
    elements.value.edges.forEach(edge => {
      const { relation, color } = edge.data;
      if (!relationColors[relation]) {
        relationColors[relation] = color;
        usedColors.add(color);
      }
    });
  };
  // 生成随机不重复颜色
  const generateRandomColor = (): string => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    
    do {
      color = '#';
      for (let i = 0; i < 6; i += 1) {
        color += letters[Math.floor(Math.random() * 16)];
      }
    } while (usedColors.has(color));

    usedColors.add(color);
    return color;
  };
  const loading = ref(false);
  // 修改新增节点方法
  const addNode = async () => {
    if (loading.value) return;
    loading.value = true;
    try{
        if (newNodeForm.name && newNodeForm.connectNode) {
      // 生成节点
      const newNode: CyNode = {
        data: {
          id: `n${Date.now()}`,
          label: newNodeForm.name,
          group: 'member',
          color: '#4CAF50',
          avatar: '/default-avatar.jpg',
        },
      };

      // 处理关系颜色
      const relationType = newNodeForm.relation;
      let edgeColor = relationColors[relationType];
      
      // 如果关系类型不存在，生成新颜色
      if (!edgeColor) {
        edgeColor = generateRandomColor();
        relationColors[relationType] = edgeColor;
      }

      // 创建边
      const newEdge: CyEdge = {
        data: {
          id: `${newNode.data.id}-${newNodeForm.connectNode}`,
          source: newNode.data.id,
          target: newNodeForm.connectNode,
          relation: relationType,
          label: relationType, // 使用关系类型作为标签
          color: edgeColor,
        },
      };

      // 动态添加元素
      cy.value?.add([newNode, newEdge]);
      
      // 更新元素集合（用于下拉框）
      elements.value.nodes.push(newNode);
      elements.value.edges.push(newEdge);

      // 聚焦新节点
      focusNode(cy.value?.$id(newNode.data.id));

      // 关闭弹窗并重置表单
      showAddNodeModal.value = false;
      newNodeForm.name = '';
      newNodeForm.connectNode = '';
      newNodeForm.relation = '队友';
    }
    }finally{
        loading.value = false;
    }
    
  };

  // 新增复位方法
  const resetView = () => {
    cy.value?.elements().forEach(ele => {
    ele.data('active', true); // 重置激活状态
    ele.data('visible', true); // 保持原有可见性逻辑
  });
    // cy.value?.elements().data('visible', false);
    // cy.value?.$id('l1').data('visible', true);
    // cy.value?.$id('l1').neighborhood().data('visible', true);
    cy.value?.layout({ name: 'grid' }).run();
    centerNode('l1');
  };
  

  const layout = {
    name: 'dagre',
    rankDir: 'TB',
    nodeSep: 100,
    rankSep: 150,
  };

  const generateHiddenEdges = () => {
    const edges = [];
    const members = ['m1','m2','m3','m4','m5','m6','m7'];
    for (let i = 0; i < members.length; i += 1) {
      for (let j = i + 1; j < members.length; j += 1) {
        edges.push({
          data: {
            id: `${members[i]}-${members[j]}`,
            source: members[i],
            target: members[j],
            label: '队友',
            relation: '队友',
            color: '#81D4FA',
            visible: false, // 初始不可见
          },
        });
      }
    }
    return edges;
  };

  const initCy = () => {
    if (cyContainer.value) {
      console.log('elements.value.nodes:', elements.value.nodes); // 输出 nodes 数据
      cy.value = cytoscape({
        container: cyContainer.value,
        elements: elements.value,
        style: [
          {
            selector: 'node',
            style: {
              'label': 'data(label)\n', // 换行显示头像下方文字
              'text-valign': 'bottom',
              'text-margin-y': 8,
              'width': 50,
              'height': 50,
              'font-size': 12,
               // 新增透明度控制
              'opacity': (ele:any) => ele.data('active') ? 1 : 0.3,
              // 新增灰度效果
              'background-color': (ele) => ele.data('active') ? ele.data('color') : '#CCCCCC',
              // 新增边框效果
              'border-color': (ele) => ele.data('active') ? '#666' : '#999',
              'background-image': 'data(avatar)',
              'background-fit': 'cover',
              'shape': 'round-rectangle',
              'border-width': 2,
              'display': (ele:any) => ele.data('visible') ? 'element' : 'none', // 动态条件判断
            },
          },
          {
            selector: 'node[group="leader"]',
            style: {
              shape: 'diamond',
              width: 55,
              height: 55,
            },
          },
          {
            selector: 'edge',
            style: {
              'width': 2,
               // 高亮样式定义
              'line-color': (ele) => ele.hasClass('highlight') ? '#ff0000' : ele.data('color'),
              // 'width': (ele) => ele.hasClass('highlight') ? 3 : 2,
              'curve-style': 'bezier',
              'arrow-scale': 0,
              'target-arrow-color': 'transparent',
              'label': 'data(label)',
              'font-size': 10,
              'text-background-color': '#fff',
              'display': (ele:any) => ele.data('visible') ? 'element' : 'none', // 动态条件判断
              // 边透明度联动
              'opacity': (ele:any) => {
                const sourceActive = ele.source().data('active');
                const targetActive = ele.target().data('active');
                return sourceActive && targetActive ? 1 : 0.2;
            },
            },
          },
        ],
        layout: {
          name: 'concentric',
          concentric: (node) => (node.data('group') === 'leader' ? 0 : 1),
          animate: true,
        },
      });
      // 初始化可见性
      cy.value?.ready(() => {
        // 批量操作提升性能
        cy.value?.startBatch();
        // 设置所有元素初始可见性
        cy.value?.elements().forEach(ele => {
          const isLeaderEdge = ele.isEdge() && ele.data('relation') === '领导';
          const isLeaderNode = ele.isNode() && ele.data('group') === 'leader';
          
          ele.data('visible', isLeaderNode || isLeaderEdge);
        });
        // 显示李飞及其直接关联
        const leader = cy.value?.$id('l1');
        leader.data('visible', true);

        // 显示所有直接关联的节点和边
        leader.outgoers().forEach(ele => {
          ele.data('visible', true);
          if (ele.isNode()) {
            ele.data('visible', true);
            // 显示该节点的入边（领导关系）
            ele.incomers().edges(`[source = "l1"]`).data('visible', true);
          }
        });

        // 强制刷新布局
        cy.value?.endBatch();
        // // 应用布局
        // cy.value?.layout({ name: 'grid' }).run();
        // centerNode('l1');
        
        cy.value?.fit(leader, 50);
        // 使用更适合的布局
        cy.value?.layout({
          name: 'dagre',
          rankDir: 'TB',
          animate: true,
          animationDuration: 800,
        }).run();
      
        // 初始视图适配
        cy.value?.animate({
          fit: {
            eles: leader.union(leader.neighborhood()),
            padding: 100,
          },
          duration: 1000,
        });
        });
        // 监听缩放事件
        cy.value.on('zoom', e => {
            scale.value = e.target.zoom()
        })

      // 增强点击事件处理
      cy.value?.on('tap', 'node', (e) => {
        const node = e.target;
        cy.value?.startBatch();
        
        // 隐藏所有元素
        cy.value?.elements().data('visible', false);
        
        // 显示当前节点及直接关联
        node.data('visible', true);
        node.connectedEdges().data('visible', true);
        node.neighborhood().nodes().data('visible', true);

        cy.value?.endBatch();
        // cy.value?.layout({ name: 'dagre' }).run();
        cy.value?.center(node);
      });

      // 边点击事件处理
      cy.value?.on('tap', 'edge', (e) => {
        const edge = e.target;
        // 移除所有高亮
        cy.value?.elements().removeClass('highlight');
        // 添加当前高亮
        edge.addClass('highlight');
        // 强制刷新样式
        edge.trigger('style');
      });
    }
  };

  // 缩放控制
    const zoomIn = () => {
    cy.value?.animate({
        zoom: scale.value + 0.1,
        duration: 200
    })
    }
    const zoomOut = () => {
        cy.value?.animate({
            zoom: Math.max(0.3, scale.value - 0.1),
            duration: 200
        })
        }

  // 修改聚焦逻辑
  const focusNode = (node: cytoscape.NodeSingular) => {
    cy.value?.elements().data('visible', false);
    
    node.data('visible', true);
    node.connectedEdges().data('visible', true);
    node.neighborhood().nodes().data('visible', true);

    if (node.data('group') !== 'leader') {
      cy.value?.$id('l1').data('visible', true);
      cy.value?.edges('[relation = "领导"]').data('visible', true);
    }

    cy.value?.layout({ name: 'grid' }).run();
    centerNode(node.id());
  };

  // 新增：centerNode 方法
  const centerNode = (nodeId: any) => {
    if (cy.value) {
      const node = cy.value?.getElementById(nodeId);
      cy.value?.animate({
        center: { eles: node },
        zoom: 1.2,
        duration: 800,
      });
    }
  };
// 全屏控制
const toggleFullscreen = async () => {
  if (!container.value) return

  try {
    if (!isFullscreen.value) {
      await container.value.requestFullscreen()
      // 添加全屏样式
      container.value.classList.add('fullscreen-mode')
    } else {
      await document.exitFullscreen()
      container.value.classList.remove('fullscreen-mode')
    }
    
    // 延时确保浏览器完成全屏切换
    setTimeout(() => {
      cy.value?.resize().fit()
    }, 100)
    
    isFullscreen.value = !isFullscreen.value
  } catch (err) {
    console.error('全屏操作失败:', err)
  }
}

// 退出全屏监听
onMounted(() => {
    document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      container.value?.classList.remove('fullscreen-mode')
      isFullscreen.value = false
      cy.value?.resize().fit()
    }
  })
})

onUnmounted(() => {
  cy.value?.destroy()
})
  onMounted(() => {
    initRelationColors();
    // 先准备完整数据
    const hiddenEdges = generateHiddenEdges();
    elements.value.edges = [...elements.value.edges, ...hiddenEdges];
    initCy();
  });
</script>
    
<style scoped>
.controls {
  position: absolute;
  width: 90%;
  top: 10px;
  right: 25px;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  /* min-width: 380px; */
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.operations-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
}

.left-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.scale-text {
  font-size: 12px;
  color: #666;
  margin-left: 4px;
  min-width: 40px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 8px;
  /* border-top: 1px solid #eee; */
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.filter-label {
  font-size: 12px;
  color: #333;
  white-space: nowrap;
}

/* 调整组件样式 */
.arco-btn-size-mini {
  padding: 0 8px;
  height: 24px;
}

.arco-radio-button.arco-radio-size-mini {
  padding: 0 8px;
  height: 24px;
  line-height: 24px;
}

.arco-checkbox {
  margin-right: 12px;
}

.arco-checkbox:last-child {
  margin-right: 0;
}
  .cy-container {
    width: 100%;
    height: 100%;
    border: 1px solid #ddd;
    background: white;
  }

  .relation-container {
    position: relative;
    width: 100%;
    height: 600px;
    background: white; /* 设置背景色避免透明 */
}

/* 全屏模式专用样式 */
.controls.fullscreen-controls {
  position: fixed;    /* 使用固定定位 */
  top: 20px;          /* 距离屏幕顶部 */
  right: 20px;        /* 距离屏幕右侧 */
  /* 保持原有样式 */
}

.relation-container.fullscreen-mode {
  width: 100vw !important;
  height: 100vh !important;
  background: white;
  overflow: hidden;
}
.graph-container {
  width: 100%;
  height: 100%;
}

/* 重置浏览器默认全屏样式 */
:fullscreen {
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
}

::-webkit-full-screen {
  width: 100%;
  height: 100%;
}
  :deep(.highlight) {
    line-color: #ff0000 !important;
    width: 3px !important;
    z-index: 9999 !important;
    animation: pulse 1s infinite;
  }

  @keyframes pulse {
    0% { opacity: 0.8; }
    50% { opacity: 1; }
    100% { opacity: 0.8; }
  }
  :deep(.hidden) {
    display: none !important;
    opacity: 0 !important;
    z-index: -1 !important;
  }
  /* 强制显示下拉框 */
  :deep(.arco-select-popup) {
    z-index: 10001 !important;
  }

  /* 确保模态框内容可见 */
  :deep(.arco-modal-body) {
    overflow: visible;
    min-height: 240px;
  }
  /* 领导节点始终置顶 */
  :deep(node[group='leader']) {
    z-index: 9999 !important;
  }

  :deep(.related) {
    opacity: 1 !important;
  }

  :deep(.faded) {
    opacity: 0.3 !important;
  }
/* 添加平滑过渡效果 */
    :deep(.cy-container) node {
    transition: 
        opacity 0.3s ease-in-out,
        background-color 0.3s ease-in-out,
        border-color 0.3s ease-in-out;
    }

    :deep(.cy-container) edge {
    transition: opacity 0.3s ease-in-out;
    }
  .relation-option {
    display: flex;
    align-items: center;
    gap: 8px;
  }
</style>
    