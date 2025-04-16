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
        <a-button type="primary" style="width: 100%;" @ok="handleOk">收藏</a-button>
      </template>
    </a-modal>
    <Breadcrumb />
    <a-card :title="$t('人物管理')" class="general-card">
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
                  <a-input v-model="formModel.name" :placeholder="$t('搜索人物名称')"/>
                </a-form-item>
              </a-col>
              <a-col :span="10">
          <a-space direction="inline">
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
            
          </a-space>
          <a-space direction="inline">
            <a-form-item field="name" label="出生日期">
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
          </a-form>
        </a-col>
        <a-divider direction="vertical" style="height: 30px" />
        <a-col :span="6">
        </a-col>
      </a-row>
      <a-divider />
      <a-space :size="'medium'">
        <a-button type="primary" @click="NewPerson()">
          <template #icon>
            <icon-plus />
          </template>
          新增
        </a-button>
        <a-button
          :disabled="deleteButtonStatus()"
          status="danger"
          @click="DeletePerson"
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
          :bordered="true"
          :columns="columns"
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
            <a-link
              class="title-link"
              @click="
                router.push({
                  name: 'PersonDetail',
                  params: { id :record.id },
                  query: { type: 'person'},
                })
              "
              >{{ record.name }}</a-link>

          </template>
          <template #collection="{ record }">
            <div>
              <!-- 修改：绑定动态样式，根据当前记录的收藏状态设置颜色 -->
              <icon-star
                id="star-{{ record.id }}"
                size="23"
                :style="{ cursor: 'pointer', color: record.isCollected ? '#e6a23c' : 'initial' }"
                @click.stop="toggleCollect(record)"
              />
            </div>
          </template>
          <template #follow="{ record }">
            <div>
              <!-- 修改：绑定动态样式，根据当前记录的关注状态设置颜色 -->
              <icon-user
                id="user-{{ record.id }}"
                size="23"
                :style="{ cursor: 'pointer', color: record.isFollowed ? 'blue' : 'initial' }"
                @click.stop="toggleFollow(record)"
              />
            </div>
          </template>
          <template #operate="{ record }">
            <a-space>
              <a-link @click="EditPerson(record.id)"> 编辑 </a-link>
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
              label="姓名"
              :rules="[{ required: true, message: 'required' }]"
              field="name"
            >
              <a-input v-model="form.name"></a-input>
            </a-form-item>
            <a-form-item
              :feedback="true"
              label="性别"
              field="gender"
            >
              <a-input v-model="form.gender"></a-input>
            </a-form-item>
            <a-form-item label="其他名称" field="other_name">
              <a-input v-model="form.other_name"></a-input>
            </a-form-item>
            
            <a-form-item label="所属组织" field="organization">
              <a-textarea v-model="form.organization"></a-textarea>
            </a-form-item>
            <a-form-item label="职位" field="position">
              <a-textarea v-model="form.position"></a-textarea>
            </a-form-item>
            <a-form-item label="职业" field="profession">
              <a-textarea v-model="form.profession"></a-textarea>
            </a-form-item>
            <a-form-item label="出生日期" field="birth_date">
              <!-- 修改后，确保 form 对象包含 birth_date 属性 -->
              <a-input v-model="form.birth_date"></a-input>
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
  <!-- 新增：人物详情组件 -->
  <PersonDetail
    v-if="showDetail"
    :person="selectedPerson"
    @close="showDetail = false"
  />
  <!-- ... existing code ... -->
</template>

<script setup lang="ts">
// import { ref } from 'vue';

  // Move all import statements to the top
  import {
    Message,
    TableColumnData,
  } from '@arco-design/web-vue';
  import { useI18n } from 'vue-i18n';
  import { computed, reactive, ref } from 'vue';
  import useLoading from '@/hooks/loading';
  import Footer from '@/components/footer/index.vue';
  import {
    createPerson,
    deletePerson,
    queryPersonDetail,
    queryPersonList,
    PersonParams,
    PersonReq,
    PersonRes,
    updatePerson,
  } from '@/api/person';
  import { Pagination } from '@/types/global';
  import { useRouter } from 'vue-router'; // 引入路由钩子
  import { toPath } from 'lodash';
  // import PersonDetail from './PersonDetail.vue';
  // Add the import statement that was at line 551 here
  // For example, if it was something like import SomeModule from 'some-module';
  // Add it in the appropriate order among the other imports

  // Add an empty line after the last import
  

  const { t } = useI18n();
  const { loading, setLoading } = useLoading(true);

  // 表单
  const generateFormModel = () => {
    return {
      name: undefined,
      gender: undefined,
      other: undefined,
      organization: undefined,
      position: undefined,
      profession: undefined,
      birth_date: undefined
    };
  };
  const formModel = ref(generateFormModel());
  // 表格
  const renderData = ref<PersonRes[]>([]);
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
  const NewPerson = () => {
    buttonStatus.value = 'new';
    drawerTitle.value = t('新增');
    resetForm(formDefaultValues);
    openNewOrEdit.value = true;
  };
  const EditPerson = async (pk: number) => {
    buttonStatus.value = 'edit';
    operateRow.value = pk;
    drawerTitle.value = t('编辑');
    await fetchPersonDetail(pk);
    openNewOrEdit.value = true;
  };
  const DeletePerson = () => {
    drawerTitle.value = t('删除');
    openDelete.value = true;
  };
  const columns = computed<TableColumnData[]>(() => [
    {
      title: '收藏',
      dataIndex: 'collection',
      slotName: 'collection',
      ellipsis: true,
      tooltip: true,
    },
    {
      title: '关注',
      dataIndex: 'follow',
      slotName: 'follow',
      ellipsis: true,
      tooltip: true,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      slotName: 'name',
      ellipsis: true,
      tooltip: true,
    },
    {
      title: '其他名称',
      dataIndex: 'other',
      slotName: 'other',
      ellipsis: true,
      tooltip: true,
    },
    {
      title: '性别',
      dataIndex: 'gender',
      slotName: 'gender',
      ellipsis: true,
      tooltip: true,
    },
    {
      title: '所属组织',
      dataIndex: 'organization',
      slotName: 'organization',
      ellipsis: true,
      tooltip: true,
    },
    {
      title: '职位',
      dataIndex: 'position',
      slotName: 'position',
      ellipsis: true,
      tooltip: true,
    },
    {
      title: '职业',
      dataIndex: 'profession',
      slotName: 'profession',
      ellipsis: true,
      tooltip: true,
    },
    {
      title: '出生日期',
      dataIndex: 'birth_date',
      slotName: 'birth_date',
      ellipsis: true,
      tooltip: true,
    },
    {
      // 毕业院校/专业
      title: t('毕业院校/专业'),
      dataIndex: 'school',
      slotName: 'school',
      ellipsis: true,
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
  const formDefaultValues: PersonReq = {
    name: '',
    other_name: '',
    gender: '',
    organization: '',
    position: '',
    profession: '',
    birth_date: '',
    school: ''
  };
  const form = reactive<PersonReq>({ ...formDefaultValues });
  const buttonStatus = ref<string>();
  const formRef = ref();

    // 收藏弹窗
    const collectVisi = ref(false) ;

    // 收藏成功 按钮变色
    const handleOk = async () => {
      // 关闭收藏弹窗
      collectVisi.value = false;
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
    setLoading(true);
    try {
      if (buttonStatus.value === 'new') {
        await createPerson(form);
        cancelReq();
        Message.success(t('submit.create.success'));
        await fetchPersonList();
      } else {
        await updatePerson(operateRow.value, form);
        cancelReq();
        Message.success(t('submit.update.success'));
        await fetchPersonList();
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
      await deletePerson({ pk: rowSelectKeys.value });
      cancelReq();
      Message.success(t('submit.delete.success'));
      await fetchPersonList();
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
  const fetchPersonList = async (params: PersonParams = {}) => {
    setLoading(true);
    try {
      const res = await queryPersonList(params);
      // 为每条记录添加初始收藏和关注状态
      renderData.value = res.items.map(item => ({ ...item, isCollected: false, isFollowed: false }));
      pagination.total = res.total;
      pagination.current = params.page;
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };
  fetchPersonList();

  // 请求部门详情
  const fetchPersonDetail = async (pk: number) => {
    setLoading(true);
    try {
      const res = await queryPersonDetail(pk);
      resetForm(res);
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // 事件: 分页
  const onPageChange = async (current: number) => {
    await fetchPersonList({ page: current, size: pagination.pageSize });
  };

  // 事件: 分页大小
  const onPageSizeChange = async (pageSize: number) => {
    pagination.pageSize = pageSize;
    await fetchPersonList({ page: 1, size: pageSize });
  };

  // 搜索
  const search = async () => {
    await fetchPersonList({
      ...formModel.value,
    } as unknown as PersonParams);
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

  // 新增：定义收藏状态
  const isCollected = ref(false);

  // 新增：切换收藏状态的方法
  const toggleCollect = (record: any) => {
    record.isCollected = !record.isCollected;
    // 打开收藏弹窗
    collectVisi.value = true;
  };

  // 新增：切换关注状态的方法
  const toggleFollow = (record: any) => {
    record.isFollowed = !record.isFollowed;
  };


  const router = useRouter(); // 获取路由实例


  // 新增：控制详情页面显示
  const showDetail = ref(false);
  const selectedPerson = ref({});

  // 新增：显示人物详情的方法
  const showPersonDetail = (record:any) => {
    selectedPerson.value = record;
    showDetail.value = true;
  };
</script>

<script lang="ts">
  export default {
    name: 'Person',
  };
</script>

<style lang="less" scoped>
  .content {
    padding-top: 20px;
  }
</style>
