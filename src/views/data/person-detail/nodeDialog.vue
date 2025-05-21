<template>
  <div ref="container" class="relation-container" :data-theme="isDarks ? 'dark' : 'light'">
    <!-- 节点池 -->
    <div class="node-pool">
      <div class="pool-title">新增节点</div>
      <div class="node-item" 
           draggable="true"
           @dragstart="onDragStart($event, 'member')"
           :style="{ backgroundColor: '#4CAF50' }">成员</div>
    </div>
    <!-- 控制按钮组 -->
    <div class="controls">
      <div class="operations-group">
        <div class="left-actions">
          <a-tooltip content="放大"><a-button @click="zoomIn" size="mini"><icon-plus /></a-button></a-tooltip>
          <a-tooltip content="缩小"><a-button @click="zoomOut" size="mini"><icon-minus /></a-button></a-tooltip>
          <a-tooltip :content="isFullscreen ? '退出全屏' : '全屏'">
            <a-button @click="toggleFullscreen" size="mini">
              <icon-expand v-if="!isFullscreen" /><icon-shrink v-else />
            </a-button>
          </a-tooltip>
          <span class="scale-text">{{ Math.round(scale * 100) }}%</span>
          <a-button @click="resetView" size="mini">复位视图</a-button>
          <!-- <a-button @click="openAddNodeModal" size="mini" type="primary">新增结点</a-button> -->
        </div>
        <!-- 下部筛选区 -->
        <div class="filter-group">
          <div class="filter-item">
            <span class="filter-label">结点筛选：</span>
            <a-radio-group type="button" v-model="checkedSex" @change="doFilter" size="mini">
              <a-radio value="All">全部</a-radio><a-radio value="Man">男</a-radio><a-radio value="Woman">女</a-radio>
            </a-radio-group>
          </div>
          <div class="filter-item">
            <span class="filter-label">关系筛选：</span>
            <a-checkbox-group v-model="relCheckList" @change="doFilter" size="mini">
              <a-checkbox value="领导">领导</a-checkbox><a-checkbox value="夫妻">夫妻</a-checkbox>
              <a-checkbox value="情侣">情侣</a-checkbox><a-checkbox value="队友">队友</a-checkbox>
              <a-checkbox value="助理">助理</a-checkbox>
            </a-checkbox-group>
          </div>
        </div>
      </div>
    </div>
    <div class="graph-container" @dragover.prevent @drop="onDrop">
      <div ref="cyContainer" class="cy-container"></div>
    </div>
      <!-- 右键菜单 -->
  <div v-if="showNodeContextMenu" class="context-menu" :style="menuPosition" :data-theme="isDarks ? 'dark' : 'light'">
      <div class="menu-item" @click="openEditNodeModal">编辑节点</div>
      <div class="menu-item" @click="startConnection">新建连线</div>
      <div class="menu-item" @click="deleteNode">删除节点</div>
    </div>
    <!-- 连线右键菜单 -->
    <div v-if="showEdgeContextMenu" class="context-menu" :style="menuPosition" :data-theme="isDarks ? 'dark' : 'light'">
      <div class="menu-item" @click="openEditEdgeModal">编辑连线</div>
      <div class="menu-item" @click="deleteEdge">删除连线</div>
    </div>
    <div class="connection-tip" v-if="connecting">
      连接模式：点击选择目标节点 (ESC取消)
    </div>
    <div class="connection-err" v-if="error">
      <h3 style="margin-bottom: 12px; color: var(--color-text-1)">连接错误</h3>
      <div style="color: var(--color-text-2)">这两个节点之间已经存在连接</div>
    </div>
    <div class="connection-errs" v-if="errors">
      <h3 style="margin-bottom: 12px; color: var(--color-text-1)">连接错误</h3>
      <div style="color: var(--color-text-2)">不能与自身连接</div>
    </div>
    


    <!-- 编辑连线弹窗 -->
    <a-modal v-model:visible="showEditEdgeModal" title="编辑连线">
      <a-form :model="editEdgeForm" layout="vertical">
        <a-form-item label="关系类型">
          <a-select v-model="editEdgeForm.relation" @change="updateRelationColor">
            <a-option 
              v-for="(color, rel) in relationColors" 
              :key="rel" 
              :value="rel"
            >
              <span class="relation-option">
                <span class="color-dot" :style="{backgroundColor: color}"></span>
                {{ rel }}
              </span>
            </a-option>
          </a-select>
        </a-form-item>
        <!-- <a-form-item label="连线颜色">
        </a-form-item> -->
      </a-form>
      <template #footer>
        <a-button @click="updateEdge">保存</a-button>
      </template>
    </a-modal>
  <!-- 编辑节点弹窗 -->
  <a-modal v-model:visible="showEditNodeModal" title="编辑节点" @ok="updateNode" @cancel="cancelEdit">
    <a-form :model="editNodeForm" layout="vertical">
      <a-form-item label="节点名称">
        <a-input v-model="editNodeForm.label" />
      </a-form-item>
      <a-form-item label="性别">
       <a-radio-group v-model="editNodeForm.sexType">
         <a-radio value="Man">男</a-radio>
         <a-radio value="Woman">女</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
    <template #footer>
      <a-button @click="cancelEdit">取消</a-button>
      <a-button type="primary" @click="updateNode">保存</a-button>
    </template>
  </a-modal>
  </div>

</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, onUnmounted, watch, computed} from 'vue';
  import useAppStore  from '@/store/modules/app/index';
  import { Form, Input, Select, Button, Modal } from '@arco-design/web-vue';
  import cytoscape, { Core } from 'cytoscape';
  import dagre from 'cytoscape-dagre';
  import edgehandles from 'cytoscape-edgehandles';

  import m1Avatar from '@/assets/images/logo.png';
  import m2Avatar from '@/assets/images/logo.png';
  import m3Avatar from '@/assets/images/logo.png';
  import m4Avatar from '@/assets/images/logo.png';
  import m5Avatar from '@/assets/images/logo.png';
  import m6Avatar from '@/assets/images/logo.png';
  import m7Avatar from '@/assets/images/logo.png';
  import l1Avatar from '@/assets/images/logo.png';
  import o1Avatar from '@/assets/images/logo.png';

  
  // 注册插件
  cytoscape.use(dagre);
  cytoscape.use(edgehandles);

  // 类型定义
  interface CyNode {
    data: {
      id: string
      label: string
      group: string
      color: string
      avatar: string
      sexType: string
      active: boolean
      visible: boolean
    }
    position: { x: number; y: number }
  }

  interface CyEdge {
    data: {
      id: string
      source: string
      target: string
      relation: string
      color: string
      visible: boolean
    }
  }

  const appStore = useAppStore();
  const connectionMode = ref(false)// 新增状态管理
  const isDarks = computed(() => appStore.isDarkMode)
  const showContextMenu = ref(false)
  const menuX = ref(0)
  const menuY = ref(0)
  const selectedNode = ref<cytoscape.NodeSingular>()
  const showEditNodeModal = ref(false)
  const cy = ref<cytoscape.Core>();
  const cyContainer = ref<HTMLElement>();  // 新增：关系图谱数据和方法
  const container = ref<HTMLElement>()
  const formRef = ref();
  const isFullscreen = ref(false)  // 状态管理
  const scale = ref(1)
  const loading = ref(false);
  const checkedSex = ref('All');// 新增筛选相关数据
  const relCheckList = ref(['领导', '夫妻', '情侣', '助理', '队友']);
  const showAddNodeModal = ref(false);// 新增：新增结点模态框状态
  const relationColors = reactive<Record<string, string>>({
    队友: '#81D4FA', 夫妻: '#FF6B6B', 情侣: '#FF8EFF', 领导: '#4CAF50', 助理: '#2196F3',
  });   // 预设关系颜色映射
  const usedColors = reactive(new Set<string>(Object.values(relationColors)));// 已使用的颜色集合
  const newNodeForm = reactive({ name: '', connectNode: '', relation: '队友'});// 新增：新增结点表单数据
  const editNodeForm = reactive({ label: '', color: '', sexType: 'Man'})
  const layout = { name: 'dagre', rankDir: 'TB', nodeSep: 100, rankSep: 150 };
  // 这里假设从父组件传递人物数据，实际中可以根据需求调整
  // const props = defineProps(['info']);
  const showNodeContextMenu = ref(false)
  const showEdgeContextMenu = ref(false)
  const showEditEdgeModal = ref(false)
  const selectedEdge = ref<cytoscape.EdgeSingular>()
  const editEdgeForm = reactive({
    relation: '',
    color: ''
  })
  const connecting = ref(false)
  const error = ref(false)
  const errors = ref(false)
  const sourceNode = ref<cytoscape.NodeSingular>()
  const previewEdge = ref<cytoscape.EdgeSingular>()
  // 编辑节点表单类型
  interface EditNodeForm {
    label: string
    color: string
    sexType: string
  }

  const elements = ref({
    nodes: [
      // 成员节点（显式定义颜色）
      { data: { id: 'm1', label: 'mjq', group: 'member', color: '#4CAF50', avatar: m1Avatar, sexType: 'Man', active: true, visible: true } },
      { data: { id: 'm2', label: 'dcx', group: 'member', color: '#4CAF50', avatar: m2Avatar, sexType: 'Woman', active: true, visible: true } },
      { data: { id: 'm3', label: 'syx', group: 'member', color: '#4CAF50', avatar: m3Avatar, sexType: 'Man', active: true, visible: true  } },
      { data: { id: 'm4', label: 'lyw', group: 'member', color: '#4CAF50', avatar: m4Avatar, sexType: 'Woman', active: true, visible: true  } },
      { data: { id: 'm5', label: 'zzy', group: 'member', color: '#4CAF50', avatar: m5Avatar, sexType: 'Man', active: true, visible: true  } },
      { data: { id: 'm6', label: 'yhx', group: 'member', color: '#4CAF50', avatar: m6Avatar, sexType: 'Man', active: true, visible: true  } },
      { data: { id: 'm7', label: 'hjl', group: 'member', color: '#4CAF50', avatar: m7Avatar, sexType: 'Woman', active: true, visible: true  } },
      // 领导节点
      { data: { id: 'l1', label: '李飞', group: 'leader', color: '#FF9800', avatar: l1Avatar , sexType: 'Man', active: true, visible: true } },
      // 其他结点
      { data: { id: 'o1', label: '刘文耀', group: 'helper', color: 'pink', avatar: o1Avatar, sexType: 'Man', active: true, visible: true  } }
    ],
    edges: [
      // 初始只显示领导关系
      { data: { id: 'l1-m1', source: 'l1', target: 'm1', label: '领导', color: '#4CAF50', relation: '领导', visible: true } },
      { data: { id: 'l1-m2', source: 'l1', target: 'm2', label: '领导', color: '#4CAF50', relation: '领导', visible: true } },
      { data: { id: 'l1-m3', source: 'l1', target: 'm3', label: '领导', color: '#4CAF50', relation: '领导', visible: true } },
      { data: { id: 'l1-m4', source: 'l1', target: 'm4', label: '领导', color: '#4CAF50', relation: '领导', visible: true } },
      { data: { id: 'l1-m5', source: 'l1', target: 'm5', label: '领导', color: '#4CAF50', relation: '领导', visible: true } },
      { data: { id: 'l1-m6', source: 'l1', target: 'm6', label: '领导', color: '#4CAF50', relation: '领导', visible: true } },
      { data: { id: 'l1-m7', source: 'l1', target: 'm7', label: '领导', color: '#4CAF50', relation: '领导', visible: true } }, 
      // 隐藏的其他关系
      { data: { id: 'm1-m2', source: 'm1', target: 'm2', label: '夫妻', color: 'red', relation: '夫妻', visible: true } },
      { data: { id: 'm6-m7', source: 'm6', target: 'm7', label: '情侣', color: 'pink', relation: '情侣', visible: true } },
      { data: { id: 'm4-o1', source: 'm4', target: 'o1', label: '助理', color: 'blue', relation: '助理', visible: true } },
      // ...this.generateHiddenEdges()
    ],
  });
  // 安全样式访问函数
  const safeStyle = (ele: any, key: string, defaultValue: any) => {
    return ele.data(key) ?? defaultValue;
  };
  const initCy = () => {
    if (cyContainer.value) {
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
              'opacity': (ele) => safeStyle(ele, 'active', 1),// 新增透明度控制
              'background-color': (ele) => safeStyle(ele, 'active', true) ? '#4CAF50' : '#999',// 新增灰度效果
              'border-color': (ele) => safeStyle(ele, 'active', true) ? '#666' : '#999',// 新增边框效果
              'background-image': 'data(avatar)',
              'background-fit': 'cover',
              'shape': 'ellipse',
              'border-width': 2,
              'display': (ele) => safeStyle(ele, 'visible', true) ? 'element' : 'none' // 动态条件判断
            },
          },
          {
            selector: 'node[group="leader"]',
            style: {
              shape: 'ellipse',
              width: 55,
              height: 55,
            },
          },
          {
            selector: 'edge',
            style: {
              'width': 2,
              'line-color': (ele) => ele.hasClass('highlight') ? '#ff0000' : safeStyle(ele, 'color', '#2196F3'),// 高亮样式定义
              'curve-style': 'bezier',
              'arrow-scale': 0,
              'target-arrow-color': 'transparent',
              'label': 'data(label)',
              'font-size': 10,
              'text-background-color': '#fff',
              'display': (ele) => safeStyle(ele, 'visible', true) ? 'element' : 'none', // 动态条件判断
              'opacity': (ele) => {
                const sourceActive = ele.source().data('active');
                const targetActive = ele.target().data('active');
                return sourceActive && targetActive ? 1 : 0.2;
            },// 边透明度联动
            },
          },
          {
            selector: '.preview-edge',
            style: {
              'line-color': (ele) => {
                const distance = ele.data('distance') || 0
                // 动态颜色变化：距离越远颜色越红
                return distance > 500 ? '#ff4d4f' : '#666'
              },
              'line-style': 'dashed',
              'line-dash-pattern': [5, 5],
              'opacity': 0.8,
              'z-index': 9998,
              'width': (ele) => Math.max(1, 3 - (ele.data('distance') || 0)/100),
              'curve-style': 'unbundled-bezier'
            }
          }
        ],
        layout: {
          name: 'concentric',
          concentric: (node) => (node.data('group') === 'leader' ? 0 : 1),
          animate: true,
        },
        userPanningEnabled: true, // 启用平移
        boxSelectionEnabled: false, // 禁用框选
        autolock: false // 禁用自动锁定
      });

      // 添加鼠标移动预览
      cy.value?.on('mousemove', (e) => {
        if (connecting.value && sourceNode.value) {
          const pos = e.renderedPosition || e.position
          
          if (!previewEdge.value) {
            previewEdge.value = cy.value?.add({
              group: 'edges',
              data: {
                id: 'preview-edge',
                source: sourceNode.value.id(),
                target: pos,
                preview: true
              },
              classes: 'preview-edge'
            })
          } else {
            previewEdge.value.data({
              target: pos,
              // 添加动态长度限制
              distance: sourceNode.value.position().distance(pos)
            })
          }
        }
      })
      // 添加点击空白取消
      cy.value?.on('tap', (e) => {
        if(error.value || errors.value) {
          error.value = false
          errors.value = false
        }
        if (connecting.value && e.target === cy.value) {
          cancelConnection()
        }
      })
      cy.value?.ready(() => {
        cy.value?.startBatch();
        // 设置所有元素初始可见性
        cy.value?.elements().forEach(ele => {
          const isLeaderEdge = ele.isEdge() && ele.data('relation') === '领导';
          const isLeaderNode = ele.isNode() && ele.data('group') === 'leader';
          ele.data('visible', isLeaderNode || isLeaderEdge);
        });
        // 显示李飞及其直接关联
        const leader = cy.value?.$id('l1');
        leader?.data('visible', true);
        // 显示所有直接关联的节点和边
        leader?.outgoers().forEach(ele => {
          ele.data('visible', true);
          if (ele.isNode()) {
            ele.data('visible', true);
            // 显示该节点的入边（领导关系）
            ele.incomers().edges(`[source = "l1"]`).data('visible', true);
          }
        });

        // 强制刷新布局
        cy.value?.endBatch();
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

        if (connecting.value) {  // 连接模式优先处理
          if (sourceNode.value) {
            createConnection(node)
          }
          return
        }
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
        cy.value?.elements().removeClass('highlight');
        edge.addClass('highlight');
        edge.trigger('style');
      });
        // 修改节点点击事件处理
      cy.value?.on('cxttap', 'node', (e) => {
        const node = e.target;
        
        e.preventDefault();
        e.stopPropagation();
        const event = e.originalEvent as MouseEvent
        const { target } = e
        
        if (target.isNode()) {
          showNodeContextMenu.value = true
          showEdgeContextMenu.value = false
          selectedNode.value = target
        } else if (target.isEdge()) {
          showEdgeContextMenu.value = true
          showNodeContextMenu.value = false
          selectedEdge.value = target
        } else {
          return
        }
        const containerRect = container.value?.getBoundingClientRect()
        if (containerRect) {
          menuX.value = event.clientX - containerRect.left
          menuY.value = event.clientY - containerRect.top
        }
        event.preventDefault()
      });
      cy.value?.on('cxttap', 'edge', (e) => {
        const edge = e.target;

        e.preventDefault();
        e.stopPropagation();
        const event = e.originalEvent as MouseEvent
        const { target } = e
        
        if (target.isNode()) {
          showNodeContextMenu.value = true
          showEdgeContextMenu.value = false
          selectedNode.value = target
        } else if (target.isEdge()) {
          showEdgeContextMenu.value = true
          showNodeContextMenu.value = false
          selectedEdge.value = target
        } else {
          return
        }
        const containerRect = container.value?.getBoundingClientRect()
        if (containerRect) {
          menuX.value = event.clientX - containerRect.left
          menuY.value = event.clientY - containerRect.top
        }
        event.preventDefault()
      });
    }
  };
  // 更新节点数据
  const updateNode = () => {
    if (selectedNode.value) {
      // 更新节点数据
      selectedNode.value.data({
        ...selectedNode.value.data(),
        label: editNodeForm.label,
        color: editNodeForm.color,
        sexType: editNodeForm.sexType
      })

      // 更新节点样式
      selectedNode.value.style({
        'background-color': editNodeForm.color,
        'label': `${editNodeForm.label}\n` 
      })

      // 同步到原始数据源
      const nodeId = selectedNode.value.id()
      const nodeIndex = elements.value.nodes.findIndex(n => n.data.id === nodeId)
      if (nodeIndex > -1) {
        elements.value.nodes[nodeIndex].data = {
          ...elements.value.nodes[nodeIndex].data,
          ...editNodeForm
        }
      }
      // 刷新视图
      // cy.value?.layout(layout).run()
      showEditNodeModal.value = false
    }
  }
  // 更新关系选择时的颜色同步
  const updateRelationColor = (relation: string) => {
    editEdgeForm.color = relationColors[relation];
  }
    // 取消编辑
    const cancelEdit = () => {
      showEditNodeModal.value = false
      // 重置表单
      editNodeForm.label = ''
      editNodeForm.color = ''
    }
  // 拖拽处理
  const onDragStart = (event: DragEvent, type: string) => {
    // 记录拖拽起始位置偏移量
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    const offsetX = event.clientX - rect.left
    const offsetY = event.clientY - rect.top
    
    event.dataTransfer?.setData('nodeType', type)
    event.dataTransfer?.setData('offsetX', offsetX.toString())
    event.dataTransfer?.setData('offsetY', offsetY.toString())
  }

  const onDrop = (event: DragEvent) => {
    if (!cy.value || !cyContainer.value) return

    // 获取容器位置
    const containerRect = cyContainer.value.getBoundingClientRect();
    // 计算相对位置
    const clientX = event.clientX - containerRect.left;
    const clientY = event.clientY - containerRect.top;

    // 转换为画布坐标
    const pan = cy.value.pan() || { x: 0, y: 0 };
    const zoom = cy.value.zoom() || 1;

    const pos = {
      x: (clientX - pan.x) / zoom,
      y: (clientY - pan.y) / zoom
    }
    console.log('Drop Position:', { clientX, clientY, pan, zoom, pos });
    // 创建新节点
    const newNode: CyNode = {
      data: {
        id: `n${Date.now()}`,
        label: '新节点',
        group: 'member',
        avatar: '@/assets/images/logo.png',
        sexType: 'Man',
        active: true, // 新增必须字段
        visible: true // 新增必须字段
      },
      position: pos
    }

    // 添加节点并刷新布局
    cy.value.add(newNode)
    // elements.value.nodes.push(newNode)
    
  }
  // 监听主题变化
  watch(() => appStore.isDarkMode, (isDark) => {
    updateGraphTheme(isDark)
  })
  // 主题更新方法
  const updateGraphTheme = (isDark: boolean) => {
    if (!cy.value) return
    cy.value.style().update()
    cy.value.resize().fit()
  }
  // 新增筛选方法
  const doFilter = () => {
    if (!cy.value) return;
    cy.value?.startBatch();
    // 节点筛选
    cy.value?.nodes().forEach((node) => {
      const nodeData = node.data();
      console.log(nodeData)
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
  // 启动连线模式
  const startConnection = () => {
    if (selectedNode.value) {
      connecting.value = true
      sourceNode.value = selectedNode.value
      showNodeContextMenu.value = false
      
      // 添加键盘取消监听
      const cancelHandler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') cancelConnection()
      }
      document.addEventListener('keydown', cancelHandler)
      onUnmounted(() => document.removeEventListener('keydown', cancelHandler))
    }
  }
  // 新增连线逻辑
  const createConnection = async (target: cytoscape.NodeSingular) => {
    if (!sourceNode.value || !cy.value) return

    // 禁止自连接
    if (sourceNode.value.id() === target.id()) {
      errors.value = true
      return
    }

    // 检查重复连接
    const existing = cy.value.edges().filter(edge => 
      edge.data('source') === sourceNode.value?.id() && 
      edge.data('target') === target.id()  || 
      edge.data('target') === sourceNode.value?.id() && 
      edge.data('source') === target.id()
    )
  
    if (existing.length > 0) {
      error.value = true
      // 使用全局弹窗容器
      const modalContainer = document.createElement('div');
        document.body.appendChild(modalContainer);
        setTimeout(() => {
            document.body.removeChild(modalContainer);
        }, 3000);
        return;
    }

    // 创建正式边
    const edgeId = `${sourceNode.value.id()}-${target.id()}`
    const newEdge: CyEdge = {
      data: {
        id: edgeId,
        source: sourceNode.value.id(),
        target: target.id(),
        relation: '自定义关系',
        color: '#2196F3',
        visible: true
      }
    }

    // 添加到数据源和视图
    elements.value.edges.push(newEdge)
    cy.value.add(newEdge)
    // 刷新布局
    // cy.value.layout(layout).run()
    cancelConnection()

    // 添加动画效果
    cy.value?.animate({
      fit: {
        eles: sourceNode.value.union(target),
        padding: 100
      },
      duration: 500
    })
  }
  // 取消连接
  const cancelConnection = () => {
    connecting.value = false
    sourceNode.value = undefined
    if (previewEdge.value) {
      cy.value?.remove(previewEdge.value)
      previewEdge.value = undefined
    }
  }
  // 连线编辑处理
  const openEditEdgeModal = () => {
    if (selectedEdge.value) {
      editEdgeForm.relation = selectedEdge.value.data('relation')
      editEdgeForm.color = selectedEdge.value.data('color')
      // 更新关系类型选项
      // relationColors.value = {
      //   ...relationColors,
      //   [editEdgeForm.relation]: editEdgeForm.color
      // }
      showEditEdgeModal.value = true
    }
  }
  const updateEdge = () => {
    if (selectedEdge.value) {
      // 从预设颜色映射获取对应颜色
      const newColor = relationColors[editEdgeForm.relation];
      selectedEdge.value.data({
        relation: editEdgeForm.relation,
        color: editEdgeForm.color,
        label: editEdgeForm.relation
      })
      // 同步到原始数据源
      const edgeId = selectedEdge.value.id();
      const edgeIndex = elements.value.edges.findIndex(e => e.data.id === edgeId);
      if (edgeIndex > -1) {
        elements.value.edges[edgeIndex].data = {
          ...elements.value.edges[edgeIndex].data,
          relation: editEdgeForm.relation,
          color: newColor
        };
      }
      selectedEdge.value.style({
        'line-color': editEdgeForm.color
      })
      cy.value?.style().update();
      showEditEdgeModal.value = false
    }
  }

  const deleteEdge = () => {
    if (selectedEdge.value) {
      cy.value?.remove(selectedEdge.value)
      showEdgeContextMenu.value = false
    }
  }

  // 计算菜单位置
  const menuPosition = computed(() => {
    const containerRect = container.value?.getBoundingClientRect()
    if (!containerRect) return { display: 'none' }
    
    // 全屏模式下的位置修正
    if (isFullscreen.value) {
      return {
        left: `${menuX.value}px`,
        top: `${menuY.value}px`,
        position: 'fixed'
      }
    }
    
    return {
      left: `${menuX.value}px`,
      top: `${menuY.value}px`
    }
  })
  // 添加关闭菜单的全局点击监听
  onMounted(() => {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault(); // 全局阻止默认右键菜单
    })
    // 修改全局点击监听
    document.addEventListener('click', (e) => {
      if (!(e.target as Element).closest('.context-menu')) {
        showNodeContextMenu.value = false;
        showEdgeContextMenu.value = false;
      }
    });
  });
  // 打开编辑模态框
  const openEditNodeModal = () => {
    if (selectedNode.value) {
      const nodeData = selectedNode.value.data()
      editNodeForm.label = nodeData.label
      editNodeForm.color = nodeData.color
      editNodeForm.sexType = nodeData.sexType
      showEditNodeModal.value = true
    }
  }
  // 删除节点
  const deleteNode = () => {
    if (selectedNode.value) {
      cy.value?.remove(selectedNode.value);
      showContextMenu.value = false;
    }
  };
  const checkInFullscreen = () => {
    return !!document.fullscreenElement;
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

  // 新增复位方法
  const resetView = () => {
    cy.value?.elements().forEach(ele => {
      ele.data('active', true); // 重置激活状态
      ele.data('visible', true); // 保持原有可见性逻辑
    });
    cy.value?.layout({ name: 'grid' }).run();
    centerNode('l1');
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

  // 缩放控制
  const zoomIn = () => {
    cy.value?.animate({
      zoom: scale.value + 0.1,
      duration: 200
    });
  };
  const zoomOut = () => {
    cy.value?.animate({
      zoom: Math.max(0.3, scale.value - 0.1),
      duration: 200
    })
  }
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
        await container.value.requestFullscreen();
        // 添加全屏样式
        container.value.classList.add('fullscreen-mode');
      } else {
        await document.exitFullscreen();
        container.value.classList.remove('fullscreen-mode');
      }
      // 延时确保浏览器完成全屏切换
      setTimeout(() => {
        cy.value?.resize().fit();
      }, 100)
      isFullscreen.value = !isFullscreen.value;
    } catch (err) {
      console.error('全屏操作失败:', err);
    }
  }
  // 退出全屏监听
  onMounted(() => {
      document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        container.value?.classList.remove('fullscreen-mode');
        isFullscreen.value = false;
        cy.value?.resize().fit();
      }
    })
    // 延迟初始化确保DOM就绪
    setTimeout(initCy, 100);
    // 安全事件绑定
    // cy.value?.on('cxttap', handleContextMenu);
    document.addEventListener('dragover', e => e.preventDefault())
    document.addEventListener('drop', e => e.preventDefault())
  })
  onUnmounted(() => {
    cy.value?.destroy();
  })
  onMounted(() => {
    initRelationColors();
    updateGraphTheme(appStore.isDarkMode);
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
    z-index: 10;
    padding: 12px;
    border-radius: 8px;
    background: var(--graph-controls-bg);
    box-shadow: 0 4px 12px var(--graph-shadow-color);
    /* min-width: 380px; */
    display: flex;
    flex-direction: column;
    gap: 12px;

    /* 按钮文字颜色 */
    :deep(.arco-btn) {
      color: var(--graph-text-color);
      border-color: var(--graph-border-color);
      
      &:hover {
        background-color: var(--graph-hover-bg);
      }
    }
    
    /* 文字颜色 */
    .scale-text, .filter-label {
      color: var(--graph-text-color);
    }
  }
  .context-menu {
    position: absolute;
    z-index: 2000; /* 确保高于cytoscape画布 */
    background: var(--menu-bg-color);
    border: 1px solid var(--menu-border-color);
    box-shadow: 0 4px 12px var(--menu-shadow-color);
    backdrop-filter: blur(4px);
    min-width: 140px;
    border-radius: 6px;
    overflow: hidden;
    /* 新增主题变量 */
    &[data-theme='dark'] {
      --menu-bg-color: rgba(40, 40, 40, 0.95);
      --menu-border-color: rgba(255, 255, 255, 0.1);
      --menu-shadow-color: rgba(0, 0, 0, 0.3);
      --menu-text-color: #e0e0e0;
      --menu-hover-bg: rgba(255, 255, 255, 0.1);
    }
    
    &[data-theme='light'] {
      --menu-bg-color: rgba(255, 255, 255, 0.95);
      --menu-border-color: rgba(0, 0, 0, 0.1);
      --menu-shadow-color: rgba(0, 0, 0, 0.1);
      --menu-text-color: #333;
      --menu-hover-bg: rgba(0, 0, 0, 0.05);
    }
  }
    
  .menu-item {
    padding: 8px 16px;
    font-size: 13px;
    color: var(--menu-text-color);
    transition: all 0.2s;
    cursor: pointer;
    
    &:hover {
      background: var(--menu-hover-bg);
    }
  }

  .danger-item {
    color: #ff4d4f;
    &:hover {
      background: rgba(255, 77, 79, 0.1);
    }
  }

  .node-pool {
    position: absolute;
    left: 20px;
    top: 200px;
    z-index: 1000;
    background: var(--graph-controls-bg);
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 2px 8px var(--graph-shadow-color);
  }

  .pool-title {
    color: var(--graph-text-color);
    margin-bottom: 8px;
    font-weight: bold;
  }

  .node-item {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin: 5px;
    cursor: move;
    transition: transform 0.2s;
  }
  .node-item[draggable="true"] {
  cursor: grab;
  transition: transform 0.2s;
}

.node-item[draggable="true"]:active {
  cursor: grabbing;
  transform: scale(0.95);
}

  .node-item:hover {
    transform: scale(1.1);
  }

  .context-menu {
    /* 保持原有样式 */
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
    background-color: var(--graph-bg-color);
    border-color: var(--graph-border-color);
    transition: background-color 0.3s, border-color 0.3s;
  }

  .relation-container {
    position: relative;
    width: 100%;
    height: 600px;
    background-color: var(--graph-bg-color);
    border-color: var(--graph-border-color);
    transition: background-color 0.3s, border-color 0.3s;
  }
  .connection-tip {
    position: absolute;
    top: 60px;
    left: 50%;
    transform: translateX(-50%);
    padding: 8px 16px;
    background: var(--graph-controls-bg);
    border-radius: 4px;
    box-shadow: 0 2px 8px var(--graph-shadow-color);
    z-index: 1000;
    color: var(--graph-text-color);
  }
  .connection-err {
    position: absolute;
    z-index: 20000;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--color-bg-popup);
    padding: 20px;
    border-radius: 4px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  }
  .connection-errs {
    position: absolute;
    z-index: 20000;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--color-bg-popup);
    padding: 20px;
    border-radius: 4px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  }

  /* 预览连线样式 */
  :deep(.preview-edge) {
    line-color: #666;
    line-style: dashed;
    opacity: 0.7;
    z-index: 9998;
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
    position: relative;
    z-index: 1;
  }

  /* 重置浏览器默认全屏样式 */
  :fullscreen {
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    background: white;
  }
  :fullscreen .arco-modal-wrapper {
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    z-index: 10011 !important;
  }

  .arco-modal-mask {
    z-index: 10000 !important;
    background-color: rgba(0, 0, 0, 0.5) !important;
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
  /* 全局主题变量 */
  [data-theme='light'] {
    /* 明亮模式 */
    --graph-bg-color: #ffffff;
    --graph-border-color: #ffffff;
    --graph-controls-bg: rgba(255, 255, 255, 0.786);
    --graph-shadow-color: rgba(0, 0, 0, 0.244);
    --graph-text-color: #000000c3;
    --graph-hover-bg: rgba(255, 255, 255, 0.04);
  }

  [data-theme='dark'] {
    /* 暗色模式 */
    --graph-bg-color: #1a1a1a;
    --graph-border-color: #444444;
    --graph-controls-bg: rgba(26, 26, 26, 0.95);
    --graph-shadow-color: rgba(0, 0, 0, 0.3);
    --graph-text-color: #e0e0e0;
    --graph-hover-bg: rgba(255, 255, 255, 0.08);
  }
</style>
<!-- 适配Arco组件样式 -->
<style>
  :deep(.eh-preview) {
    stroke: #2196f3 !important;
    stroke-dasharray: 5 5 !important;
  }

  :deep(.eh-handle) {
    background-color: #2196f3 !important;
    width: 12px !important;
    height: 12px !important;
  }

  :deep(.eh-hover) {
    background-color: #ff5722 !important;
  }

  /* 下拉菜单 */
  [data-theme='dark'] {
    /* 模态框 */
    :deep(.arco-modal) {
      background: #2a2a2a;
      color: #e0e0e0;
    }
  }
</style>
