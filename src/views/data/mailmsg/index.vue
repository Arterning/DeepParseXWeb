<template>
    <a-layout class="flex-layout">
      <Breadcrumb />
      <a-card :title="$t('邮件')" class="general-card">
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
                      :placeholder="$t('搜索邮件标题')"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                <a-form-item :label="$t('主题')" field="title">
                  <a-input
                    v-model="formModel.title"
                    :placeholder="$t('搜索主题')"
                    @keyup.enter="search"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item :label="$t('发件人')" field="email_from">
                  <a-input
                    v-model="formModel.email_from"
                    :placeholder="$t('搜索发件人')"
                    @keyup.enter="search"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item :label="$t('收件人')" field="email_to">
                  <a-input
                    v-model="formModel.email_to"
                    :placeholder="$t('搜索收件人')"
                    @keyup.enter="search"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item :label="$t('时间')" field="email_time">
                  <a-input
                    v-model="formModel.email_time"
                    :placeholder="$t('搜索时间')"
                    @keyup.enter="search"
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
        <a-divider class="mt-0"/>
        <a-space :size="'medium'">
          <a-button type="primary" @click="NewMailMsg()">
            <template #icon>
              <icon-plus />
            </template>
            新增
          </a-button>
          <a-button
            :disabled="deleteButtonStatus()"
            status="danger"
            @click="DeleteMailMsg"
          >
            <template #icon>
              <icon-minus />
            </template>
            删除
          </a-button>
        </a-space>
        <div class="content">
          <a-table
            v-model:selected-keys="rowSelectKeys"
            :bordered="false"
            column-resizable
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
            <template #index="{ rowIndex }">
               {{ rowIndex + 1 }} 
            </template>
            <template #operate="{ record }">
              <a-space>
                <a-link @click="EditMailMsg(record.id)">
                  编辑
                </a-link>
                <a-link @click="router.push({name: 'DataDetail', params: { id: record.id }, query: { type: 'mailmsg' } })">
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
                  label="名称"
                  :rules="[{ required: true, message: 'required' }]"
                  field="name"
              >
                <a-input
                    v-model="form.name"
                    :placeholder="$t('请输入名称')"
                ></a-input>
              </a-form-item>
              <!-- time -->
              <a-form-item :feedback="true" label="时间" field="time">
                <a-date-picker
                    v-model="form.time"
                    style="width: 500px"
                    :placeholder="$t('请输入时间')"
                />
              </a-form-item>
              <!-- 分类 -->
              <a-form-item :feedback="true" label="类型" field="category">
                <a-input
                    v-model="form.category"
                    :placeholder="$t('请输入类型')"
                ></a-input>
              </a-form-item>
              <a-form-item :feedback="true" label="发送者" field="category">
                <a-input
                    v-model="form.sender"
                    :placeholder="$t('请输入发送者')"
                ></a-input>
              </a-form-item>
              <a-form-item :feedback="true" label="接收者" field="category">
                <a-input
                    v-model="form.receiver"
                    :placeholder="$t('请输入接收者')"
                ></a-input>
              </a-form-item>
              <a-form-item :feedback="true" label="抄送者" field="category">
                <a-input
                    v-model="form.cc"
                    :placeholder="$t('请输入抄送者')"
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
    import { computed, reactive, ref } from 'vue';
    import useLoading from '@/hooks/loading';
    import Footer from '@/components/footer/index.vue';
    import {
      createMailMsg,
      deleteMailMsg,
      queryMailMsgDetail,
      queryMailMsgList,
      MailMsgParams,
      MailMsgReq,
      MailMsgRes,
      updateMailMsg,
    } from '@/api/mailmsg';
    import { Pagination } from '@/types/global';
    import {useRouter} from "vue-router";
  
    const { t } = useI18n();
    const { loading, setLoading } = useLoading(true);
    const router = useRouter();
  
    // 表单
    const generateFormModel = () => {
      return {
        name: undefined,
        title: undefined,
        type: undefined,
        email_subject: undefined,
        email_from: undefined,
        email_to: undefined,
        email_time: undefined,
      };
    };
    const formModel = ref(generateFormModel());
    // 表格
    const renderData = ref<MailMsgRes[]>([]);
    const operateRow = ref<number>(0);
    const rowSelectKeys = ref<number[]>([]);
    const rowSelection = reactive({
      showCheckedAll: true,
      selectedRowKeys: rowSelectKeys.value,
    });
    const basePagination: Pagination = {
      current: 1,
      pageSize: 20,
      defaultPageSize: 20,
      showTotal: true,
      showPageSize: true,
      bufferSize: 3,
    };
    const pagination: Pagination = reactive({
      ...basePagination,
    });
    const NewMailMsg = () => {
      buttonStatus.value = 'new';
      drawerTitle.value = t('新增');
      resetForm(formDefaultValues);
      openNewOrEdit.value = true;
    };
    const EditMailMsg = async (pk: number) => {
      buttonStatus.value = 'edit';
      operateRow.value = pk;
      drawerTitle.value = t('编辑');
      await fetchMailMsgDetail(pk);
      openNewOrEdit.value = true;
    };
    const DeleteMailMsg = () => {
      drawerTitle.value = t('删除');
      openDelete.value = true;
    };
    const lookup = () => {
      console.log('查询')
    }
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
        title: t('时间'),
        dataIndex: 'time',
        slotName: 'time',
        ellipsis: true,
        tooltip: true,
        width: 200,
      },
      {
        // category
        title: t('类型'),
        dataIndex: 'category',
        slotName: 'category',
        ellipsis: true,
        tooltip: true,
        width: 200,
      },
      {
        // 发送者
        title: t('发送者'),
        dataIndex: 'sender',
        slotName: 'sender',
        ellipsis: true,
        tooltip: true,
        width: 200,
      },
      {
        // 接收者
        title: t('接收者'),
        dataIndex: 'receiver',
        slotName: 'receiver',
        ellipsis: true,
        tooltip: true,
      },
      {
        // 抄送者
        title: t('抄送者'),
        dataIndex: 'cc',
        slotName: 'cc',
        ellipsis: true,
        tooltip: true,
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
    const formDefaultValues: MailMsgReq = {
      name: '',
      original: '',
      content: '',
      time: '',
      category: '',
      sender: '',
      receiver: '',
      cc: '',
    };
    const form = reactive<MailMsgReq>({ ...formDefaultValues });
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
          await createMailMsg(form);
          cancelReq();
          Message.success(t('submit.create.success'));
          await fetchMailMsgList();
        } else {
          await updateMailMsg(operateRow.value, form);
          cancelReq();
          Message.success(t('submit.update.success'));
          await fetchMailMsgList();
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
        await deleteMailMsg({ pk: rowSelectKeys.value });
        cancelReq();
        Message.success(t('submit.delete.success'));
        await fetchMailMsgList();
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
    const fetchMailMsgList = async (params: MailMsgParams = {}) => {
      setLoading(true);
      try {
        const res = await queryMailMsgList(params);
        renderData.value = res.items;
        pagination.total = res.total;
        pagination.current = params.page;
      } catch (error) {
        // console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMailMsgList();
  
    // 请求部门详情
    const fetchMailMsgDetail = async (pk: number) => {
      setLoading(true);
      try {
        const res = await queryMailMsgDetail(pk);
        resetForm(res);
      } catch (error) {
        // console.log(error);
      } finally {
        setLoading(false);
      }
    };
  
    // 事件: 分页
    const onPageChange = async (current: number) => {
      await fetchMailMsgList({ page: current, size: pagination.pageSize });
    };
  
    // 事件: 分页大小
    const onPageSizeChange = async (pageSize: number) => {
      pagination.pageSize = pageSize;
      await fetchMailMsgList({ page: 1, size: pageSize });
    };
  
    // 搜索
    const search = async () => {
      await fetchMailMsgList({
        ...formModel.value,
      } as unknown as MailMsgParams);
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
  </script>
  
  <script lang="ts">
    export default {
      name: 'MailMsg',
    };
  </script>
  
  <style lang="less" scoped>
    .content {
      padding-top: 20px;
    }
  </style>
  