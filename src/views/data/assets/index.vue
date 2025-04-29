
<template>
  <a-layout class="flex-layout">
    <Breadcrumb />
    <div class="general-card">
      <a-layout class="flex-layout">
        <a-card :title="$t('data.sysAssets')" class="general-card">
          <a-row>
            <a-col :flex="62">
              <a-form
                :auto-label-width="true"
                :model="formModel"
                label-align="right"
              >
                <a-row :gutter="16">
                  <a-col :span="8">
                    <a-form-item :label="$t('data.assets.form.name')" field="assets_name">
                      <a-input
                        v-model="formModel.assets_name"
                        :placeholder="$t('data.assets.form.name.placeholder')"
                      />
                    </a-form-item>
                  </a-col>
                  <a-col :span="8">
                    <a-form-item :label="$t('data.assets.form.ip_addr')" field="ip_addr">
                      <a-input
                        v-model="formModel.ip_addr"
                        :placeholder="$t('data.assets.form.ip_addr.placeholder')"
                      />
                    </a-form-item>
                  </a-col>
                </a-row>
              </a-form>
            </a-col>
            <a-divider direction="vertical" style="height: 30px" />
            <a-col :span="6">
              <a-space :size="'medium'" direction="horizontal">
                <a-button type="primary" @click="search">
                  <template #icon>
                    <icon-search />
                  </template>
                  {{ $t('data.assets.form.search') }}
                </a-button>
                <a-button @click="resetSelect">
                  <template #icon>
                    <icon-refresh />
                  </template>
                  {{ $t('data.assets.form.reset') }}
                </a-button>
              </a-space>
            </a-col>
          </a-row>
          <a-divider class="mt-0"/>
          <a-space :size="'medium'">
            <a-button type="primary" @click="NewApi()">
              <template #icon>
                <icon-plus />
              </template>
              {{ $t('data.assets.button.create') }}
            </a-button>
            <a-button
              :disabled="selectStatus()"
              status="danger"
              @click="DeleteApi"
            >
              <template #icon>
                <icon-minus />
              </template>
              {{ $t('data.assets.button.delete') }}
            </a-button>
          </a-space>
          <div class="content">
            
            <a-table
              v-model:selected-keys="rowSelectKeys"
              :bordered="false"
              :columns="columns"
              :data="renderData"
              :loading="loading"
              :pagination="pagination"
              :row-selection="rowSelection"
              :size="'medium'"
              row-key="id"
              :scroll="{ x: 1200 }"
              @page-change="onPageChange"
              @page-size-change="onPageSizeChange"
            >
              <!-- <template #index="{ rowIndex }">
                {{ rowIndex + 1 }}
              </template> -->
              <template #assets_name="{ record }">
                <a-link
                  @click="router.push({name: 'AssetsDetail', params: { id: record.id }, query: { type: 'assets' } })"
                  class="title-link"
                >{{ record.assets_name }}</a-link>
              </template> 
              
              <template #assets_ports="{ record }">
                <a-space wrap>
                  <a-tag v-for="(item, index) in record.assets_ports" :key='index'>{{ item }}</a-tag>
                </a-space>
              </template> 
              <template #assets_services="{ record }">
                <a-space wrap>
                  <a-tag v-for="(item, index) in record.assets_services" :key='index'>{{ item }}</a-tag>
                </a-space>
              </template> 
              <template #assets_status="{ record }">
                <a-tag v-if="record.assets_status" :color="`green`" bordered>
                  {{ $t(`data.assets.status.${record.assets_status}`) }}
                </a-tag>
                <a-tag v-else :color="`red`" bordered>
                  {{ $t(`data.assets.status.${record.assets_status}`) }}
                </a-tag>
              </template>
              <template #created_time="{ record }">
                {{ tableDateFormat(record.created_time) }}
              </template>    
              <template #operate="{ record }">
                <a-space>
                  <a-tooltip content="修改">
                    <a-link @click="EditApi(record.id)">
                      <icon-edit style="font-size:16"/>
                    </a-link>
                  </a-tooltip>
                  <a-tooltip content="查看">
                    <a-link @click="ViewApi(record.id)">
                      <icon-unordered-list  style="font-size:16"/>
                    </a-link>
                  </a-tooltip>                  
                  <a-tooltip content="隐藏">
                    <a-link @click="HideApi(record.id)">
                      <icon-eye-invisible  style="font-size:16"/>
                    </a-link>
                  </a-tooltip>
                  <a-link @click="router.push({name: 'DataDetail', params: { id: record.id }, query: { type: 'assets' } })">
                    查看
                  </a-link>
                </a-space>
              </template>
            </a-table>
          </div>
          <div class="content-modal">
            <a-modal
              :closable="false"
              :on-before-ok="beforeSubmit"
              :title="drawerTitle"
              :visible="openNewOrEdit"
              :width="550"
              @cancel="cancelReq"
              @ok="submitNewOrEdit"
            >
              <a-form ref="formRef" :model="form">
                <a-form-item
                  :feedback="true"
                  :label="$t('data.assets.form.name')"
                  :rules="[
                    { required: true, message: $t('data.assets.form.name.help') },
                  ]"
                  field="assets_name"
                >
                  <a-input
                    v-model="form.assets_name"
                    :placeholder="$t('data.assets.form.name.placeholder')"
                  ></a-input>
                </a-form-item>
                <a-form-item
                  :feedback="true"
                  :label="$t('data.assets.form.ip_addr')"
                  :rules="[
                    { required: true, message: $t('data.assets.form.ip_addr.help') },
                  ]"
                  field="ip_addr"
                >
                  <a-input
                    v-model="form.ip_addr"
                    :placeholder="$t('data.assets.form.ip_addr.placeholder')"
                  ></a-input>
                </a-form-item>
                <a-form-item
                  :feedback="true"
                  :label="$t('data.assets.form.assets_ports')"
                  field="assets_ports"
                >
                  <a-input-tag v-model="form.assets_ports" 
                  :placeholder="$t('data.assets.form.assets_ports.placeholder')" allow-clear/>
                </a-form-item>
                <a-form-item
                  :feedback="true"
                  :label="$t('data.assets.form.assets_services')"
                  field="assets_services"
                >
                  <a-input-tag v-model="form.assets_services" 
                  :placeholder="$t('data.assets.form.assets_services.placeholder')" allow-clear/>
                </a-form-item>
                <a-form-item
                  :label="$t('data.assets.form.assets_desc')"
                  field="assets_desc"
                >
                  <a-textarea
                    v-model="form.assets_desc"
                  ></a-textarea>
                </a-form-item>
                <a-form-item
                  :label="$t('data.assets.form.assets_status')"
                  field="assets_status"
                >
                  <a-switch type="round" v-model="form.assets_status">
                    <template #checked>
                      {{ $t(`data.assets.form.assets_status.${form.assets_status}`) }}
                    </template>
                    <template #unchecked>
                      {{ $t(`data.assets.form.assets_status.${form.assets_status}`) }}
                    </template>
                  </a-switch>
                </a-form-item>
                <a-form-item
                  :feedback="true"
                  :label="$t('data.assets.form.assets_remarks')"
                  field="assets_remarks"
                >
                  <a-input v-model="form.assets_remarks" 
                  :placeholder="$t('data.assets.form.assets_remarks.placeholder')" allow-clear/>
                </a-form-item>
              </a-form>
            </a-modal>
            <a-modal
              :closable="false"
              :title="`${$t('modal.title.tips')}`"
              :visible="openDelete"
              :width="360"
              @cancel="cancelReq"
              @ok="submitDelete"
            >
              <a-space>
                <icon-exclamation-circle-fill size="24" style="color: #e6a23c" />
                {{ $t('modal.title.tips.delete') }}
              </a-space>
            </a-modal>
            <a-modal
              :closable="false"
              :title="`${$t('内容')}`"
              :visible="openView"
              hideCancel
              @ok="cancelReq"
              okText="关闭"
            >
              <AssetsDetail :info="form"/>
            </a-modal>
          </div>
        </a-card>
      </a-layout>
    </div>
  </a-layout>
</template>

<script setup lang='ts'>
  import { computed, reactive, ref } from 'vue';
  import { Pagination } from '@/types/global';
  import { useI18n } from 'vue-i18n';
  import useLoading from '@/hooks/loading';
  import { useRouter } from 'vue-router';
  import { tableDateFormat } from '@/utils/date';
  import {
    Message,
    TableColumnData,
  } from '@arco-design/web-vue';
  import { 
    createSysAssets,
    deleteSysAssets,
    querySysAssetsDetail,
    updateSysAssets,
    querySysAssetsList,
    SysAssetsParams
  } from '@/api/assets';
  import { 
    querySysAssetsDetailTest,
    querySysAssetsListTest
   } from './test';
   import AssetsDetail from './components/assets-detail/detail.vue';

  const { t } = useI18n();
  const { loading, setLoading } = useLoading(true);
  const router = useRouter();

  // 表单
  const generateFormModel = () => {
    return {
      ip_addr: '',
      assets_name: '',
      assets_ports: [],
      assets_services: [],
      assets_desc: '',
      assets_status: true,
      assets_remarks: '',
      created_time: '',
      updated_time: ''
    };
  };

    // 对话框
  const openNewOrEdit = ref<boolean>(false);
  const openDelete = ref<boolean>(false);
  const openView = ref<boolean>(false);
  const drawerTitle = ref<string>('');
  const cancelReq = () => {
    openNewOrEdit.value = false;
    openDelete.value = false;
    openView.value = false;
  };
  const formDefaultValues: any = {
    ip_addr: '',
    assets_name: '',
    assets_ports: [],
    assets_services: [],
    assets_desc: '',
    assets_status: true,
    assets_remarks: '',
    created_time: '',
    updated_time: ''
  };

  const form = reactive<any>({ ...formDefaultValues });
  const buttonStatus = ref<string>();
  const formRef = ref();

  const formModel = ref(generateFormModel());
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
      sortable: {
        sortDirections: ['ascend', 'descend']
      },
      ellipsis: true,
      tooltip: true,
      width: 100,
    },
    {
      title: t('data.assets.columns.assets_name'),
      dataIndex: 'assets_name',
      slotName: 'assets_name',
      ellipsis: true,
      width: 180
    },
    {
      title: t('data.assets.columns.ip_addr'),
      dataIndex: 'ip_addr',
      slotName: 'ip_addr',
      width: 150
    }, 
    {
      title: t('data.assets.columns.assets_ports'),
      dataIndex: 'assets_ports',
      slotName: 'assets_ports',
    }, 
    {
      title: t('data.assets.columns.assets_services'),
      dataIndex: 'assets_services',
      slotName: 'assets_services',
    }, 
    {
      title: t('data.assets.columns.assets_desc'),
      dataIndex: 'assets_desc',
      slotName: 'assets_desc',
      tooltip: true,
      ellipsis: true,
    },  
    {
      title: t('data.assets.columns.assets_status'),
      dataIndex: 'assets_status',
      slotName: 'assets_status',
      width: 100
    },
    {
      title: t('data.assets.columns.created_time'),
      dataIndex: 'created_time',
      slotName: 'created_time',
      sortable: {
        sortDirections: ['ascend', 'descend']
      },
      width: 180
    },
    {
      title: t('data.assets.columns.operate'),
      dataIndex: 'operate',
      slotName: 'operate',
      align: 'center',
      fixed: 'right',
      width: 150,
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

  // 重置表单
  const resetForm = (data: Record<any, any>) => {
    Object.keys(data).forEach((key) => {
      // @ts-ignore
      form[key] = data[key];
    });
  };


  // 请求列表
  const fetchApiList = async (params: any) => {
    setLoading(true);
    try {
      const res = await querySysAssetsList(params);
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

  // 请求详情
  const fetchApiDetail = async (pk: number) => {
    setLoading(true);
    try {
      const res = await querySysAssetsDetail(pk);
      // const res = querySysAssetsDetailTest(pk);
      resetForm(res);
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const NewApi = () => {
    buttonStatus.value = 'new';
    drawerTitle.value = t('data.assets.columns.new.drawer');
    resetForm(formDefaultValues);
    openNewOrEdit.value = true;
  };
  const EditApi = async (pk: number) => {
    buttonStatus.value = 'edit';
    operateRow.value = pk;
    drawerTitle.value = t('data.assets.columns.edit.drawer');
    await fetchApiDetail(pk);
    openNewOrEdit.value = true;
  };
  const ViewApi = async (pk: number) => {
    operateRow.value = pk;
    drawerTitle.value = t('查看');
    await fetchApiDetail(pk);
    openView.value = true;
    // router.push({name: 'assetsDetail', params: { id: pk }});
  };
  const DeleteApi = () => {
    drawerTitle.value = t('data.assets.columns.delete.drawer');
    openDelete.value = true;
  };
  const HideApi = (pk: number) => {
    renderData.value = renderData.value.filter((item) => {
      return item.id !== pk
    })
  };

  // 重置
  const resetSelect = () => {
    formModel.value = generateFormModel();
  };
  
  // 表单校验
  const beforeSubmit = async (done: any) => {
    const res = await formRef.value?.validate();
    if (!res) {
      // 关闭对话框
      done(true);
    }
    done(false);
  };

  // 提交按钮
  const submitNewOrEdit = async () => {
    setLoading(true);
    try {
      if (buttonStatus.value === 'new') {
        console.log(form);
        
        await createSysAssets(form);
        cancelReq();
        Message.success(t('submit.create.success'));
      } else {
        await updateSysAssets(operateRow.value, form);
        cancelReq();
        Message.success(t('submit.update.success'));
      }
      form.value = generateFormModel();
      await fetchApiList({ page: 1, size: pagination.pageSize});
    } catch (error) {
      // console.log(error);      
    } finally {
      setLoading(false);
    }
  };

  // 选取式按钮状态
  const selectStatus = () => {
    return rowSelectKeys.value?.length === 0;
  };

  // 删除按钮
  const submitDelete = async () => {
    setLoading(true);
    try {
      await deleteSysAssets({ pk: rowSelectKeys.value });
      cancelReq();
      Message.success(t('submit.execute.success'));
      rowSelectKeys.value = [];
      await fetchApiList({ page: 1, size: pagination.pageSize});
    } catch (error) {
      Message.success(t('submit.execute.fail'));
    } finally {
      setLoading(false);
    }
  };
  // 搜索
  const search = async () => {
    await fetchApiList({
      ...formModel.value,
    } as unknown as SysAssetsParams);
  };
</script>

<style lang="less" scoped>
  .content {
    padding-top: 20px;
  }
  .title-link{
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    display:block;
  }
</style>