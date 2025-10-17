<template>
  <div class="content">
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
                  class="w-full"
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
    <a-divider class="mt-0" />
    <a-space class="flex justify-between">
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
        <a-button type="text" @click="openDir=true">
          <template #icon><icon-folder /></template>
          {{ dirSelect?dirSelect.name:'/' }}
        </a-button>
      </a-space>
      <a-space>
        <SettingTable
          v-show="isTableView"
          :columns="columns"
          :storage-key="storageKey"
          @update-columns="updateVisibleColumns"
        />
        <a-tooltip content="切换视图">
          <a-button type="text" @click="isTableView = !isTableView">
            <template #icon>
              <icon-swap />
            </template>
          </a-button>
        </a-tooltip>
      </a-space>   
    </a-space>

    <div class="mt-5">
      <div
        v-if="loading"
        class="w-full h-96 flex justify-center items-center"
      >
        <a-spin size="large" />
      </div>
      <div v-else>
        <template v-if="isTableView">
          <a-table
            v-model:selected-keys="rowSelectKeys"
            :bordered="false"
            column-resizable
            :columns="visibleColumns"
            :data="renderData"
            :loading="loading"
            :pagination="pagination"
            :row-selection="rowSelection"
            row-key="id"
            @page-change="onPageChange"
            @page-size-change="onPageSizeChange"
          >
            <!-- <template #index="{ rowIndex }">
              {{ rowIndex + 1 }}
            </template> -->
            <template #name="{ record }">
              <a-tooltip :content="record.name">
                <a-link
                  class="truncate block"
                  @click="ViewApi(record.id, record.name)"
                  >{{ record.name }}
                </a-link>
              </a-tooltip>              
            </template>
            <template #original="{record}">
              <!-- HTML 内容 - 显示"网页元素"链接和 Popover 预览 -->
              <a-popover
                v-if="isHtmlContent(record.original)"
                position="right"
                :content-style="{ padding: 0, width: '400px', height: '300px' }"
              >
                <a-link>
                  <icon-file-image class="mr-1" />
                  网页元素
                </a-link>
                <template #content>
                  <div class="html-preview-container">
                    <div class="html-preview-header">
                      <span class="text-sm text-gray-500">预览</span>
                    </div>
                    <iframe
                      :srcdoc="record.original"
                      class="html-preview-iframe"
                      sandbox="allow-same-origin"
                    />
                  </div>
                </template>
              </a-popover>
              <!-- 普通文本内容 -->
              <p
                v-else
                class="truncate"
                :title="record.original"
              >
                {{ record.original || 'No content to display.' }}
              </p>
            </template>
            <template #receiver="{ record }">
              <template v-if="record.receiver.replace(/\s+/g, '').split(',').length===1">
                <a-tooltip :content="record.receiver">
                  <a-link class="block truncate" @click="goMailBox(record.receiver)">
                    {{ record.receiver }}
                  </a-link>                
                </a-tooltip>                
              </template>
              <template v-else>
                <a-popover title="收件人列表">
                  <div class="truncate">
                    {{ record.receiver }}
                  </div> 
                  <template #content>
                    <a-link v-for="item in record.receiver.replace(/\s+/g, '').split(',')" class="block" @click="goMailBox(item)">
                      {{ item }}
                    </a-link>  
                  </template>
                </a-popover>
              </template>

            </template>
            <template #sender="{ record }">
              <a-tooltip :content="record.sender">
                <a-link class="block truncate" @click="goMailBox(record.sender)">
                  {{ record.sender }}
                </a-link>                
              </a-tooltip>
            </template>
            <template #time="{ record }">
              {{ tableDateFormat(record.time) }}
            </template>
            <template #operate="{ record }">
              <a-space>
                <a-tooltip content="编辑">
                  <a-link @click="EditMailMsg(record.id)">
                    <icon-edit style="font-size: 16" />
                  </a-link>
                </a-tooltip>
                <a-tooltip content="查看">
                  <a-link @click="ViewApi(record.id, record.name)">
                    <icon-unordered-list style="font-size: 16" />
                  </a-link>
                </a-tooltip>
                <!-- 取消收藏 -->
                <a-tooltip v-if="record.is_collected" content="取消收藏">
                  <a-link @click="handleUnCollect(record.doc_id)">
                    <icon-star-fill style="font-size: 16" />
                  </a-link>
                </a-tooltip>
                <!-- 收藏 -->
                <a-tooltip v-else content="收藏">
                  <a-link @click="CollectionApi(record.doc_id)">
                    <icon-star style="font-size: 16" />
                  </a-link>
                </a-tooltip>
              </a-space>
            </template>
          </a-table>
        </template>
        <template v-else>
          <div class="grid grid-cols-2 gap-4">
            <a-card
              v-for="record in renderData"
              :key="record.id"
              class="doc-card rounded-lg hover:shadow-lg transition-all duration-300"
              :class="{
                'border-blue-500 ring-1 ring-blue-500': rowSelectKeys.includes(
                  record.id
                ),
              }"
            >
              <div class="flex flex-col min-w-0">
                <div class="flex justify-between items-center mb-1">
                  <div class="mr-2 pt-0.5">
                    <a-checkbox
                      :model-value="rowSelectKeys.includes(record.id)"
                      @change="() => toggleSelection(record.id)"
                    />
                  </div>
                  <a-link
                    class="flex-1 text-lg font-semibold truncate block"
                    :title="record.name"
                    @click="ViewApi(record.id, record.name)"
                  >
                    {{ record.name }}
                  </a-link>
                  
                  <!-- <a-tooltip :content="record.attachments.length?`${record.attachments.length}个附件`:'没有附件'">
                    <a-badge :count="3" dot>
                      <icon-attachment />
                    </a-badge>
                  </a-tooltip> -->
                  
                  <span class="text-sm text-gray-500 flex-shrink-0 ml-4">{{
                    tableDateFormat(record.time) 
                  }}</span>
                </div>
                <span
                  v-if="record.doc_name"
                  class="text-xs text-gray-400 flex items-center px-1 mb-1.5"
                >
                  <icon-location /> {{ record.doc_name }}
                </span>

                <div
                  class="flex flex-wrap items-center px-1 gap-x-4 gap-y-1 text-sm text-gray-600 mb-2"
                >
                  <div class="flex items-center">
                    <span class="font-medium text-gray-500">From:</span>
                    <a-tag
                      class="cursor-pointer ml-1.5 text-gray-500 px-2 py-0.5 rounded-full"
                      @click="goMailBox(record.sender)"
                      >{{ record.sender }}</a-tag
                    >
                  </div>
                  <div class="flex items-center flex-wrap">
                    <span class="font-medium text-gray-500">To:</span>
                    
                    <a-tag
                      v-for="item in record.receiver.replace(/\s+/g, '').split(',')"
                      class="cursor-pointer ml-1.5 text-gray-500 px-2 py-0.5 rounded-full"
                      @click="goMailBox(item)"
                      >{{ item }}</a-tag
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

                <div class="text-gray-600 text-sm px-1 mb-2">
                  <!-- HTML 内容 - 显示"网页元素"链接和 Popover 预览 -->
                  <a-popover
                    v-if="isHtmlContent(record.original)"
                    position="right"
                    :content-style="{ padding: 0, width: '400px', height: '300px' }"
                  >
                    <a-link class="text-sm">
                      <icon-file-image class="mr-1" />
                      网页元素
                    </a-link>
                    <template #content>
                      <div class="html-preview-container">
                        <div class="html-preview-header">
                          <span class="text-sm text-gray-500">预览</span>
                        </div>
                        <iframe
                          :srcdoc="record.original"
                          class="html-preview-iframe"
                          sandbox="allow-same-origin"
                        />
                      </div>
                    </template>
                  </a-popover>
                  <!-- 普通文本内容 -->
                  <p
                    v-else
                    class="truncate"
                    :title="record.original"
                  >
                    {{ record.original || 'No content to display.' }}
                  </p>
                </div>

                <div class="text-gray-600 text-sm mb-2">
                  <icon-attachment class="mr-2"/>{{record.attachments.length}}个附件
                </div>

                <div class="flex justify-between items-center">
                  <div class="flex items-center space-x-2">
                    <a-tag v-if="record.category" color="arcoblue">{{
                      record.category
                    }}</a-tag>
                  </div>
                  <a-space>
                    <a-tooltip content="修改">
                      <a-link @click="EditMailMsg(record.id)">
                        <icon-edit />
                      </a-link>
                    </a-tooltip>
                    <a-tooltip v-if="record.is_collected" content="取消收藏">
                      <a-link @click="handleUnCollect(record.doc_id)">
                        <icon-star-fill style="font-size: 16" />
                      </a-link>
                    </a-tooltip>
                    <a-tooltip v-else content="收藏">
                      <a-link @click="CollectionApi(record.doc_id)">
                        <icon-star />
                      </a-link>
                    </a-tooltip>
                  </a-space>
                </div>
              </div>
            </a-card>
          </div>
          <div
            v-if="!loading && renderData.length === 0"
            class="text-center py-16"
          >
            <a-empty />
          </div>

          <div
            v-if="renderData.length > 0"
            class="flex justify-center mt-4"
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
      </div>
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
          <a-form-item :label="$t('标签')" field="tags">
            <a-space wrap class="mt-1">
              <a-tag
                v-for="(tag, index) of form.tags"
                :key="index"
                :closable="index >= 0"
                @close="handleRemove(tag)"
              >
                {{ tag }}
              </a-tag>

              <a-input
                v-if="showInput"
                ref="inputRef"
                v-model.trim="inputVal"
                :style="{ width: '90px' }"
                size="mini"
                @keyup.enter="handleAdd"
                @blur="handleAdd"
              />
              <a-tag
                v-else
                :style="{
                  width: '90px',
                  backgroundColor: 'var(--color-fill-2)',
                  border: '1px dashed var(--color-fill-3)',
                  cursor: 'pointer',
                }"
                @click="handleEdit"
              >
                <template #icon>
                  <icon-plus />
                </template>
                添加标签
              </a-tag>
            </a-space>
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
        :visible="collectView"
        @ok="handleCollectOk"
        @cancel="handleCollectCancel"
      >
        <template #title> 选择收藏位置 </template>
        <div>
          <a-select
            v-model="collectionSelect"
            :style="{ width: '100%', marginBottom: '15px' }"
            placeholder="请选择需要保存的收藏夹"
          >
            <a-option
              v-for="item of collectionOptions"
              :key="item.value"
              :value="item.value"
              >{{ item.label }}
            </a-option>
          </a-select>
          <a-button
            style="width: 100%"
            @click="router.push({ name: 'Collection' })"
          >
            <div> 新建收藏夹 </div>
            <div>
              <icon-plus />
            </div>
          </a-button>
        </div>
        <!-- <template #footer>
          <a-button type="primary" style="width: 100%;" @ok="handleOk">收藏</a-button>
        </template> -->
      </a-modal>
    </div>
    <DirectoryDrawer v-model:open="openDir" :refresh-trigger="dirSelect?.id" 
    @directory-change="(item:any)=>{ dirSelect = item; fetchData()}"/>
  </div>
</template>

<script lang="ts" setup>
  import { Message, SelectOptionData, TableColumnData } from '@arco-design/web-vue';
  import { useI18n } from 'vue-i18n';
  import { computed, nextTick, onMounted, reactive, ref } from 'vue';
  import useLoading from '@/hooks/loading';
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
  import { tableDateFormat } from '@/utils/date';
  import DirectoryDrawer from './directory-drawer.vue';
  import SettingTable from '@/components/setting-table/index.vue';
  import { isHtmlContent } from '@/utils/doc';
  import { queryStarCollectionList, StarCollectionRes } from '@/api/starCollection';
  import { collectDoc, querySysDocDetail, SysDocRes, updateSysDoc } from '@/api/doc';
import { queryMailBoxDetailByName } from '@/api/mailbox';
  
  const { t } = useI18n();
  const { loading, setLoading } = useLoading(true);
  const router = useRouter();

  const openDir = ref(false);
  const dirSelect = ref<any>(null);

  const storageKey = 'docTable';

  // 列表展示
  const visibleColumns = ref<TableColumnData[]>([]);

  const updateVisibleColumns = (selectedColumns: string[]) => {
    visibleColumns.value = columns.value.filter((column) => {
      return column.dataIndex && selectedColumns.includes(column.dataIndex);
    });
  };

  onMounted(() => {
    const savedColumns = localStorage.getItem(storageKey);
    if (savedColumns) {
      updateVisibleColumns(JSON.parse(savedColumns));
    } else {
      visibleColumns.value = columns.value; // 默认全部显示
    }
  });

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
  const isTableView = ref(false);
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
    pageSize: 10,
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
  const ViewApi = async (pk: number, title: string) => {
    // operateRow.value = pk;
    // drawerTitle.value = t('查看');
    // await fetchApiDetail(pk);
    // openView.value = true;
    router.push({
      name: 'MailMsgDetail',
      params: { id: pk },
      query: { appendix: title, category: 'doc' },
    })
  };
  const goMailBox = async (name: string) => {
    const { id } = await queryMailBoxDetailByName(name);
    router.push({
      name: 'MailBoxDetail',
      params: { id },
      query: { appendix: name, category: 'email' },
    })
  }

  const toggleSelection = (id: number) => {
    const index = rowSelectKeys.value.indexOf(id);
    if (index > -1) {
      rowSelectKeys.value.splice(index, 1);
    } else {
      rowSelectKeys.value.push(id);
    }
  };

  const columns = computed<TableColumnData[]>(() => [
    {
      title: 'ID',
      dataIndex: 'id',
      sortable: {
        sortDirections: ['ascend', 'descend']
      },
      width: 80,
      ellipsis: true,
      tooltip: true
    },
    {
      title: '邮件主题',
      dataIndex: 'name',
      slotName: 'name',
      width:200,
      ellipsis: true,
      tooltip: true
    },
    {
      title: '邮件摘要',
      dataIndex: 'original',
      slotName: 'original',
      ellipsis: true,
    },
    {
      title: '关键字',
      dataIndex: 'cc',
      slotName: 'cc',
      ellipsis: true,
      tooltip: true,
      width: 100,
    },
    {
      title: '收件人',
      dataIndex: 'receiver',
      slotName: 'receiver',
      ellipsis: true,
      tooltip: true,
      width: 120,
    },
    {
      title: '发件人',
      dataIndex: 'sender',
      slotName: 'sender',
      ellipsis: true,
      tooltip: true,
      width: 120,
    },
    {
      title: '附件数量',
      dataIndex: 'attachCount',
      sortable: {
        sortDirections: ['ascend', 'descend'],
      },
      width: 110,
    },
    {
      title: '日期',
      dataIndex: 'time',
      slotName: 'time',
      sortable: {
        sortDirections: ['ascend', 'descend'],
      },
      width: 160,
      ellipsis: true,
      tooltip: true,
    },
    {
      title: t('data.doc.columns.operate'),
      dataIndex: 'operate',
      slotName: 'operate',
      width: 100,
      align: 'center',
      fixed: 'right',
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
  const formDefaultValues: any = {
    name: '',
    original: '',
    zh_content: '',
    zh_subject: '',
    subject: '',
    time: new Date(),
    category: '',
    sender: '',
    receiver: '',
    cc: '',
    tags: [],
  };
  const form = reactive<any>({ ...formDefaultValues });
  const buttonStatus = ref<string>();
  const formRef = ref();
  let edit_doc = {} as SysDocRes; //TODO 被编辑的邮件->文件信息副本【屎山】

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
        await fetchData();
      } else { 
        if(edit_doc.id){ //TODO 先更新更新文件标签【屎山】
          edit_doc.tags = form.tags;
          await updateSysDoc(edit_doc.id, edit_doc);
        }
        await updateMailMsg(operateRow.value, form); //TODO 之后提交邮件的更新
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

  // 删除按钮
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
        doc_dir_id: dirSelect.value?.id,
        page: pagination.current,
        size: pagination.pageSize,
      } as MailMsgParams);
      renderData.value = res.items;
      renderData.value.map((e:any)=>{
        e.attachCount = e.attachments.length
      })
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
      edit_doc = await querySysDocDetail(res.doc_id);//TODO 没返回tags，单独获取【屎山】
      resetForm(res);
      form.tags = edit_doc.tags.map((item: Record<any, any>) => item.name);//TODO【屎山】
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // 事件: 分页
  const onPageChange = (current: number) => {
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

  const inputRef = ref<HTMLInputElement>();
  const showInput = ref(false);
  const inputVal = ref('');

  const handleRemove = (key: string) => {
    form.tags = form.tags.filter((tag) => tag !== key);
  };

  const handleEdit = () => {
    showInput.value = true;

    nextTick(() => {
      if (inputRef.value) {
        inputRef.value.focus();
      }
    });
  };

  const handleAdd = () => {
    if (inputVal.value) {
      form.tags.push(inputVal.value);
      inputVal.value = '';
    }
    showInput.value = false;
  };


  const collectView = ref(false);
  const collectionSelect = ref();
  const collections = ref<StarCollectionRes[]>([]);
  const collectionOptions = computed(() => {
    return collections.value.map((item) => {
      return {
        value: item.id,
        label: item.name,
      };
    });
  });
  const CollectionApi = async (pk: number) => {
    operateRow.value = pk;
    collectView.value = true;
    const res = await queryStarCollectionList({});
    collections.value = res.items;
  };
  const handleCollectOk = async () => {
    if (!collectionSelect.value) {
      Message.error('请选择收藏夹');
      return;
    }
    await collectDoc({
      doc_id: operateRow.value,
      collection_id: collectionSelect.value,
    });
    collectView.value = false;
    await fetchData();
    Message.success('收藏成功');
  };
  const handleUnCollect = async (id: number) => {
    await collectDoc({ doc_id: id });
    collectView.value = false;
    await fetchData();
    Message.success('操作成功');
  };

  const handleCollectCancel = () => {
    collectView.value = false;
  };
</script>

<script lang="ts">
  export default {
    name: 'MailMsg',
  };
</script>

<style scoped>
.html-preview-container {
  width: 100%;
  height: 300px;
  display: flex;
  flex-direction: column;
}

.html-preview-header {
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.html-preview-iframe {
  flex: 1;
  border: none;
  background: white;
  /* 缩小显示效果 */
  /* transform: scale(0.8); */
  transform-origin: top left;
  /* width: 125%; */
  height: 300px; 
}
</style>