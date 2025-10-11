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
            v-model:expanded-keys="expandedKeys"
            :selected-keys="selectedKeys"
            @select="onSelect"
          >
            <template #switcher-icon>
              <icon-down class="text-blue-500" />
            </template>
            <template #title="nodeData">
              <template v-if="nodeData.edit">
                <a-input @click.stop :default-value="nodeData.title" size="mini" allow-clear
                  placeholder="目录名不可为空"
                  @keyup.enter="updateDirName($event, nodeData)"
                  @blur="nodeData.edit=false"
                  class="border-0 bg-transparent hover:bg-transparent"
                />
              </template>
              <template v-else>
                <a-dropdown trigger="contextMenu">
                  <div class="flex items-center space-x-2 truncate">
                    <icon-folder class="text-blue-500" />
                    <span>{{ nodeData.title }}</span>
                  </div>
                  <template #content>
                    <a-doption @click="openCreateModal(nodeData)">新建目录</a-doption>
                    <a-doption v-if="nodeData.key!==0" @click="nodeData.edit=true">重命名</a-doption>
                    <a-doption v-if="nodeData.key!==0" @click="handleDelete(nodeData)">删除</a-doption>
                  </template>
                </a-dropdown>
              </template>
            </template>
          </a-tree>
        </a-spin>
      </div>
    </div>

    <a-modal
      v-model:visible="createModalVisible"
      title="新建文件夹"
      :on-before-ok="beforeSubmit"
      @ok="submitCreate"
      @cancel="resetCreateModal"
      ok-text="创建"
      cancel-text="取消"
    >
      <a-input
        v-model="createDirName"
        placeholder="请输入文件夹名称"
        allow-clear
        autofocus
      />
    </a-modal>
  </a-drawer>
</template>

<script setup lang='ts'>
  import { ref, computed, watch, onMounted } from 'vue';
  import { Modal, Message } from '@arco-design/web-vue';
  import useLoading from '@/hooks/loading';
  import { createDirectory, deleteDirectory, queryDirectoryList, updateDirectory, type DirectoryRes } from '@/api/dir';
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

  const createModalVisible = ref(false)
  const createDirName = ref('')
  const createParentKey = ref<number | null>(null)

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
        children: item.children ? buildTreeData(item.children) : undefined,
        edit: false,
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

      // 递归收集所有节点的 key 用于默认展开
      // expandedKeys.value = getAllNodeKeys(directoryList.value);
      
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

  const openCreateModal = (node: any) => {
    createParentKey.value = Number(node.key)
    createDirName.value = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    createModalVisible.value = true

    if (!expandedKeys.value.includes(node.key)) {
      expandedKeys.value.push(node.key)
    }
  }

  const resetCreateModal = () => {
    createModalVisible.value = false
    createDirName.value = ''
  }

  const beforeSubmit = async (done: any) => {
    const name = createDirName.value.trim()
    if (!name) {
      Message.warning('文件夹名不能为空')
      done(false);
    }

    const parentNode = findNodeByKey(directoryList.value, createParentKey.value?.toString() || '0')
    const siblingNames = parentNode?.children?.map((c: any) => c.name) || []
    if (siblingNames.includes(name)) {
      Message.error('同一目录下已存在同名文件夹')
      done(false);
    }

    done(true);
  };

  // 新建目录
  const submitCreate = async (node: any) => {
    const name = createDirName.value.trim();
    try {
      await createDirectory({ name, parent_id: createParentKey.value || undefined })
      Message.success('创建成功')
      createModalVisible.value = false
      createDirName.value = ''
      await loadDirectoryList(searchKey.value)
    } catch (err) {
      console.error(err)
      Message.error('创建失败')
    }
  };

  // 重命名目录
  const updateDirName = async (e: any, node: any) => {
    let name = e.target?.value || '';
    if (!name) {
      return;
    }
    // 处理同层同名
    let i = 1;
    while (directoryList.value.some(d => d.name === name)) { 
      name = `${name}(${i++})`;
    }
    try {
      await updateDirectory(Number(node.key), { name: name.trim() });
      node.edit = false;
      await loadDirectoryList(searchKey.value);
    } catch (e) {
      // console.error(e);
      Message.error('重命名失败');
    }
  }

  // 删除目录
  const handleDelete = async (node: any) => {
    const id = Number(node.key);
    if(id === 0) {
      Message.error('不可删除根目录！');
      return;
    }
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除 ${node.title} 及其子目录吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteDirectory({ pk: [id] })
          Message.success('删除成功')
          await loadDirectoryList(searchKey.value)
        } catch (e) {
          console.error(e)
          Message.error('删除失败')
        }
      }
    })
  }

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