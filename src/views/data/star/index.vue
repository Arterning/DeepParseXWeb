<template>
    <a-layout class="flex-layout">
      <Breadcrumb />
      <a-card :title="$t('我的收藏')" class="general-card">
        <a-row>
          <a-col :flex="62">
            <a-form
              :auto-label-width="true"
              :model="formModel"
              label-align="right"
            >
              <a-row :gutter="16">
                <a-col :span="8">
                  <a-form-item field="name" label="名称">
                    <a-input
                      v-model="formModel.name"
                      :placeholder="$t('搜索名称')"
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
                搜索
              </a-button>
              <a-button @click="resetSelect">
                <template #icon>
                  <icon-refresh />
                </template>
                重置
              </a-button>
            </a-space>
          </a-col>
        </a-row>
        <a-divider style="margin-top: 0" />
        <a-space :size="'medium'">
          <a-button type="primary" @click="NewStarCollection()">
            <template #icon>
              <icon-plus />
            </template>
            新增
          </a-button>
          <a-button
            :disabled="deleteButtonStatus()"
            status="danger"
            @click="DeleteStarCollection"
          >
            <template #icon>
              <icon-minus />
            </template>
            删除
          </a-button>

          <SettingTable
            :columns="columns"
            storageKey="starCollection-columns"
            @update-columns="updateVisibleColumns"
          />
        </a-space>
        <div class="content">
          <a-table
            v-model:selected-keys="rowSelectKeys"
            :bordered="false"
            :columns="(visibleColumns as TableColumnData[])"
            :data="renderData"
            :loading="loading"
            :pagination="pagination"
            :row-selection="rowSelection"
            :size="'medium'"
            row-key="id"
            @page-change="onPageChange"
            @page-size-change="onPageSizeChange"
          >
            <template #index="{ rowIndex }">
               {{ rowIndex + 1 }} 
            </template>
            <template #operate="{ record }">
              <a-space>
                <a-link @click="EditStarCollection(record.id)">
                  编辑
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
                label="名称"
                :rules="[
                  { required: true, message: 'required' },
                ]"
                field="name"
              >
                <a-input
                  v-model="form.name"
                ></a-input>
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
        </div>
      </a-card>
      <Footer />
    </a-layout>
  </template>
  
  <script lang="ts" setup>
    import {
      Message,
      SelectOptionData,
      TableColumnData,
    } from '@arco-design/web-vue';
    import { useI18n } from 'vue-i18n';
    import { computed, onMounted, reactive, ref } from 'vue';
    import useLoading from '@/hooks/loading';
    import SettingTable from '@/components/setting-table/index.vue';
    import Footer from '@/components/footer/index.vue';
    import {
      createStarCollection,
      deleteStarCollection,
      queryStarCollectionDetail,
      queryStarCollectionList,
      StarCollectionParams,
      StarCollectionReq,
      StarCollectionRes,
      updateStarCollection,
    } from '@/api/starCollection';
    import { Pagination } from '@/types/global';
  
    const { t } = useI18n();
    const { loading, setLoading } = useLoading(true);
  
    // 表单
    const generateFormModel = () => {
      return {
        name: undefined,
      };
    };
    const formModel = ref(generateFormModel());
    // 表格
    const renderData = ref<StarCollectionRes[]>([]);
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
    const NewStarCollection = () => {
      buttonStatus.value = 'new';
      drawerTitle.value = t('新增');
      resetForm(formDefaultValues);
      openNewOrEdit.value = true;
    };
    const EditStarCollection = async (pk: number) => {
      buttonStatus.value = 'edit';
      operateRow.value = pk;
      drawerTitle.value = t('编辑');
      await fetchStarCollectionDetail(pk);
      openNewOrEdit.value = true;
    };
    const DeleteStarCollection = () => {
      drawerTitle.value = t('删除');
      openDelete.value = true;
    };
    const columns = computed<TableColumnData[]>(() => [
      {
        title: 'ID',
        dataIndex: 'index',
        slotName: 'index',
        ellipsis: true,
        tooltip: true,
        width: 100,
      },
      {
        title: t('名称'),
        dataIndex: 'name',
        slotName: 'name',
        ellipsis: true,
        tooltip: true,
        width: 200,
      },
      {
        title: t('操作'),
        dataIndex: 'operate',
        slotName: 'operate',
        align: 'center',
      },
    ]);
  
    // 对话框
    const openNewOrEdit = ref<boolean>(false);
    const openDelete = ref<boolean>(false);
    const drawerTitle = ref<string>('');
    const cancelReq = () => {
      openNewOrEdit.value = false;
      openDelete.value = false;
    };
    const formDefaultValues: StarCollectionReq = {
      name: '',
    };
    const form = reactive<StarCollectionReq>({ ...formDefaultValues });
    const buttonStatus = ref<string>();
    const formRef = ref();
  
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
          await createStarCollection(form);
          cancelReq();
          Message.success(t('submit.create.success'));
          await fetchStarCollectionList();
        } else {
          await updateStarCollection(operateRow.value, form);
          cancelReq();
          Message.success(t('submit.update.success'));
          await fetchStarCollectionList();
        }
      } catch (error) {
        // console.log(error);
      } finally {
        setLoading(false);
      }
    };
  
    // 删除按钮状态
    const deleteButtonStatus = () => {
      return rowSelectKeys.value?.length === 0;
    };
  
    // 删除按钮
    const submitDelete = async () => {
      setLoading(true);
      try {
        await deleteStarCollection({ pk: rowSelectKeys.value });
        cancelReq();
        Message.success(t('submit.delete.success'));
        await fetchStarCollectionList();
        rowSelectKeys.value = [];
      } catch (error) {
        openDelete.value = false;
        // console.log(error);
      } finally {
        openDelete.value = false;
        setLoading(false);
      }
    };
  
    // 请求API列表
    const fetchStarCollectionList = async (params: StarCollectionParams = {}) => {
      setLoading(true);
      try {
        const res = await queryStarCollectionList(params);
        renderData.value = res.items;
        pagination.total = res.total;
        pagination.current = params.page;
      } catch (error) {
        // console.log(error);
      } finally {
        setLoading(false);
      }
    };

    const initColumns = () => {
      const savedColumns = localStorage.getItem("starCollection-columns");
      if (savedColumns) {
        updateVisibleColumns(JSON.parse(savedColumns));
      } else {
        visibleColumns.value = columns.value; // 默认全部显示
      }
    }

    onMounted(() => {
      initColumns()
      fetchStarCollectionList();
    })
    
  
    // 请求部门详情
    const fetchStarCollectionDetail = async (pk: number) => {
      setLoading(true);
      try {
        const res = await queryStarCollectionDetail(pk);
        resetForm(res);
      } catch (error) {
        // console.log(error);
      } finally {
        setLoading(false);
      }
    };
  
    // 事件: 分页
    const onPageChange = async (current: number) => {
      await fetchStarCollectionList({ page: current, size: pagination.pageSize });
    };
  
    // 事件: 分页大小
    const onPageSizeChange = async (pageSize: number) => {
      pagination.pageSize = pageSize;
      await fetchStarCollectionList({ page: 1, size: pageSize });
    };
  
    // 搜索
    const search = async () => {
      await fetchStarCollectionList({
        ...formModel.value,
      } as unknown as StarCollectionParams);
    };
  
    // 重置
    const resetSelect = () => {
      formModel.value = generateFormModel();
    };
  
    // 重置方法
    const resetMethod = () => {
      formModel.value.name = undefined;
    };
  
    // 重置表单
    const resetForm = (data: Record<any, any>) => {
      Object.keys(data).forEach((key) => {
        // @ts-ignore
        form[key] = data[key];
      });
    };

    const visibleColumns = ref<TableColumnData[]>([]);

    const updateVisibleColumns = (selectedColumns: string[]) => {
      visibleColumns.value = columns.value.filter((column) => {
        return column.dataIndex && selectedColumns.includes(column.dataIndex);
      });
    };
  </script>
  
  <script lang="ts">
    export default {
      name: 'StarCollection',
    };
  </script>
  
  <style lang="less" scoped>
    .content {
      padding-top: 20px;
    }
  </style>
  