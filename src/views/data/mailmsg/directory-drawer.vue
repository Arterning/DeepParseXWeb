<template> 
  <a-drawer
    title="文件目录" 
    :visible="open"
    :footer="false"
    :closable="true"
    @cancel="onClose"
    placement="left"
  >        
    <div class="h-full flex flex-col">
      <!-- 搜索框 -->
      <div class="mb-3">
        <a-input-search
          v-model="searchKey"
          placeholder="搜索目录..."
          style="max-width: 100%"
          allow-clear
          @search="handleSearch"
          @clear="handleClear"
          @keyup.enter="handleSearch"
        />
      </div>
      
      <!-- 目录树 -->
      <div class="flex-1 overflow-y-auto">
        <a-spin :loading="loading" class="w-full">
          <a-tree
            v-if="treeData.length > 0"
            :data="treeData"
            :default-expanded-keys="expandedKeys"
            :selected-keys="selectedKeys"
            @select="onSelect"
            block-node
          >
            <template #title="nodeData">
              <div class="flex items-center space-x-2">
                <icon-folder class="text-blue-500" />
                <span>{{ nodeData.title }}</span>
              </div>
            </template>
          </a-tree>
          
          <!-- 空状态 -->
          <div v-else class="text-center py-8" style="color: var(--color-text-3);">
            <icon-folder class="mx-auto mb-2" style="font-size: 24px;" />
            <div>{{ searchKey ? '未找到匹配的目录' : '暂无目录' }}</div>
          </div>
        </a-spin>
      </div>
    </div>
  </a-drawer>
</template>

<script setup lang='ts'>
  import { ref, computed, watch, onMounted } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import useLoading from '@/hooks/loading';
  import { queryDirectoryList, type DirectoryRes } from '@/api/dir';
  import { IconFolder } from '@arco-design/web-vue/es/icon';

  const props = defineProps({
    open: Boolean,
    refreshTrigger: {
      type: Number,
      default: 0
    }
  })

  const emit = defineEmits([
    'update:open',
    'directory-change'
  ])

  const { loading, setLoading } = useLoading(false);

  // 目录数据
  const directoryList = ref<DirectoryRes[]>([]);
  const selectedKeys = ref<string[]>([]);
  const expandedKeys = ref<string[]>([]);
  const searchKey = ref('');

  // 树形数据
  const treeData = computed(() => {
    return [{ key: 0, title: '/', children: null }, ...buildTreeData(directoryList.value)];
  });

  // 构建树形数据
  const buildTreeData = (data: any): any[] => {
    if (!data || !Array.isArray(data)) {
      return [];
    }
    
    return data.map(item => {
      if (!item || !item.id || !item.name) {
        console.warn('Invalid item:', item);
        return null;
      }
      
      return {
        key: item.id.toString(),
        title: item.name,
        children: item.children ? buildTreeData(item.children) : undefined
      };
    }).filter(Boolean);
  };

  // 加载目录列表
  const loadDirectoryList = async (searchName?: string) => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchName) {
        params.name = searchName;
      }
      
      const res = await queryDirectoryList(params);
      directoryList.value = res;
      
      const treeDataResult = buildTreeData(directoryList.value);
      
      // 递归收集所有节点的 key 用于默认展开
      expandedKeys.value = getAllNodeKeys(directoryList.value);
      
    } catch (error) {
      console.error('Load directory error:', error);
      Message.error('加载目录列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 递归获取所有节点的 key
  const getAllNodeKeys = (data: any[]): string[] => {
    const keys: string[] = [];
    
    const traverse = (nodes: any[]) => {
      nodes.forEach(node => {
        keys.push(node.id.toString());
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };
    
    traverse(data);
    return keys;
  };

  // 选择目录
  const onSelect = (newSelectedKeys: (string | number)[]) => {
    if (newSelectedKeys.length > 0) {
      const selectedKey = newSelectedKeys[0].toString();
      
      // 如果点击的是当前已选择的节点，则取消选择
      if (selectedKeys.value.includes(selectedKey)) {
        selectedKeys.value = [];
        emit('directory-change', null);
      } else {
        // 选择新节点
        selectedKeys.value = [selectedKey];
        const selectedDirectory = findNodeByKey(directoryList.value, selectedKey);
        emit('directory-change', selectedDirectory);
      }
    } else {
      selectedKeys.value = [];
      emit('directory-change', null);
    }
  };

  // 根据 key 查找节点
  const findNodeByKey = (data: any[], key: string): any => {
    for (const item of data) {
      if (item.id.toString() === key) {
        return item;
      }
      if (item.children) {
        const found = findNodeByKey(item.children, key);
        if (found) return found;
      }
    }
    return null;
  };

  // 处理搜索
  const handleSearch = () => {
    loadDirectoryList(searchKey.value);
  };

  // 处理清空搜索
  const handleClear = () => {
    searchKey.value = '';
    loadDirectoryList();
  };

  // 关闭抽屉
  const onClose = () => {
    emit('update:open', false);
  };

  // 监听刷新触发器
  watch(() => props.refreshTrigger, () => {
    if (props.open) {
      loadDirectoryList();
    }
  });

  // 监听抽屉打开状态
  watch(() => props.open, (newVal) => {
    if (newVal) {
      loadDirectoryList();
    }
  });

  onMounted(() => {
    if (props.open) {
      loadDirectoryList();
    }
  });
</script>

<style scoped>
  :deep(.arco-tree-node-title) {
    padding: 4px 8px;
    border-radius: 4px;
    transition: background-color 0.2s;
  }
  
  :deep(.arco-tree-node-title:hover) {
    background-color: var(--color-fill-1);
  }
  
  :deep(.arco-tree-node-selected .arco-tree-node-title) {
    background-color: var(--color-primary-light-1);
    color: var(--color-primary-6);
  }
</style>