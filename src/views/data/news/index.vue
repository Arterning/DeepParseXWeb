<template>
    <a-layout class="flex-layout">
      <Breadcrumb />
      <a-card :title="$t('新闻')" class="general-card">
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
                      :placeholder="$t('搜索新闻标题')"
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
          <a-button type="primary" @click="NewNews()">
            <template #icon>
              <icon-plus />
            </template>
            新增
          </a-button>
          <a-button
            :disabled="deleteButtonStatus()"
            status="danger"
            @click="DeleteNews"
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
                <a-link @click="EditNews(record.id)">
                  编辑
                </a-link>
                <a-link @click="router.push({name: 'DataDetail', params: { id: record.id }, query: { type: 'news' } })">
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
                  label="新闻名称"
                  :placeholder="$t('输入名称')"
                  :rules="[{ required: true, message: 'required' }]"
                  field="name"
              >
                <a-input
                    v-model="form.name"
                    :placeholder="$t('输入名称')"
                ></a-input>
              </a-form-item>
              <a-form-item field="summary" label="新闻简介">
                <a-textarea
                    v-model="form.summary"
                    :placeholder="$t('新闻简介')"
                />
              </a-form-item>
              <!-- news_type -->
              <a-form-item field="news_type" label="新闻类型">
                <a-input v-model="form.news_type" :placeholder="$t('新闻类型')" />
              </a-form-item>
              <!-- source -->
              <a-form-item field="source" label="新闻来源">
                <a-input v-model="form.source" :placeholder="$t('新闻来源')" />
              </a-form-item>
              <!-- organization -->
              <a-form-item field="organization" label="新闻组织">
                <a-input
                    v-model="form.organization"
                    :placeholder="$t('新闻组织')"
                />
              </a-form-item>
              <!-- author -->
              <a-form-item field="author" label="新闻作者">
                <a-input v-model="form.author" :placeholder="$t('新闻作者')" />
              </a-form-item>
              <!-- time -->
              <a-form-item field="time" label="新闻时间">
                <a-input v-model="form.time" :placeholder="$t('新闻时间')" />
              </a-form-item>
              <!-- location -->
              <a-form-item field="location" label="新闻地点">
                <a-input v-model="form.location" :placeholder="$t('新闻地点')" />
              </a-form-item>
              <!-- detail -->
              <a-form-item field="detail" label="新闻详情">
                <a-textarea v-model="form.detail" :placeholder="$t('新闻详情')" />
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
    import {useRouter} from "vue-router";
    import Footer from '@/components/footer/index.vue';
    import {
      createNews,
      deleteNews,
      queryNewsDetail,
      queryNewsList,
      NewsParams,
      NewsReq,
      NewsRes,
      updateNews,
    } from '@/api/news';
    import { Pagination } from '@/types/global';
  
    const { t } = useI18n();
    const { loading, setLoading } = useLoading(true);
    const router = useRouter();
  
    // 表单
    const generateFormModel = () => {
      return {
        name: undefined,
        summary: undefined,
        news_type: undefined,
        source: undefined,
        organization: undefined,
        author: undefined,
        time: undefined,
        location: undefined,
        detail: undefined,
      };
    };
    const formModel = ref(generateFormModel());
    // 表格
    const renderData = ref<NewsRes[]>([]);
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
    const NewNews = () => {
      buttonStatus.value = 'new';
      drawerTitle.value = t('新增');
      resetForm(formDefaultValues);
      resetForm(form);
      openNewOrEdit.value = true;
    };
    const EditNews = async (pk: number) => {
      buttonStatus.value = 'edit';
      operateRow.value = pk;
      drawerTitle.value = t('编辑');
      await fetchNewsDetail(pk);
      openNewOrEdit.value = true;
    };
    const DeleteNews = () => {
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
        title: t('新闻标题'),
        dataIndex: 'name',
        slotName: 'name',
        ellipsis: true,
        tooltip: true,
        width: 200,
      },
      {
        // 新闻简介
        title: t('新闻简介'),
        dataIndex: 'summary',
        slotName: 'summary',
        ellipsis: true,
        tooltip: true,
      },
      {
        // 新闻类型
        title: t('新闻类型'),
        dataIndex: 'news_type',
        slotName: 'news_type',
        ellipsis: true,
        tooltip: true,
      },
      {
        // 新闻来源
        title: t('新闻来源'),
        dataIndex: 'source',
        slotName: 'source',
        ellipsis: true,
        tooltip: true,
      },
      {
        // 新闻组织
        title: t('新闻组织'),
        dataIndex: 'organization',
        slotName: 'organization',
        ellipsis: true,
        tooltip: true,
      },
      {
        // 新闻作者
        title: t('新闻作者'),
        dataIndex: 'author',
        slotName: 'author',
        ellipsis: true,
        tooltip: true,
      },
      {
        // 新闻时间
        title: t('新闻时间'),
        dataIndex: 'time',
        slotName: 'time',
        ellipsis: true,
        tooltip: true,
      },
      {
        // 新闻地点
        title: t('新闻地点'),
        dataIndex: 'location',
        slotName: 'location',
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
    const formDefaultValues: NewsReq = {
      name: '',
      summary: '',
      news_type: '',
      source: '',
      organization: '',
      author: '',
      time: '',
      location: '',
      tag: '',
      person: '',
      detail: '',
    };
    const form = reactive<NewsReq>({ ...formDefaultValues });
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
          await createNews(form);
          cancelReq();
          Message.success(t('submit.create.success'));
          await fetchNewsList();
        } else {
          await updateNews(operateRow.value, form);
          cancelReq();
          Message.success(t('submit.update.success'));
          await fetchNewsList();
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
        await deleteNews({ pk: rowSelectKeys.value });
        cancelReq();
        Message.success(t('submit.delete.success'));
        await fetchNewsList();
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
    const fetchNewsList = async (params: NewsParams = {}) => {
      setLoading(true);
      try {
        const res = await queryNewsList(params);
        renderData.value = res.items;
        pagination.total = res.total;
        pagination.current = params.page;
      } catch (error) {
        // console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchNewsList();
  
    // 请求部门详情
    const fetchNewsDetail = async (pk: number) => {
      setLoading(true);
      try {
        const res = await queryNewsDetail(pk);
        resetForm(res);
      } catch (error) {
        // console.log(error);
      } finally {
        setLoading(false);
      }
    };
  
    // 事件: 分页
    const onPageChange = async (current: number) => {
      await fetchNewsList({ page: current, size: pagination.pageSize });
    };
  
    // 事件: 分页大小
    const onPageSizeChange = async (pageSize: number) => {
      pagination.pageSize = pageSize;
      await fetchNewsList({ page: 1, size: pageSize });
    };
  
    // 搜索
    const search = async () => {
      await fetchNewsList({
        ...formModel.value,
      } as unknown as NewsParams);
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
      name: 'News',
    };
  </script>
  
  <style lang="less" scoped>
    .content {
      padding-top: 20px;
    }
  </style>
  