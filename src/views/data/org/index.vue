
<template>
  <a-layout class="flex-layout">
    <Breadcrumb />
    <div class="general-card">
      <a-layout class="flex-layout">
        <a-card :title="$t('data.sysOrg')" class="general-card">
          <a-row>
            <a-col :flex="62">
              <a-form
                :auto-label-width="true"
                :model="formModel"
                label-align="right"
              >
                <a-row :gutter="16">
                  <a-col :span="8">
                    <a-form-item :label="$t('data.org.form.name')" field="name">
                      <a-input
                        @keyup.enter="search"
                        v-model="formModel.name"
                        :placeholder="$t('data.org.form.name.placeholder')"
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
                  {{ $t('data.org.form.search') }}
                </a-button>
                <a-button @click="resetSelect">
                  <template #icon>
                    <icon-refresh />
                  </template>
                  {{ $t('data.org.form.reset') }}
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
              {{ $t('data.org.button.create') }}
            </a-button>
            <a-button
              :disabled="selectStatus()"
              status="danger"
              @click="DeleteApi"
            >
              <template #icon>
                <icon-minus />
              </template>
              {{ $t('data.org.button.delete') }}
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
              :scroll="{ x: 1200 }"
              :size="'medium'"
              row-key="id"
              @page-change="onPageChange"
              @page-size-change="onPageSizeChange"
            >
              <!-- <template #index="{ rowIndex }">
                {{ rowIndex + 1 }}
              </template> -->
              <template #org_name="{ record }">
                <a-link
                  @click="router.push({
                    name: 'OrgDetail', 
                    params: { id: record.id }, 
                    query: { appendix: record.org_name},
                  })">{{ record.org_name }}</a-link>
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
                  :label="$t('data.org.form.name')"
                  :rules="[
                    { required: true, message: $t('data.org.form.name.help') },
                  ]"
                  field="org_name"
                >
                  <a-input
                    v-model="form.org_name"
                    :placeholder="$t('data.org.form.name.placeholder')"
                  ></a-input>
                </a-form-item>
                <a-form-item
                  :feedback="true"
                  :label="$t('data.org.form.org_file_nums')"
                  :rules="[
                    { required: true, message: $t('data.org.form.org_file_nums.help') },
                  ]"
                  field="org_file_nums"
                >
                  <a-input-number :placeholder="$t('data.org.form.org_file_nums.placeholder')" 
                  v-model="form.org_file_nums" :min="0" mode="button"></a-input-number>
                </a-form-item>
                <a-form-item
                  :feedback="true"
                  :label="$t('data.org.form.org_assets_nums')"
                  :rules="[
                    { required: true, message: $t('data.org.form.org_assets_nums.help') },
                  ]"
                  field="org_assets_nums"
                >
                  <a-input-number :placeholder="$t('data.org.form.org_assets_nums.placeholder')" 
                  v-model="form.org_assets_nums" :min="0" mode="button"></a-input-number>
                </a-form-item>
                <a-form-item :label="$t('组织文件')" field="docs">
                  <a-select
                    v-model="form.docs"
                    :style="{ width: '320px' }"
                    :loading="docsLoading"
                    placeholder="文件名搜索"
                    multiple
                    @search="handleDocSearch"
                  >
                    <a-option
                      v-for="item of docOptions"
                      :key="item.value"
                      :value="item.value"
                      >{{ item.label }}
                    </a-option>
                  </a-select>
                </a-form-item>
                <a-form-item :label="$t('组织地点')" field="docs">
                  <a-input
                      v-model="form.org_location"
                      :placeholder="$t('请输入组织地点')"
                  ></a-input>
                </a-form-item>
                <a-form-item :label="$t('组织标签')" field="docs">
                  <a-input-tag
                               v-model="form.org_tag"
                               placeholder="请输入组织标签"
                               allow-clear/>
                </a-form-item>
                <a-form-item :label="$t('组织资产')" field="assets">
                  <a-select
                    v-model="form.assets"
                    :style="{ width: '320px' }"
                    :loading="assetsLoading"
                    placeholder="资产名搜索"
                    multiple
                    @search="handleAssetSearch"
                  >
                    <a-option
                      v-for="item of assetOptions"
                      :key="item.value"
                      :value="item.value"
                      >{{ item.label }}
                    </a-option>
                  </a-select>
                </a-form-item>
                <a-form-item
                  :label="$t('data.org.form.org_desc')"
                  field="org_desc"
                >
                  <a-textarea
                    v-model="form.org_desc"
                  ></a-textarea>
                </a-form-item>
                <a-form-item
                    :label="$t('组织简介')"
                    field="org_desc"
                >
                  <a-textarea
                      v-model="form.org_introduce"
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
              hideCancel
              @ok="cancelReq"
              okText="关闭"
            >
              <Detail :info="form"/>
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
  import { querySysAssetsList, SysAssetsRes } from '@/api/assets';
  import { 
    querySysOrgList,
    querySysOrgDetail, 
    createSysOrg,
    updateSysOrg,
    deleteSysOrg,
    SysOrgParams
  } from '@/api/org';
  import { querySysDocList, SysDocRes } from '@/api/doc';
  import Detail from '@/views/data/org-detail/index.vue';

  const { t } = useI18n();
  const { loading, setLoading } = useLoading(true);
  const router = useRouter();

  // 表单
  const generateFormModel = () => {
    return {
      name: '',
      org_file_nums: 0,
      org_assets_nums: 0,
      docs: [],
      assets: [],
      org_desc: '',
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
    name: '',
    org_file_nums: 0,
    org_assets_nums: 0,
    org_desc: '',
    org_location: '',
    org_introduce: '',
    org_tag: [],
    docs: [],
    assets: [],
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
      title: '收藏',
      dataIndex: 'collection',
      slotName: 'collection',
      ellipsis: true,
      tooltip: true,
      width: 70,
    },
    {
      title: '关注',
      dataIndex: 'follow',
      slotName: 'follow',
      ellipsis: true,
      tooltip: true,
      width: 70,
    },
    {
      title: t('data.org.columns.org_name'),
      dataIndex: 'org_name',
      slotName: 'org_name',
      ellipsis: true,
      width: 200,
    },
    {
      title: t('data.org.columns.org_file_nums'),
      dataIndex: 'org_file_nums',
      slotName: 'org_file_nums',
      width: 150,
    },
    {
      title: t('data.org.columns.org_assets_nums'),
      dataIndex: 'org_assets_nums',
      slotName: 'org_assets_nums',
      width: 150,
    },
    {
      title: t('data.org.columns.org_desc'),
      dataIndex: 'org_desc',
      slotName: 'org_desc',
      tooltip: true,
      ellipsis: true,
    },
    {
      title: t('data.org.columns.created_time'),
      dataIndex: 'created_time',
      slotName: 'created_time',
      sortable: {
        sortDirections: ['ascend', 'descend'],
      },
      width: 180,
    },
    {
      title: t('data.org.columns.operate'),
      dataIndex: 'operate',
      slotName: 'operate',
      align: 'center',
      fixed: 'right',
      width: 150,
    },
  ]);

  
  // 事件: 分页
  const onPageChange = async (current: number) => {
    await fetchApiList({ page: current, size: pagination.pageSize });
  };

  // 事件: 分页大小
  const onPageSizeChange = async (pageSize: number) => {
    pagination.pageSize = pageSize;
    await fetchApiList({ page: 1, size: pageSize });
  };

  // 重置表单
  const resetForm = (data: Record<any, any>) => {
    Object.keys(data).forEach((key) => {
      // @ts-ignore
      form[key] = data[key];
      docs.value = form.docs;
      assets.value = form.assets;
      form.docs = data.docs.map((item: Record<any, any>) => item.id);
      form.assets = data.assets.map((item: Record<any, any>) => item.id);
    });
  };


  // 请求列表
  const fetchApiList = async (params: any) => {
    setLoading(true);
    try {
      const res = await querySysOrgList(params);
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
      // console.log(1);
      const res = await querySysOrgDetail(pk);
      // const res = querySysOrgDetailTest(pk);
      resetForm(res);
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const NewApi = () => {
    buttonStatus.value = 'new';
    drawerTitle.value = t('data.org.columns.new.drawer');
    resetForm(formDefaultValues);
    openNewOrEdit.value = true;
  };
  const EditApi = async (pk: number) => {
    buttonStatus.value = 'edit';
    operateRow.value = pk;
    drawerTitle.value = t('data.org.columns.edit.drawer');
    await fetchApiDetail(pk);
    openNewOrEdit.value = true;
  };
  const ViewApi = async (pk: number) => {
    operateRow.value = pk;
    drawerTitle.value = t('查看');
    await fetchApiDetail(pk);
    openView.value = true;
    // router.push({name: 'orgDetail', params: { id: pk }});
  };
  const DeleteApi = () => {
    drawerTitle.value = t('data.org.columns.delete.drawer');
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
    form.org_tag = JSON.stringify(form.org_tag)
    console.log(form)
    setLoading(true);
    try {
      if (buttonStatus.value === 'new') {
        await createSysOrg(form);
        cancelReq();
      } else {
        await updateSysOrg(operateRow.value, form);
        cancelReq();
      }
      form.value = generateFormModel();
      await fetchApiList({ page: 1, size: pagination.pageSize});
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading(false);
    }
    form.org_tag = JSON.parse(form.org_tag)
  };

  // 选取式按钮状态
  const selectStatus = () => {
    return rowSelectKeys.value?.length === 0;
  };

  // 删除按钮
  const submitDelete = async () => {
    setLoading(true);
    try {
      await deleteSysOrg({ pk: rowSelectKeys.value });
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
    } as unknown as SysOrgParams);
  };


  const docsLoading = ref(false);
  const docs = ref<SysDocRes[]>([]);
  const docOptions = computed(() => {
    return docs.value.map((item) => {
      return {
        value: item.id,
        label: item.title,
      };
    });
  });

  const handleDocSearch = async (value: string) => {
    if (value) {
      docsLoading.value = true;

      const res = await querySysDocList({
        name: value,
      });

      docs.value = res.items;

      docsLoading.value = false;
    } else {
      docs.value = [];
    }
  };


  const assetsLoading = ref(false);
  const assets = ref<SysAssetsRes[]>([]);
  const assetOptions = computed(() => {
    return assets.value.map((item) => {
      return {
        value: item.id,
        label: item.assets_name,
      };
    });
  });

  const handleAssetSearch = async (value: string) => {
    if (value) {
      assetsLoading.value = true;

      const res = await querySysAssetsList({
        assets_name: value,
      });

      assets.value = res.items;

      assetsLoading.value = false;
    } else {
      docs.value = [];
    }
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