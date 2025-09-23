<template> 
  <a-drawer
    title="邮件任务记录"
    width="75%"
    :visible="open"
    :footer="false"
    :closable="true"
    @cancel="onClose"
    unmountOnClose
  >      
    <div class="flex">
      <a-form :auto-label-width="true" :model="searchModel" label-align="right">
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item label="名称" field="name">
              <a-input v-model="searchModel.name" placeholder="搜索任务名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="时间" field="rangeTime">
              <a-range-picker v-model="searchModel.rangeTime" class="w-full"/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item label="来源" field="source">
              <a-input v-model="searchModel.source" placeholder="搜索任务来源" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="进度" field="status">
              <a-select
                v-model="searchModel.status"
                placeholder="筛选任务进度"
                :allow-clear="false"
              >
                <a-option
                    v-for="(item, index) in [
                      '邮件处理中',
                      '邮件处理失败',
                      '附件上传中',
                      '附件上传失败',
                      '已完成'                          
                    ]"
                    :key="item"
                    :value="item"
                >
                  {{ item }}
                </a-option>
              </a-select>
          </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <a-divider direction="vertical" style="height: 30px" />
      <div class="flex gap-4">
        <a-button type="primary" @click="search">
          <template #icon>
            <icon-search />
          </template>
          搜索
        </a-button>
        <a-button @click="resetSelect">
          <template #icon>
            <icon-refresh />
          </template>
          重置
        </a-button>
      </div>
    </div>
    <a-divider class="mt-0"></a-divider>
    <a-table v-model:selected-keys="rowSelectKeys" :bordered="false" :columns="columns" :data="renderData"
      :loading="loading" :pagination="pagination" :row-selection="rowSelection" :size="'small'" row-key="id"
      :scroll="{ y: tableScrollY }" @page-change="onPageChange" @page-size-change="onPageSizeChange">
      <!-- <template #index="{ rowIndex }">
        {{ rowIndex + 1 }}
      </template> -->
      <!-- <template #files="{ record }">
        <a-space>
          {{ record.success }} / {{ record.fail }} / {{ record.total }}
        </a-space>
      </template> -->
      <template #created_time="{ record }">
        {{ tableDateFormat(record.created_time) }}
      </template>
      <template #status="{ record }">
        <a-tag :color="tagMap(record.status).color" bordered>
          {{ tagMap(record.status).label }}
        </a-tag>
      </template>
      <template #operate="{ record }">
        <a-space>
          <a-tooltip content="查看详情">
            <a-link @click="viewApi(record.id)">
              <icon-unordered-list style="font-size:16" />
            </a-link>
          </a-tooltip>
          <a-tooltip content="删除">
            <a-link @click="deleteApi(record.id)" status="danger">
              <icon-delete style="font-size:16" />
            </a-link>
          </a-tooltip>
        </a-space>
      </template>
    </a-table>          

  </a-drawer>
</template>

<script setup lang='ts'>
  import { computed, reactive, ref, watch } from 'vue';
  import { Pagination } from '@/types/global';
  import useLoading from '@/hooks/loading';
  import { useRouter } from 'vue-router';
  import {
    Message,
    TableColumnData,
  } from '@arco-design/web-vue';
  import { deleteUploadTask, queryUploadTaskList } from '@/api/upload_task';
  import { tableDateFormat } from '@/utils/date';

  const props = defineProps({
    open: Boolean,
    refreshTrigger: {
      type: Number,
      default: 0
    }
  })

  const emit = defineEmits([
    'update:open'
  ])

  const { loading, setLoading } = useLoading(true);
  const router = useRouter();

  const tableScrollY = computed(() => {
    return `calc(100vh - 200px)`
  })

  const generateSearchForm = () => {
    return {
      name: '', // 任务名称
      rangeTime: ['', ''], // 开始时间范围
      status: '', // 任务状态
      source: '', // 来源
    }
  }

  const tagMap = (status: string) => {
    switch (status){
      case 'error':
        return { label: '错误', color: 'red' };
      case 'done':
        return { label: '已完成', color: 'cyan' };
      case 'pending':
        return { label: '进行中', color: 'orange' };
      default:
        return { label: '-', color: 'gary' };
    }
  }

  const searchModel = ref(generateSearchForm());
    // 表格
  const renderData = ref<any[]>([]);
  const operateRow = ref<number>(0);
  const rowSelectKeys = ref<number[]>([]);
  const rowSelection = reactive({
    showCheckedAll: true,
    selectedRowKeys: rowSelectKeys.value,
  });
  const basePagination: Pagination = {
    current: 1,
    defaultPageSize: 20,
    showTotal: true,
    showPageSize: true,
    bufferSize: 3,
  };
  const pagination: Pagination = reactive({
    ...basePagination,
  });

  const columns = computed<TableColumnData[]>(() => [
    {
      title: 'ID',
      dataIndex: 'id',
      slotName: 'id',
      // sortable: {
      //   sortDirections: ['ascend', 'descend']
      // },
      ellipsis: true,
      tooltip: true,
      width: 50,
    },
    {
      title: '任务名称',
      dataIndex: 'name',
      slotName: 'name',
      ellipsis: true,
      // width: 150
    },
    // {
    //   title: '文件数量（成功/失败/总数）',
    //   slotName: 'files',
    //   width: 150
    // },
    // {
    //   title: '总大小',
    //   dataIndex: 'size',
    //   width: 100
    // },
    {
      title: '开始时间',
      slotName: 'created_time',
      // width: 150
    },
    {
      title: '任务进度',
      slotName: 'status',
      // width: 120
    },
    // {
    //   title: '数据来源',
    //   dataIndex: 'source',
    //   ellipsis: true,
    //   width: 100
    // },
    {
      title: '操作',
      dataIndex: 'operate',
      slotName: 'operate',
      align: 'center',
      fixed: 'right',
      width: 100,
    },
  ]);

  // 事件: 分页
  const onPageChange = async (current: number) => {
    await fetchApiList({ page: current, size: pagination.pageSize});
  };

  // 事件: 分页大小
  const onPageSizeChange = async (pageSize: number) => {
    pagination.pageSize = pageSize;
    await fetchApiList({ page: 1, size: pageSize});
  };

  // 请求列表
  const fetchApiList = async (params: any) => {
    setLoading(true);
    try {
      const res = await queryUploadTaskList(params);
      renderData.value = res.items;
      pagination.total = res.total;
      pagination.current = params.page;
      
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };
  fetchApiList({ page: 1, size: pagination.pageSize });

  // 监听刷新触发器，当值变化时重新获取数据
  watch(() => props.refreshTrigger, (newVal, oldVal) => {
    if (newVal !== oldVal && newVal > 0) {
      fetchApiList({ page: pagination.current, size: pagination.pageSize });
    }
  });

  const onClose = () => {
    emit('update:open', false)
  };

  // 重置
  const resetSelect = () => {
    searchModel.value = generateSearchForm();
  };

  // 选取式按钮状态
  const selectStatus = () => {
    return rowSelectKeys.value?.length === 0;
  };

  // 搜索
  const search = async () => {
    await fetchApiList({
      ...searchModel.value,
    });
  };

  const viewApi = (id: number) => {

  }

  const deleteApi = async (id: number) => {
    setLoading(true);
    try {
      const res = await deleteUploadTask({ pk: [id] });
      if(res.code === 200){
        Message.success('删除成功')
        fetchApiList({ page: pagination.current, size: pagination.pageSize });
      }
    } 
    catch (e) {
      Message.error('删除失败');
    }
    finally {
      setLoading(false);
    }
  }
</script>