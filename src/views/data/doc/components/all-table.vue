<template>
  <a-layout class="flex-layout">
    <!--    收藏弹窗 -->
    <a-modal
      v-model:visible="collectVisi"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <template #title> 选择收藏位置 </template>
      <div>
        <a-select
          :style="{ width: '100%', marginBottom: '15px' }"
          placeholder="请选择需要保存的收藏夹"
        >
          <a-option>Beijing</a-option>
          <a-option>Shanghai</a-option>
          <a-option>Guangzhou</a-option>
        </a-select>
        <a-button style="width: 100%;">
          <div>
            新建收藏夹
          </div>
          <div>
            <icon-plus />
          </div>
        </a-button>
      </div>
      <template #footer>
        <a-button type="primary" style="width: 100%;">收藏</a-button>
      </template>
    </a-modal>
    <a-card :title="$t('All')" class="general-card">
      <a-row>
        <a-col :flex="62">
          <a-form
            :auto-label-width="true"
            :model="formModel"
            label-align="right"
          >
            <a-row :gutter="16">
              <a-col :span="8">
                <!--                <a-form-item :label="$t('data.doc.form.name')" field="name">-->
                <!--                  <a-input-->
                <!--                    v-model="formModel.name"-->
                <!--                    :placeholder="$t('data.doc.form.name.placeholder')"-->
                <!--                    @keyup.enter="search"-->
                <!--                  />-->
                <!--                </a-form-item>-->
                <a-select
                  :style="{ width: '320px', marginBottom: '10px' }"
                  :loading="loading"
                  placeholder="自定义表头"
                  multiple
                  :filter-option="false"
                >
                  <a-option
                    v-for="item in fileTypeOptions"
                    :key="item.id"
                    :value="item.name"
                    >{{ item.name }}</a-option
                  >
                </a-select>
                <a-space :size="'medium'">
                  <a-button type="primary" @click="NewApi()">
                    <template #icon>
                      <icon-plus />
                    </template>
                    {{ $t('data.doc.button.create') }}
                  </a-button>
                  <a-button type="primary">
                    <icon-arrow-up />
                    {{ $t('data.doc.button.upload') }}
                  </a-button>
                  <a-button
                    :disabled="selectStatus()"
                    status="danger"
                    @click="DeleteApi"
                  >
                    <template #icon>
                      <icon-minus />
                    </template>
                    {{ $t('data.doc.button.delete') }}
                  </a-button>
                </a-space>
              </a-col>
            </a-row>
          </a-form>
        </a-col>
        <!--        <a-divider direction="vertical" style="height: 30px" />-->
        <a-col :span="10">
          <a-space direction="horizontal">
            <a-form-item field="name" label="标签" style="margin-right: 30px">
              <a-select :style="{ width: '150px' }" placeholder="请选择标签">
                <a-option>Beijing</a-option>
                <a-option>Shanghai</a-option>
                <a-option>Guangzhou</a-option>
                <a-option disabled>Disabled</a-option>
              </a-select>
            </a-form-item>
            <a-form-item field="name" label="国籍/地区">
              <a-select :style="{ width: '150px' }" placeholder="请选择国家">
                <a-option>Beijing</a-option>
                <a-option>Shanghai</a-option>
                <a-option>Guangzhou</a-option>
                <a-option disabled>Disabled</a-option>
              </a-select>
            </a-form-item>
            <a-form-item field="name">
              <a-input
                v-model="formModel.name"
                :placeholder="$t('data.doc.form.name.placeholder')"
                @keyup.enter="search"
              >
                <template #suffix>
                  <icon-search />
                </template>
              </a-input>
            </a-form-item>
          </a-space>
          <a-space direction="horizontal">
            <a-form-item field="name" label="上传时间">
              <a-range-picker
                show-time
                :time-picker-props="{
                  defaultValue: ['00:00:00', '00:00:00'],
                }"
                style="width: 380px"
                @change="onChangeRangePicker"
                @select="onSelectRangePicker"
              />
            </a-form-item>
            <a-form-item>
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
            </a-form-item>
          </a-space>
        </a-col>
      </a-row>
      <a-divider />
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
          @page-change="onPageChange"
          @page-size-change="onPageSizeChange"
        >
          <!-- <template #index="{ rowIndex }">
            {{ rowIndex + 1 }}
          </template> -->
          <template #name="{ record }">
            <a-link
              class="title-link"
              @click="
                router.push({
                  name: 'DocDetail',
                  params: { id: record.id },
                  query: { type: 'doc' },
                })
              "
              >{{ record.name }}</a-link
            >
          </template>
          <template #isCollection>
            <div>
              <icon-star size="23" style="cursor: pointer" @click="collectVisi = true"/>
            </div>
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
                  <icon-edit style="font-size: 16" />
                </a-link>
              </a-tooltip>
              <a-tooltip content="查看">
                <a-link @click="ViewApi(record.id, record.type)">
                  <icon-unordered-list style="font-size: 16" />
                </a-link>
              </a-tooltip>
              <a-tooltip content="隐藏">
                <a-link @click="HideApi(record.id)">
                  <icon-eye-invisible style="font-size: 16" />
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
              <a-input v-model="form.name"></a-input>
            </a-form-item>
            <a-form-item :label="$t('data.doc.form.type')" field="type">
              <a-input v-model="form.type"></a-input>
            </a-form-item>
            <a-form-item :label="$t('data.doc.form.desc')" field="desc">
              <a-textarea v-model="form.desc"></a-textarea>
            </a-form-item>
            <a-form-item :label="$t('data.doc.form.content')" field="content">
              <a-textarea v-model="form.content"></a-textarea>
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
          hide-cancel
          ok-text="关闭"
          @ok="cancelReq"
        >
          <ExcelDetail
            v-if="form.type === 'excel'"
            :title="form.title"
            :doc_data="form.doc_data"
            :file="form.file"
          />
          <GeneralDetail v-else :info="form" />
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
  import {
    createSysDoc,
    deleteSysDoc,
    extractIPAddress,
    extractUserCount,
    querySysDocDetail,
    querySysDocList,
    SysDocParams,
    SysDocReq,
    SysDocRes,
    updateSysDoc,
  } from '@/api/doc';
  import { Pagination } from '@/types/global';
  import { useRouter } from 'vue-router';
  import { tableDateFormat } from '@/utils/date';
  import { cleanMarkdown } from '@/utils/string';
  import GeneralDetail from './general-detail.vue';
  import ExcelDetail from './excel-detail.vue';

  const { t } = useI18n();
  const { loading, setLoading } = useLoading(true);
  const router = useRouter();

  // 文件类型筛选单
  const fileTypeOptions = ref([
    {
      id: '文件名',
      name: '文件名',
    },
    {
      id: '文件原名',
      name: '文件原名',
    },
    {
      id: '上传时间',
      name: '上传时间',
    },
    {
      id: '文件创建时间',
      name: '文件创建时间',
    },
    {
      id: '文件类型',
      name: '文件类型',
    },
    {
      id: '上传用户',
      name: '上传用户',
    },
    {
      id: '文件来源',
      name: '文件来源',
    },
    {
      id: '文件所属部门',
      name: '文件所属部门',
    },
  ]);

  // 收藏弹窗
  const collectVisi = ref(false);

  // 表单
  const generateFormModel = () => {
    return {
      name: undefined,
      title: undefined,
      type: undefined,
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
  const ViewApi = async (pk: number, type: string) => {
    operateRow.value = pk;
    drawerTitle.value = t('查看');
    await fetchApiDetail(pk);
    openView.value = true;
    // router.push({name: 'DocDetail', params: { id: pk }});
  };
  const DeleteApi = () => {
    drawerTitle.value = t('data.doc.columns.delete.drawer');
    openDelete.value = true;
  };
  const HideApi = (pk: number) => {
    renderData.value = renderData.value.filter((item) => {
      return item.id !== pk;
    });
  };
  const columns = computed<TableColumnData[]>(() => [
    // {
    //   title: 'ID',
    //   dataIndex: 'id',
    //   slotName: 'id',
    //   sortable: {
    //     sortDirections: ['ascend', 'descend'],
    //   },
    //   ellipsis: true,
    //   tooltip: true,
    //   width: 100,
    // },
    {
      title: t('data.doc.columns.name'),
      dataIndex: 'name',
      slotName: 'name',
      ellipsis: true,
    },
    {
      title: t('data.doc.columns.isCollection'),
      dataIndex: 'isCollection',
      slotName: 'isCollection',
      ellipsis: true,
    },
    {
      title: t('data.doc.columns.OriginName'),
      dataIndex: 'OriginName',
      slotName: 'OriginName',
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
      title: t('data.doc.columns.uploadtime'),
      dataIndex: 'created_time',
      slotName: 'created_time',
      sortable: {
        sortDirections: ['ascend', 'descend'],
      },
      width: 180,
    },
    {
      title: t('data.doc.columns.createdtime'),
      dataIndex: 'created_time',
      slotName: 'created_time',
      sortable: {
        sortDirections: ['ascend', 'descend'],
      },
      width: 180,
    },
    {
      title: t('data.doc.columns.type'),
      dataIndex: 'desc',
      slotName: 'desc',
      ellipsis: true,
      tooltip: true,
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
    file: undefined,
    content: undefined,
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
        await fetchApiList({ page: 1, size: pagination.pageSize });
      } else {
        await updateSysDoc(operateRow.value, form);
        cancelReq();
        Message.success(t('submit.update.success'));
        await fetchApiList({ page: 1, size: pagination.pageSize });
      }
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
      await deleteSysDoc({ pk: rowSelectKeys.value });
      cancelReq();
      Message.success(t('submit.execute.success'));
      rowSelectKeys.value = [];
    } catch (error) {
      Message.success(t('submit.execute.fail'));
    } finally {
      setLoading(false);
    }
  };

  // ip提取按钮
  const submitExtractIPAddress = async () => {
    setLoading(true);
    try {
      console.log(rowSelectKeys.value);

      await extractIPAddress(rowSelectKeys.value);
      cancelReq();
      Message.success(t('submit.execute.success'));
      rowSelectKeys.value = [];
    } catch (error) {
      Message.warning(t('submit.execute.fail'));
    } finally {
      setLoading(false);
    }
  };

  // 用户名账号提取按钮
  const submitExtractUsercount = async () => {
    setLoading(true);
    try {
      await extractUserCount(rowSelectKeys.value);
      cancelReq();
      Message.success(t('submit.execute.success'));
      rowSelectKeys.value = [];
    } catch (error) {
      Message.warning(t('submit.execute.fail'));
    } finally {
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

  fetchApiList({ page: 1, size: pagination.pageSize });

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
    await fetchApiList({ page: current, size: pagination.pageSize });
  };

  // 事件: 分页大小
  const onPageSizeChange = async (pageSize: number) => {
    pagination.pageSize = pageSize;
    await fetchApiList({ page: 1, size: pageSize });
  };

  // 搜索
  const search = async () => {
    await fetchApiList({
      ...formModel.value,
    } as unknown as SysDocParams);
  };

  // 重置
  const resetSelect = () => {
    formModel.value = generateFormModel();
  };

  // 重置方法
  const resetMethod = () => {};

  // 重置表单
  const resetForm = (data: Record<any, any>) => {
    Object.keys(data).forEach((key) => {
      // @ts-ignore
      form[key] = data[key];
    });
  };

  // 日期范围选择器钩子函数
  const onChangeRangePicker = () => {
    console.log('onChangeRangePicker');
  };

  const onSelectRangePicker = () => {
    console.log('onSelectRangePicker');
  };

  const handleOk = () => {
    console.log('handleok')
  }

  const handleCancel = () => {
    console.log('handleCancel')
  }
</script>

<script lang="ts">
  export default {
    name: 'AllTable',
  };
</script>

<style lang="less" scoped>
  .content {
    padding-top: 20px;
  }
  .title-link {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    display: block;
  }
  .info-card {
    border-radius: 20px;
    border-bottom-width: 2px;

    & > .arco-card-header {
      height: auto;
      padding: 20px;
      border: none;
    }

    & > .arco-card-body {
      padding: 0 20px 20px 20px;
    }
  }
</style>
