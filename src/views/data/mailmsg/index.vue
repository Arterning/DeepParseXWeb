<template>
  <a-layout class="flex-layout">
    <div class="general-card">
      <a-row>
        <a-col :flex="62">
          <a-form
            :auto-label-width="true"
            :model="formModel"
            label-align="right"
          >
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item field="name" label="标题">
                  <a-input
                    v-model="formModel.name"
                    :placeholder="$t('搜索标题')"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item :label="$t('主题')" field="title">
                  <a-input
                    v-model="formModel.subject"
                    :placeholder="$t('搜索主题')"
                    @keyup.enter="search"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item :label="$t('发件人')" field="sender">
                  <a-input
                    v-model="formModel.sender"
                    :placeholder="$t('搜索发件人')"
                    @keyup.enter="search"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item :label="$t('收件人')" field="receiver">
                  <a-input
                    v-model="formModel.receiver"
                    :placeholder="$t('搜索收件人')"
                    @keyup.enter="search"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item :label="$t('抄送人')" field="cc">
                  <a-input
                    v-model="formModel.cc"
                    :placeholder="$t('搜索抄送人')"
                    @keyup.enter="search"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item :label="$t('时间')" field="time">
                  <a-date-picker
                    v-model="formModel.time"
                    :placeholder="$t('搜索时间')"
                    @keyup.enter="search"
                    class="w-full"
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
      <a-divider class="mt-0" />
      <a-space :size="'medium'" class="flex justify-between">
        <a-space>
          <a-button type="primary" @click="openNew=true">
            <template #icon>
              <icon-plus />
            </template>
            新增
          </a-button>
          <a-button type="outline" @click="openTask=true">
            <template #icon>
              <icon-list />
            </template>
            任务
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
        <a-space>
          
          <a-tooltip content="目录">
            <a-button type="text" @click="openDirectory=true">
              <template #icon>
                <icon-folder />
              </template>
            </a-button> 
          </a-tooltip>
          <a-tooltip content="切换视图">
            <a-button type="text" @click="viewType=!viewType">
              <template #icon>
                <icon-swap />
              </template>
            </a-button> 
          </a-tooltip>
      
        </a-space>
      </a-space>
      <div class="content">
        <div
          v-if="loading"
          class="w-full h-96 flex justify-center items-center"
        >
          <a-spin :size="32" />
        </div>
        <div v-else>

          <template v-if="viewType">
            <div class="grid grid-cols-2 gap-4" >
              <div
                v-for="record in renderData"
                :key="record.id"
                class="flex items-start p-4 border rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200"
                :class="{
                  'border-blue-500 ring-1 ring-blue-500': rowSelectKeys.includes(
                    record.id
                  ),
                }"
              >
                <div class="mr-4 pt-1">
                  <a-checkbox
                    :model-value="rowSelectKeys.includes(record.id)"
                    @change="() => toggleSelection(record.id)"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-center mb-2">
                    <div
                      class="flex-1 text-lg font-semibold truncate hover:text-blue-600 cursor-pointer"
                      :title="record.name"
                      @click="
                        router.push({
                          name: 'MailMsgDetail',
                          params: { id: record.id },
                          query: { appendix: record.name },
                        })
                      "
                    >
                      {{ record.name }}
                    </div>
                    <span class="text-sm text-gray-500 flex-shrink-0 ml-4">{{
                      tableDateFormat(record.time)
                    }}</span>
                  </div>

                  <div
                    class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 mb-3"
                  >
                    <div class="flex items-center">
                      <span class="font-medium text-gray-500">From:</span>
                      <span
                        class="ml-1.5 text-gray-500 px-2 py-0.5 rounded-full"
                        >{{ record.sender }}</span
                      >
                    </div>
                    <div class="flex items-center">
                      <span class="font-medium text-gray-500">To:</span>
                      <span
                        class="ml-1.5 text-gray-500 px-2 py-0.5 rounded-full"
                        >{{ record.receiver }}</span
                      >
                    </div>
                    <div v-if="record.cc" class="flex items-center">
                      <span class="font-medium text-gray-500">CC:</span>
                      <span
                        class="ml-1.5 text-gray-500 px-2 py-0.5 rounded-full"
                        >{{ record.cc }}</span
                      >
                    </div>
                  </div>

                  <p
                    class="text-gray-600 text-sm truncate mb-4"
                    :title="record.content"
                  >
                    {{ record.content || 'No content to display.' }}
                  </p>

                  <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-2">
                      <a-tag v-if="record.category" color="arcoblue">{{
                        record.category
                      }}</a-tag>
                      <span
                        v-if="record.location"
                        class="text-xs text-gray-400 flex items-center"
                      >
                        <icon-location /> {{ record.location }}
                      </span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <a-button size="mini" @click="EditMailMsg(record.id)">
                        编辑
                      </a-button>
                      <a-button
                        size="mini"
                        type="primary"
                        @click="
                          router.push({
                            name: 'MailMsgDetail',
                            params: { id: record.id },
                            query: { appendix: record.name },
                          })
                        "
                      >
                        查看
                      </a-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              v-if="!loading && renderData.length === 0"
              class="text-center py-16"
            >
              <a-empty />
            </div>
            <div
              v-if="renderData.length > 0"
              class="flex justify-end items-center mt-4"
            >
              <a-pagination
                :total="pagination.total || 0"
                :current="pagination.current"
                :page-size="pagination.pageSize"
                show-total
                show-page-size
                @change="onPageChange"
                @page-size-change="onPageSizeChange"
              />
            </div>            
          </template>

          <a-table v-else v-model:selected-keys="rowSelectKeys" :bordered="false" :columns="columns" :data="renderData"
            :loading="loading" :pagination="pagination" :row-selection="rowSelection" row-key="id"
            @page-change="onPageChange" @page-size-change="onPageSizeChange">
            <!-- <template #index="{ rowIndex }">
              {{ rowIndex + 1 }}
            </template> -->
            <!-- <template #files="{ record }">
              <a-space>
                {{ record.success }} / {{ record.fail }} / {{ record.total }}
              </a-space>
            </template> -->
            <template #abstract="{ record }">
              {{ record.content.slice(0, 15) }}
            </template>
            <template #time="{ record }">
              {{ tableDateFormat(record.time) }}
            </template>
            <template #operate="{ record }">
              <a-space>
                <a-tooltip content="编辑">
                  <a-link @click="EditMailMsg(record.id)">
                    <icon-edit style="font-size:16" />
                  </a-link>
                </a-tooltip>
                <a-tooltip content="查看">
                  <a-link @click="
                    router.push({
                      name: 'MailMsgDetail',
                      params: { id: record.id },
                      query: { appendix: record.name },
                    })
                  ">
                    <icon-eye style="font-size:16" />
                  </a-link>
                </a-tooltip>
              </a-space>
            </template>
          </a-table>        
        </div>
      </div>
      <div class="content-modal">
        <UploadModal v-model:open="openNew" @open-task-drawer="openTask = true" @refresh-task-drawer="refreshTaskDrawer" />
        <a-modal
          :closable="false"
          :on-before-ok="beforeSubmit"
          :title="drawerTitle"
          :visible="openEdit"
          :width="550"
          @cancel="cancelReq"
          @ok="submitEdit"
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
              <a-select v-model="form.category" :placeholder="$t('请选择类型')">
                <a-option
                  v-for="(item, index) in ['工作', '个人', '通知', '其他']"
                  :key="index"
                  :value="item"
                >
                  {{ item }}
                </a-option>
              </a-select>
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
      <TaskDrawer v-model:open="openTask" :refresh-trigger="taskRefreshTrigger" />
      <DirectoryDrawer v-model:open="openDirectory" />
    </div>
  </a-layout>
</template>

<script lang="ts" setup>
  import { Message, SelectOptionData, TableColumnData } from '@arco-design/web-vue';
  import { useI18n } from 'vue-i18n';
  import { computed, reactive, ref } from 'vue';
  import useLoading from '@/hooks/loading';
  import UploadModal from './upload-modal.vue';
  import TaskDrawer from './task-drawer.vue';
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
  import { useRouter } from 'vue-router';
  import DirectoryDrawer from './directory-drawer.vue';
  import { tableDateFormat } from '@/utils/date';

  const { t } = useI18n();
  const { loading, setLoading } = useLoading(true);
  const router = useRouter();
  const viewType = ref(true);

  // 表单
  const generateFormModel = () => {
    return {
      name: undefined,
      subject: undefined,
      category: undefined,
      email_subject: undefined,
      sender: undefined,
      receiver: undefined,
      cc: undefined,
      time: undefined,
    };
  };
  const formModel = ref(generateFormModel());
  // 表格
  const renderData = ref<MailMsgRes[]>([]);
  const operateRow = ref<number>(0);
  const rowSelectKeys = ref<number[]>([]);
  const rowSelection = {
    type: 'checkbox' as 'checkbox' | 'radio' | undefined,
    showCheckedAll: true,
    onlyCurrent: false,
  };

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
      width: 50,
    },
    {
      title: '邮件主题',
      dataIndex: 'name',
      ellipsis: true,
      tooltip: true
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
      title: '摘要',
      slotName: 'abstract',
      // width: 150
    },
    {
      title: '日期',
      slotName: 'time',
      width: 170,
      sortable: {
        sortDirections: ['ascend', 'descend']
      }
    },
    // {
    //   title: '关键字',
    //   slotName: 'keywords',
    //   // width: 120
    // },
    {
      title: '发件人',
      dataIndex: 'sender',
      ellipsis: true,
      tooltip: true,
      width: 120
    },
    {
      title: '收件人',
      dataIndex: 'receiver',
      ellipsis: true,
      tooltip: true,
      width: 120
    },
    {
      title: '标签',
      dataIndex: 'cc',
      ellipsis: true,
      tooltip: true,
      width: 180
    },
    {
      title: '操作',
      dataIndex: 'operate',
      slotName: 'operate',
      align: 'center',
      fixed: 'right',
      width: 100,
    },
  ]);

  const EditMailMsg = async (pk: number) => {
    buttonStatus.value = 'edit';
    operateRow.value = pk;
    drawerTitle.value = t('编辑');
    await fetchMailMsgDetail(pk);
    openEdit.value = true;
  };
  const DeleteMailMsg = () => {
    drawerTitle.value = t('删除');
    openDelete.value = true;
  };

  const toggleSelection = (id: number) => {
    const index = rowSelectKeys.value.indexOf(id);
    if (index > -1) {
      rowSelectKeys.value.splice(index, 1);
    } else {
      rowSelectKeys.value.push(id);
    }
  };

  const openTask = ref<boolean>(false);
  const taskRefreshTrigger = ref<number>(0);
  const openDirectory = ref<boolean>(false);
  
  // 刷新任务抽屉数据
  const refreshTaskDrawer = () => {
    taskRefreshTrigger.value += 1;
  };
  // 对话框
  const openNew = ref<boolean>(false);
  const openEdit = ref<boolean>(false);
  const openDelete = ref<boolean>(false);
  const drawerTitle = ref<string>('');
  const cancelReq = () => {
    openEdit.value = false;
    openDelete.value = false;
  };
  const formDefaultValues: MailMsgReq = {
    name: '',
    original: '',
    content: '',
    time: new Date(),
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
  const submitEdit = async () => {
    setLoading(true);
    try {
      if (buttonStatus.value === 'new') {
        await createMailMsg(form);
        cancelReq();
        Message.success(t('submit.create.success'));
        await fetchData();
      } else {
        await updateMailMsg(operateRow.value, form);
        cancelReq();
        Message.success(t('submit.update.success'));
        await fetchData();
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

  // 提交按钮
  const submitDelete = async () => {
    setLoading(true);
    try {
      await deleteMailMsg({ pk: rowSelectKeys.value });
      cancelReq();
      Message.success(t('submit.delete.success'));
      await fetchData();
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
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await queryMailMsgList({
        ...formModel.value,
        page: pagination.current,
        size: pagination.pageSize,
      } as MailMsgParams);
      renderData.value = res.items;
      pagination.total = res.total;
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };

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
  const onPageChange = (current: number) => {
    console.log('current', current);
    pagination.current = current;
    fetchData();
  };

  // 事件: 分页大小
  const onPageSizeChange = (pageSize: number) => {
    pagination.current = 1;
    pagination.pageSize = pageSize;
    fetchData();
  };

  // 搜索
  const search = () => {
    pagination.current = 1;
    fetchData();
  };

  fetchData();

  // 重置
  const resetSelect = () => {
    formModel.value = generateFormModel();
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
