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
            <a-form-item :label="$t('data.doc.form.title')" field="title">
              <a-input
                v-model="formModel.title"
                :placeholder="$t('输入文件原名')"
                @keyup.enter="search"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="$t('data.doc.form.name')" field="name">
              <a-input
                v-model="formModel.name"
                :placeholder="$t('data.doc.form.name.placeholder')"
                @keyup.enter="search"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="$t('data.doc.form.type')" field="type">
              <a-select
                v-model="formModel.doc_type"
                :placeholder="$t('请选择类型')"
                :allow-clear="false"
              >
                <a-option
                  v-for="(item, index) in [
                    '文本',
                    'PDF',
                    '表格',
                    '图片',
                    '媒体',
                    'PPT',
                    '文档',
                  ]"
                  :key="index"
                  :value="item"
                >
                  {{ item }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="$t('来源搜索')" field="source">
              <a-input
                v-model="formModel.source"
                :placeholder="$t('输入文件来源')"
                @keyup.enter="search"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="$t('时间搜索')" field="rangeValue">
              <a-range-picker
                v-model="formModel.rangeValue"
                class="w-full"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="$t('内容搜索')" field="content">
              <a-input
                v-model="formModel.content"
                :placeholder="$t('内容搜索')"
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
    <a-button type="primary" size="small" @click="NewApi()">
      <template #icon>
        <icon-plus />
      </template>
      {{ $t('data.doc.button.create') }}
    </a-button>
    <a-button
      :disabled="deleteButtonStatus()"
      status="danger"
      size="small"
      @click="DeleteApi"
    >
      <template #icon>
        <icon-minus />
      </template>
      {{ $t('data.doc.button.delete') }}
    </a-button>
    <SettingTable
      :columns="columns"
      :storage-key="storageKey"
      @update-columns="updateVisibleColumns"
    />
    <a-radio-group v-model="viewMode" size="small">
      <a-radio value="table">
        <template #radio="{ checked }">
          <a-space :size="4">
            <icon-list
              :style="{ color: checked ? 'rgb(var(--primary-6))' : '' }"
            />
            <span v-if="checked">表格</span>
          </a-space>
        </template>
      </a-radio>
      <a-radio value="card">
        <template #radio="{ checked }">
          <a-space :size="4">
            <icon-apps
              :style="{ color: checked ? 'rgb(var(--primary-6))' : '' }"
            />
            <span v-if="checked">卡片</span>
          </a-space>
        </template>
      </a-radio>
    </a-radio-group>
  </a-space>

  <div class="mt-5">
    <a-table
      v-if="viewMode === 'table'"
      v-model:selected-keys="rowSelectKeys"
      :bordered="false"
      column-resizable
      :columns="visibleColumns"
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
      <template #title="{ record }">
        <span
          class="cursor-pointer"
          @click="
            router.push({
              name: 'DocDetail',
              params: {
                id: record.id,
              },
              query: {
                appendix: record.name,
              },
            })
          "
          >{{ record.title }}
        </span>
      </template>

      <template #size="{ record }">
        {{ formatFileSize(record.size) }}
      </template>

      <template #type="{ record }">
        <component :is="getSvgByType(record.type)" class="w-10 h-10" />
      </template>
      <template #created_time="{ record }">
        {{ tableDateFormat(record.created_time) }}
      </template>
      <template #doc_time="{ record }">
        {{ tableDateFormat(record.doc_time) }}
      </template>
      <!-- status -->
      <template #status="{ record }">
        <a-tag v-if="record.status === 0" :color="`orange`" bordered>
          {{ $t(`处理中`) }}
        </a-tag>
        <a-tag v-if="record.status === 1" :color="`green`" bordered>
          {{ $t(`admin.menu.form.status.${record.status}`) }}
        </a-tag>
        <a-tag v-else :color="`red`" bordered>
          {{ $t(`解析失败`) }}
        </a-tag>
      </template>
      <template #operate="{ record }">
        <a-space>
          <a-tooltip content="修改">
            <a-link @click="EditApi(record.id)">
              <icon-edit style="font-size: 16" />
            </a-link>
          </a-tooltip>
          <a-tooltip content="查看">
            <a-link @click="ViewApi(record.id, record.title)">
              <icon-unordered-list style="font-size: 16" />
            </a-link>
          </a-tooltip>
          <!-- 取消收藏 -->
          <a-tooltip v-if="record.is_collected" content="取消收藏">
            <a-link @click="handleUnCollect(record.id)">
              <icon-star-fill style="font-size: 16" />
            </a-link>
          </a-tooltip>
          <!-- 收藏 -->
          <a-tooltip v-else content="收藏">
            <a-link @click="CollectionApi(record.id)">
              <icon-star style="font-size: 16" />
            </a-link>
          </a-tooltip>
          <!-- <a-tooltip content="隐藏">
            <a-link @click="HideApi(record.id)">
              <icon-eye-invisible  style="font-size:16"/>
            </a-link>
          </a-tooltip> -->
        </a-space>
      </template>
    </a-table>

    <!-- 卡片视图 -->
    <div
      v-if="viewMode === 'card'"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <a-card
        v-for="record in renderData"
        :key="record.id"
        class="hover:shadow-lg transition-shadow duration-300 rounded-lg"
        :hoverable="true"
        :loading="loading"
      >
        <div v-if="record" class="flex items-start gap-3">
          <component
            :is="getSvgByType(record.type || '')"
            class="w-12 h-12 flex-shrink-0"
          />
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-start">
              <a-tooltip :content="record.title">
                <a-link
                  class="text-lg font-medium truncate block max-w-[180px]"
                  @click="
                    router.push({
                      name: 'DocDetail',
                      params: { id: record.id },
                      query: { appendix: record.name },
                    })
                  "
                >
                  {{ record.title }}
                </a-link>
              </a-tooltip>
              <a-space>
                <a-tooltip content="修改">
                  <a-link @click="EditApi(record.id)">
                    <icon-edit />
                  </a-link>
                </a-tooltip>
                <a-tooltip v-if="record.is_collected" content="取消收藏">
                  <a-link @click="handleUnCollect(record.id)">
                    <icon-star-fill style="font-size: 16" />
                  </a-link>
                </a-tooltip>
                <a-tooltip v-else content="收藏">
                  <a-link @click="CollectionApi(record.id)">
                    <icon-star />
                  </a-link>
                </a-tooltip>
              </a-space>
            </div>
            <div class="text-sm text-gray-500 mt-1">
              {{ formatFileSize(record.size) }}
            </div>
            <div class="text-sm text-gray-500 mt-1">
              {{ tableDateFormat(record.created_time) }}
            </div>
            <div class="mt-2">
              <a-tag
                v-if="record.status === 0"
                :color="`orange`"
                size="small"
              >
                {{ $t(`处理中`) }}
              </a-tag>
              <a-tag
                v-else-if="record.status === 1"
                :color="`green`"
                size="small"
              >
                {{ $t(`admin.menu.form.status.${record.status}`) }}
              </a-tag>
              <a-tag v-else :color="`red`" size="small">
                {{ $t(`解析失败`) }}
              </a-tag>
            </div>
          </div>
        </div>
        <!-- 新增的摘要信息部分 -->
        <div class="mt-3 flex-1">
          <div
            class="text-sm text-gray-600 line-clamp-3"
            :title="record.desc"
          >
            {{ record.desc || '暂无摘要信息' }}
          </div>
        </div>

        <!-- 底部标签区域（如果有的话） -->
        <div
          v-if="record.tags && record.tags.length"
          class="mt-2 flex flex-wrap gap-1"
        >
          <a-tag
            v-for="(tag, index) in record.tags.slice(0, 3)"
            :key="index"
            size="small"
            class="truncate max-w-[80px]"
            :title="tag"
          >
            {{ tag }}
          </a-tag>
          <a-tag v-if="record.tags.length > 3" size="small"
            >+{{ record.tags.length - 3 }}</a-tag
          >
          >
        </div>
      </a-card>
    </div>

    <!-- 分页器 -->
    <div v-if="viewMode === 'card'" class="mt-4 flex justify-end">
      <a-pagination
        v-model:current="pagination.current"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total || 0"
        show-total
        show-jumper
        show-page-size
        @change="onPageChange"
        @page-size-change="onPageSizeChange"
      />
    </div>
  </div>
  <div class="content-modal">
    <a-modal
      :closable="false"
      :on-before-ok="beforeSubmit"
      :title="drawerTitle"
      :visible="openNewOrEdit"
      :width="850"
      @cancel="cancelReq"
      @ok="submitNewOrEdit"
    >
      <a-form ref="formRef" :model="form">
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item
              :feedback="true"
              :label="$t('data.doc.form.title')"
              field="title"
            >
              <a-input
                v-model="form.title"
                :placeholder="$t('data.doc.form.name.placeholder')"
              ></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              :feedback="true"
              :label="$t('data.doc.form.name')"
              field="name"
            >
              <a-input v-model="form.name"></a-input>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item :label="$t('data.doc.form.type')" field="type">
              <a-select v-model="form.type" :placeholder="$t('请选择类型')">
                <a-option
                  v-for="(item, index) in [
                    '文本',
                    'PDF',
                    '表格',
                    '图片',
                    '媒体',
                    '其他',
                  ]"
                  :key="index"
                  :value="item"
                >
                  {{ item }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <!-- 文件来源 -->
            <a-form-item :label="$t('文件来源')" field="source">
              <a-input v-model="form.source"></a-input>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item :label="$t('data.doc.form.desc')" field="desc">
              <a-textarea
                v-model="form.desc"
                auto-size
                style="
                  overflow: scroll;
                  max-height: 300px;
                  min-height: 300px;
                "
              ></a-textarea>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              :label="$t('data.doc.form.content')"
              field="content"
            >
              <a-textarea
                v-model="form.content"
                auto-size
                style="
                  overflow: scroll;
                  max-height: 300px;
                  min-height: 300px;
                "
              ></a-textarea>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="24">
          <a-form-item :label="$t('标签')" field="tags">
            <a-space wrap>
              <a-tag
                v-for="(tag, index) of tags"
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
        </a-row>
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
      <!-- <GeneralDetail :info="form"/> -->
    </a-modal>
    <!--    收藏弹窗 -->
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
</div>
</template>

<script lang="ts" setup>
  import {
    Message,
    SelectOptionData,
    TableColumnData,
    TableData,
  } from '@arco-design/web-vue';
  import { useI18n } from 'vue-i18n';
  import { computed, reactive, ref, onMounted, nextTick } from 'vue';
  import useLoading from '@/hooks/loading';
  import {
    createSysDoc,
    deleteSysDoc,
    querySysDocDetail,
    querySysDocList,
    SysDocParams,
    SysDocReq,
    SysDocRes,
    updateSysDoc,
    collectDoc,
  } from '@/api/doc';
  import {
    queryStarCollectionList,
    StarCollectionRes,
  } from '@/api/starCollection';
  import { Pagination } from '@/types/global';
  import { useRouter } from 'vue-router';
  import { tableDateFormat } from '@/utils/date';
  import SettingTable from '@/components/setting-table/index.vue';
  import { getSvgByType, formatFileSize } from '@/utils/doc';

  const { t } = useI18n();
  const { loading, setLoading } = useLoading(true);
  const router = useRouter();
  const storageKey = 'docTable';
  const viewMode = ref('card');

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
      title: undefined,
      source: undefined,
      content: undefined,
      type: undefined,
      doc_type: undefined,
      tokens: undefined,
      rangeValue: ['', ''],
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
    defaultPageSize: 10,
    pageSize: 10,
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
  const ViewApi = async (pk: number, title: string) => {
    operateRow.value = pk;
    // drawerTitle.value = t('查看');
    // await fetchApiDetail(pk);
    // openView.value = true;
    router.push({
      name: 'DocDetail',
      params: { id: pk },
      query: { appendix: title },
    });
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

  const columns = computed<TableColumnData[]>(() => [
    // {
    //   title: 'ID',
    //   dataIndex: 'id',
    //   slotName: 'id',
    //   sortable: {
    //     sortDirections: ['ascend', 'descend']
    //   },
    //   ellipsis: true,
    //   tooltip: true,
    //   width: 100
    // },
    {
      title: t('data.doc.columns.title'),
      dataIndex: 'title',
      slotName: 'title',
      ellipsis: true,
    },
    {
      title: t('data.doc.columns.name'),
      dataIndex: 'name',
      slotName: 'name',
      ellipsis: true,
    },
    {
      title: t('类型'),
      dataIndex: 'type',
      slotName: 'type',
      ellipsis: true,
      tooltip: true,
      width: 100,
    },
    {
      title: t('大小'),
      dataIndex: 'size',
      slotName: 'size',
      ellipsis: true,
      tooltip: true,
      width: 100,
    },
    {
      title: t('文件时间'),
      dataIndex: 'doc_time',
      slotName: 'doc_time',
      sortable: {
        sortDirections: ['ascend', 'descend'],
      },
      width: 160,
      ellipsis: true,
      tooltip: true,
    },
    {
      title: t('上传日期'),
      dataIndex: 'created_time',
      slotName: 'created_time',
      sortable: {
        sortDirections: ['ascend', 'descend'],
      },
      width: 150,
      ellipsis: true,
      tooltip: true,
    },
    // 上传用户
    {
      title: t('上传用户'),
      dataIndex: 'created_user',
      slotName: 'created_user',
      ellipsis: true,
      tooltip: true,
    },
    // 状态
    {
      title: t('状态'),
      dataIndex: 'status',
      slotName: 'status',
      ellipsis: true,
      tooltip: true,
    },
    {
      title: t('data.doc.columns.operate'),
      dataIndex: 'operate',
      slotName: 'operate',
      // width: 150,
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
    type: '文本',
    desc: '',
    file: undefined,
    content: undefined,
    source: undefined,
    tags: [],
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
      await fetchApiList({ page: 1, size: pagination.pageSize });
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
    pagination.current = current;
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
      page: pagination.current,
      size: pagination.pageSize,
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

    form.tags = data.tags.map((item: Record<any, any>) => item.name);

    if (form.tags) {
      tags.value = [...form.tags];
    }
  };

  const tags = ref<string[]>([]);
  const inputRef = ref<HTMLInputElement>();
  const showInput = ref(false);
  const inputVal = ref('');

  const handleRemove = (key: string) => {
    tags.value = tags.value.filter((tag) => tag !== key);
    form.tags = form.tags?.filter((tag) => tag !== key);
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
      tags.value.push(inputVal.value);
      form.tags?.push(inputVal.value);
      inputVal.value = '';
    }
    showInput.value = false;
  };

  const collectView = ref(false);

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
    await fetchApiList({ page: pagination.current, size: pagination.pageSize });
    Message.success('收藏成功');
  };

  const handleUnCollect = async (id: number) => {
    await collectDoc({ doc_id: id });
    collectView.value = false;
    await fetchApiList({ page: pagination.current, size: pagination.pageSize });
    Message.success('操作成功');
  };

  const handleCollectCancel = () => {
    collectView.value = false;
  };
</script>

<script lang="ts">
  export default {
    name: 'DocTable',
  };
</script>

<style lang="less" scoped>
  .title-link {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    display: block;
  }
</style>
