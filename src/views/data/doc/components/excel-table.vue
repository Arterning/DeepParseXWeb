<template>
  <a-layout class="flex-layout">
    <a-card :title="$t('Excel')" class="general-card">
      <a-row>
        <a-col :flex="62">
          <a-form
            :auto-label-width="true"
            :model="formModel"
            label-align="right"
          >
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item :label="$t('data.doc.form.name')" field="name">
                  <a-input
                    @keyup.enter="search"
                    v-model="formModel.name"
                    :placeholder="$t('data.doc.form.name.placeholder')"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item :label="$t('内容搜索')" field="tokens">
                  <a-input
                    @keyup.enter="search"
                    v-model="formModel.tokens"
                    :placeholder="$t('内容搜索')"
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
              {{ $t('data.doc.form.search') }}
            </a-button>
            <a-button @click="resetSelect">
              <template #icon>
                <icon-refresh />
              </template>
              {{ $t('data.doc.form.reset') }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      
      <a-divider class="mt-0" />

      <a-space :size="'medium'">
        <a-button type="primary" @click="NewApi()">
          <template #icon>
            <icon-plus />
          </template>
          {{ $t('data.doc.button.create') }}
        </a-button>
        <a-button
          :disabled="deleteButtonStatus()"
          status="danger"
          @click="DeleteApi"
        >
          <template #icon>
            <icon-minus />
          </template>
          {{ $t('data.doc.button.delete') }}
        </a-button>
      </a-space>
      <div class="content">
        
        <a-table
          v-model:selected-keys="rowSelectKeys"
          column-resizable
          :bordered="false"
          :columns="columns"
          :data="renderData"
          :loading="loading"
          :pagination="pagination"
          :row-selection="rowSelection"
          :size="'medium'"
          row-key="id"
          @page-change="onPageChange"
          @page-size-change="onPageSizeChange"
        >
          <!-- <template #index="{ rowIndex }">
            {{ rowIndex + 1 }}
          </template> -->
          <template #name="{ record }">
            <a-link @click="
              router.push({
                name: 'DocDetail',
                params: { 
                  id: record.id,
                },
                query: {
                  appendix: record.name,
                }
              })
              ">{{ record.name }}</a-link>
          </template> 
          <template #desc="{ record }">
            {{ cleanMarkdown(record.desc) }}
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
              :label="$t('data.doc.form.title')"
              :rules="[
                { required: true, message: $t('data.doc.form.title.help') },
              ]"
              field="title"
            >
              <a-input
                v-model="form.title"
                :placeholder="$t('data.doc.form.name.placeholder')"
              ></a-input>
            </a-form-item>
            <a-form-item
              :feedback="true"
              :label="$t('data.doc.form.name')"
              field="name"
            >
              <a-input
                v-model="form.name"
              ></a-input>
            </a-form-item>
            <a-form-item
              :label="$t('data.doc.form.type')"
              field="type"
            >
              <a-input
                v-model="form.type"
              ></a-input>
            </a-form-item>
            <a-form-item
              :label="$t('data.doc.form.desc')"
              field="desc"
            >
              <a-textarea
                v-model="form.desc"
              ></a-textarea>
            </a-form-item>
            <a-form-item
              :label="$t('data.doc.form.content')"
              field="content"
            >
              <a-textarea
                v-model="form.content"
              ></a-textarea>
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
          fullscreen
          hideCancel
          @ok="cancelReq"
          okText="关闭"
        >
          <ExcelDetail :title="form.title" :doc_data="form.doc_data" :file="form.file"/>
        </a-modal>
      </div>
    </a-card>
  </a-layout>
  </template>
  
  <script lang="ts" setup>
    import {
      Message,
      SelectOptionData,
      TableColumnData,
      TableData,
    } from '@arco-design/web-vue';
    import { useI18n } from 'vue-i18n';
    import { computed, reactive, ref } from 'vue';
    import useLoading from '@/hooks/loading';
    import Footer from '@/components/footer/index.vue';
    import {
      createSysDoc,
      deleteSysDoc,
      querySysDocDetail,
      querySysDocList,
      SysDocParams,
      SysDocReq,
      SysDocRes,
      updateSysDoc,
    } from '@/api/doc';
    import { Pagination } from '@/types/global';
    import { tableDateFormat } from '@/utils/date';
    import { cleanMarkdown } from '@/utils/string';
    import { useRouter } from 'vue-router';


    
    const { t } = useI18n();
    const { loading, setLoading } = useLoading(true);
    const router = useRouter();

    // 表单
    const generateFormModel = () => {
      return {
        name: undefined,
        title: undefined,
        type: undefined,
        tokens: undefined,
      };
    };
    const formModel = ref(generateFormModel());
    // 表格
    const renderData = ref<SysDocRes[]>([]);
    const operateRow = ref<number>(0);
    const rowSelectKeys = ref<number[]>([]);
    const rowSelection = reactive({
      showCheckedAll: true,
      selectedRowKeys: rowSelectKeys.value,
    });
    const basePagination: Pagination = {
      current: 1,
      pageSize: 10,
      defaultPageSize: 20,
      showTotal: true,
      showPageSize: true,
      bufferSize: 3,
    };
    const pagination: Pagination = reactive({
      ...basePagination,
    });
    const NewApi = () => {
      buttonStatus.value = 'new';
      drawerTitle.value = t('data.doc.columns.new.drawer');
      resetForm(formDefaultValues);
      openNewOrEdit.value = true;
    };
    const EditApi = async (pk: number) => {
      buttonStatus.value = 'edit';
      operateRow.value = pk;
      drawerTitle.value = t('data.doc.columns.edit.drawer');
      await fetchApiDetail(pk);
      openNewOrEdit.value = true;
    };
    const DeleteApi = () => {
      drawerTitle.value = t('data.doc.columns.delete.drawer');
      openDelete.value = true;
    };
    const HideApi = (pk: number) => {
      renderData.value = renderData.value.filter((item) => {
        return item.id !== pk
      })
    };
    const ViewApi = async (pk: number) => {
      operateRow.value = pk;
      drawerTitle.value = t('查看');
      await fetchApiDetail(pk);
      openView.value = true;
    };
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
        width: 100
      },
      {
        title: t('data.doc.columns.name'),
        dataIndex: 'name',
        slotName: 'name',
        ellipsis: true,
      },
      {
        title: t('data.doc.columns.desc'),
        dataIndex: 'desc',
        slotName: 'desc',
        ellipsis: true,
        tooltip: true,
      },
      {
        title: t('data.doc.columns.createdtime'),
        dataIndex: 'created_time',
        slotName: 'created_time',
        sortable: {
          sortDirections: ['ascend', 'descend']
        },
        width: 180
      },
      {
        title: t('data.doc.columns.operate'),
        dataIndex: 'operate',
        slotName: 'operate',
        width: 150,
        align: 'center',
      },
    ]);
  
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
    const formDefaultValues: SysDocReq = {
      name: '',
      title: '',
      type: '',
      desc: '',
      content: undefined,
      doc_data: undefined,
    };
    const form = reactive<SysDocReq>({ ...formDefaultValues });
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
          await createSysDoc(form);
          cancelReq();
          Message.success(t('submit.create.success'));
          await fetchApiList({ page: 1, size: pagination.pageSize, type: 'excel' });
        } else {
          await updateSysDoc(operateRow.value, form);
          cancelReq();
          Message.success(t('submit.update.success'));
          await fetchApiList({ page: 1, size: pagination.pageSize, type: 'excel' });
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
        await deleteSysDoc({ pk: rowSelectKeys.value });
        cancelReq();
        Message.success(t('submit.delete.success'));
        await fetchApiList({ page: 1, size: pagination.pageSize, type: 'excel' });
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
    const fetchApiList = async (params: SysDocParams) => {
      setLoading(true);
      try {
        const res = await querySysDocList(params);
        renderData.value = res.items;
        pagination.total = res.total;
        pagination.current = params.page;
      } catch (error) {
        // console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchApiList({ page: 1, size: pagination.pageSize, type: 'excel' });
  
    // 请求部门详情
    const fetchApiDetail = async (pk: number) => {
      setLoading(true);
      try {
        const res = await querySysDocDetail(pk);
        resetForm(res);
      } catch (error) {
        // console.log(error);
      } finally {
        setLoading(false);
      }
    };

    // 事件: 分页
    const onPageChange = async (current: number) => {
      await fetchApiList({ page: current, size: pagination.pageSize, type: 'excel' });
    };
  
    // 事件: 分页大小
    const onPageSizeChange = async (pageSize: number) => {
      pagination.pageSize = pageSize;
      await fetchApiList({ page: 1, size: pageSize, type: 'excel' });
    };
  
    // 搜索
    const search = async () => {
      await fetchApiList({
        ...formModel.value,
        type: 'excel',
      } as unknown as SysDocParams);
    };
  
    // 重置
    const resetSelect = () => {
      formModel.value = generateFormModel();
    };
  
    // 重置方法
    const resetMethod = () => {

    };
  
    // 重置表单
    const resetForm = (data: Record<any, any>) => {
      Object.keys(data).forEach((key) => {
        // @ts-ignore
        form[key] = data[key];
      });
    };
  </script>
  
  <script lang="ts">
    export default {
      name: 'ExcelTable',
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
  