<template>
    <a-layout class="flex-layout">
      <a-card class="general-card py-4">
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
                      @keydown.enter="search"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item field="entity_type" label="实体类型">
                    <a-input
                      v-model="formModel.entity_type"
                      :placeholder="$t('搜索实体类型')"
                      @keydown.enter="search"
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
          <a-button type="primary" @click="NewEntity()">
            <template #icon>
              <icon-plus />
            </template>
            新增
          </a-button>
          <a-button
            :disabled="deleteButtonStatus()"
            status="danger"
            @click="DeleteEntity"
          >
            <template #icon>
              <icon-minus />
            </template>
            删除
          </a-button>

          <SettingTable
            :columns="columns"
            storageKey="entity-columns"
            @update-columns="updateVisibleColumns"
          />
        </a-space>
        <div class="content">
          <a-table
            v-model:selected-keys="rowSelectKeys"
            :bordered="false"
            :columns="(visibleColumns as TableColumnData[])"
            :data="renderData"
            :expandable="expandable"
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
                <a-link @click="EditEntity(record.id)">
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

              <a-form-item
                :feedback="true"
                label="类型"
                field="entity_type"
              >
                <a-input
                  v-model="form.entity_type"
                ></a-input>
              </a-form-item>

              <a-form-item
                :feedback="true"
                label="描述"
                field="description"
              >
                <a-textarea
                  v-model="form.description"
                ></a-textarea>
              </a-form-item>

              <!-- 动态表单字段 - 人物类型 -->
              <template v-if="form.entity_type === '人物'">
                <a-form-item label="性别" field="gender">
                  <a-select v-model="form.properties.gender">
                    <a-option value="男">男</a-option>
                    <a-option value="女">女</a-option>
                    <a-option value="其他">其他</a-option>
                  </a-select>
                </a-form-item>
                <a-form-item label="国籍" field="nationality">
                  <a-input v-model="form.properties.nationality"></a-input>
                </a-form-item>
                <a-form-item label="组织" field="organization">
                  <a-input v-model="form.properties.organization"></a-input>
                </a-form-item>
                <a-form-item label="职位" field="position">
                  <a-input v-model="form.properties.position"></a-input>
                </a-form-item>
                <a-form-item label="联系方式" field="contact">
                  <a-input v-model="form.properties.contact"></a-input>
                </a-form-item>
                <a-form-item label="标签" field="tags">
                  <a-input v-model="form.properties.tags"></a-input>
                </a-form-item>
              </template>

              <!-- 动态表单字段 - 组织类型 -->
              <template v-else-if="form.entity_type === '组织'">
                <a-form-item label="类型" field="type">
                  <a-input v-model="form.properties.type"></a-input>
                </a-form-item>
                <a-form-item label="标签" field="tags">
                  <a-input v-model="form.properties.tags"></a-input>
                </a-form-item>
                <a-form-item label="国家" field="country">
                  <a-input v-model="form.properties.country"></a-input>
                </a-form-item>
              </template>

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
    import { computed, h, onMounted, reactive, ref } from 'vue';
    import useLoading from '@/hooks/loading';
    import SettingTable from '@/components/setting-table/index.vue';
    import Footer from '@/components/footer/index.vue';
    import {
      createEntity,
      deleteEntity,
      queryEntityDetail,
      queryEntityList,
      EntityParams,
      EntityReq,
      EntityRes,
      updateEntity,
    } from '@/api/entity';
    import { Pagination } from '@/types/global';
  
    const { t } = useI18n();
    const { loading, setLoading } = useLoading(true);
  
    // 表单
    const generateFormModel = () => {
      return {
        name: undefined,
        entity_type: undefined,
      };
    };
    const formModel = ref(generateFormModel());
    // 表格
    const renderData = ref<EntityRes[]>([]);
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
    const NewEntity = () => {
      buttonStatus.value = 'new';
      drawerTitle.value = t('新增');
      resetForm(formDefaultValues);
      openNewOrEdit.value = true;
    };
    const EditEntity = async (pk: number) => {
      buttonStatus.value = 'edit';
      operateRow.value = pk;
      drawerTitle.value = t('编辑');
      await fetchEntityDetail(pk);
      openNewOrEdit.value = true;
    };
    const DeleteEntity = () => {
      drawerTitle.value = t('删除');
      openDelete.value = true;
    };
    const columns = computed<TableColumnData[]>(() => [
      {
        title: t('名称'),
        dataIndex: 'name',
        slotName: 'name',
        ellipsis: true,
        tooltip: true,
        width: 200,
      },
      {
        title: t('类型'),
        dataIndex: 'entity_type',
        slotName: 'entity_type',
        ellipsis: true,
        tooltip: true,
        width: 100,
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
    const formDefaultValues: EntityReq = {
      name: '',
      entity_type: '',
      description: '',
      properties: {},
    };
    const form = reactive<EntityReq>({ ...formDefaultValues });
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
          await createEntity(form);
          cancelReq();
          Message.success(t('submit.create.success'));
          await fetchEntityList();
        } else {
          await updateEntity(operateRow.value, form);
          cancelReq();
          Message.success(t('submit.update.success'));
          await fetchEntityList();
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
        await deleteEntity({ pk: rowSelectKeys.value });
        cancelReq();
        Message.success(t('submit.delete.success'));
        await fetchEntityList();
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
    const fetchEntityList = async (params: EntityParams = {}) => {
      setLoading(true);
      try {
        const res = await queryEntityList(params);
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
      const savedColumns = localStorage.getItem("entity-columns");
      if (savedColumns) {
        updateVisibleColumns(JSON.parse(savedColumns));
      } else {
        visibleColumns.value = columns.value; // 默认全部显示
      }
    }

    onMounted(() => {
      initColumns()
      fetchEntityList();
    })
    
  
    // 请求部门详情
    const fetchEntityDetail = async (pk: number) => {
      setLoading(true);
      try {
        const res = await queryEntityDetail(pk);
        resetForm(res);
      } catch (error) {
        // console.log(error);
      } finally {
        setLoading(false);
      }
    };
  
    // 事件: 分页
    const onPageChange = async (current: number) => {
      await fetchEntityList({ page: current, size: pagination.pageSize });
    };
  
    // 事件: 分页大小
    const onPageSizeChange = async (pageSize: number) => {
      pagination.pageSize = pageSize;
      await fetchEntityList({ page: 1, size: pageSize });
    };
  
    // 搜索
    const search = async () => {
      await fetchEntityList({
        ...formModel.value,
      } as unknown as EntityParams);
    };
  
    // 重置
    const resetSelect = () => {
      formModel.value = generateFormModel();
    };
  
    // 重置方法
    const resetMethod = () => {
      formModel.value.name = undefined;
      formModel.value.entity_type = undefined;
    };

    // 实体详情组件
    const EntityDetail = { 
      props: ['data'],
      setup(props) {
        const formatPropertyKey = (key: string): string => {
          const keyMap: Record<string, string> = {
            gender: '性别',
            nationality: '国籍',
            organization: '组织',
            position: '职位',
            contact: '联系方式',
            tags: '标签',
            type: '类型',
            country: '国家'
          };
          return keyMap[key] || key;
        };
        
        return () => {
          const record = props.data;
          return h('div', { class: 'bg-gray-50 p-4 rounded-lg border border-gray-200' }, [
            // 属性详情部分
            h('div', { class: 'mb-4' }, [
              h('h3', { class: 'text-lg font-semibold mb-3 text-gray-700' }, '属性详情'),
              Object.keys(record.properties || {}).length > 0 
                ? h('div', { class: 'grid grid-cols-1 md:grid-cols-2 gap-3' }, 
                    Object.entries(record.properties || {}).map(([key, value]) => 
                      h('div', { class: 'flex items-start gap-2 bg-white p-3 rounded shadow-sm' }, [
                        h('span', { class: 'text-gray-500 font-medium min-w-[80px]' }, `${formatPropertyKey(key)}:`),
                        h('span', { class: 'text-gray-800 flex-1 word-break-break-all' }, value || '-')
                      ])
                    )
                  )
                : h('div', { class: 'text-gray-500 italic text-center py-2' }, '暂无属性信息')
            ]),
            // 实体详情部分
            record.description && record.description.trim() 
              ? h('div', { class: 'mt-4 border-t border-gray-200 pt-4' }, [
                  h('h3', { class: 'text-lg font-semibold mb-2 text-gray-700' }, '实体详情'),
                  h('div', { class: 'bg-white p-3 rounded shadow-sm text-gray-800' }, record.description)
                ])
              : h('div', { class: 'mt-4 border-t border-gray-200 pt-4' }, [
                  h('div', { class: 'text-gray-500 italic text-center' }, '暂无实体详情')
                ])
          ]);
        };
      }
    };
    
    // 表格展开配置
    const expandable = reactive({
      title: '展开',
      expandedRowRender: (record: any) => {
        return h(EntityDetail, { data: record });
      }
    });


  
    // 重置表单
    const resetForm = (data: Record<any, any>) => {
      Object.keys(formDefaultValues).forEach((key) => {
        // @ts-ignore
        if (key === 'properties' && !data[key]) {
          form[key] = {};
        } else {
          // @ts-ignore
          form[key] = data[key] !== undefined ? data[key] : formDefaultValues[key];
        }
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
      name: 'Entity',
    };
  </script>
  
  <style lang="less" scoped>
    .content {
      padding-top: 20px;
    }


  </style>
  