<template>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 content">
      <a-card class="border-0" :title="$t('邮件类型分布')">
        <VChart :option="pieChartOption" style="height: 300px" />
      </a-card>
      <a-card class="border-0" :title="$t('邮箱邮件数量排名')">
        <VChart :option="barChartOption" style="height: 300px" />
      </a-card>
    </div>
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
                <a-form-item field="name" label="名称">
                  <a-input
                    v-model="formModel.name"
                    :placeholder="$t('搜索邮箱地址')"
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
          <a-button type="primary" @click="NewMailBox()">
            <template #icon>
              <icon-plus />
            </template>
            新增
          </a-button>
          <a-button
            :disabled="deleteButtonStatus()"
            status="danger"
            @click="DeleteMailBox"
          >
            <template #icon>
              <icon-minus />
            </template>
            删除
          </a-button>
        </a-space>
        <a-space>
          <a-tooltip content="切换视图">
            <a-button type="text" @click="viewType = !viewType">
              <template #icon>
                <icon-swap />
              </template>
            </a-button>
          </a-tooltip>
        </a-space>
      </a-space>
      <div class="mt-5">
        <div v-if="loading" class="flex justify-center items-center h-64">
          <a-spin size="large" />
        </div>
        <template v-else>
          <template v-if="viewType">
            <div
              v-if="renderData.length === 0"
              class="text-center text-gray-500 dark:text-gray-400"
            >
              暂无数据
            </div>
            <div
              v-else
              class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4"
            >
              <a-card
                v-for="item in renderData"
                :key="item.id"
                class="rounded-lg transition-all duration-200 hover:shadow-lg dark:bg-gray-800"
                :class="{
                  'border-blue-500 border-2': rowSelectKeys.includes(item.id),
                }"
                @click="toggleSelection(item.id)"
              >
                <div class="flex items-center mb-4">
                  <component
                    :is="getMailboxIcon(item.name)"
                    class="w-8 h-8 mr-3"
                    alt="mailbox icon"
                  />
                  <h3
                    class="text-lg font-semibold text-gray-800 dark:text-white truncate"
                    >{{ item.name }}</h3
                  >
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-300">
                  <p class="mb-2">
                    <icon-email class="mr-2" />
                    邮件数量:
                    <span class="font-semibold">{{ item.email_num }}</span>
                  </p>
                  <p>
                    <icon-location class="mr-2" />
                    国家/地区:
                    <span class="font-semibold">{{ item.country }}</span>
                  </p>
                </div>
                <template #actions>
                  <a-link @click.stop="EditMailBox(item.id)"> 编辑 </a-link>
                  <a-link
                    @click.stop="
                      router.push({
                        name: 'MailBoxDetail',
                        params: { id: item.id },
                        query: { appendix: item.name, category: 'email'}
                      })
                    "
                  >
                    查看
                  </a-link>
                </template>
              </a-card>
            </div>
            <div class="flex justify-end mt-4">
              <a-pagination
                :total="pagination.total"
                :current="pagination.current"
                :page-size="pagination.pageSize"
                @change="onPageChange"
                @page-size-change="onPageSizeChange"
              />
            </div>
          </template>
          <a-table
            v-else
            v-model:selected-keys="rowSelectKeys"
            :bordered="false"
            :columns="columns"
            :data="renderData"
            :loading="loading"
            :pagination="pagination"
            :row-selection="rowSelection"
            row-key="id"
            @page-change="onPageChange"
            @page-size-change="onPageSizeChange"
          >
            <template #name="{ record }">
              {{ record.name }}
            </template>
            <template #email_num="{ record }">
              {{ record.email_num }}
            </template>
            <template #operate="{ record }">
              <a-space>
                <a-tooltip content="编辑">
                  <a-link @click="EditMailBox(record.id)">
                    <icon-edit style="font-size:16" />
                  </a-link>
                </a-tooltip>
                <a-tooltip content="查看">
                  <a-link @click="
                    router.push({
                      name: 'MailBoxDetail',
                      params: { id: record.id },
                      query: { appendix: item.name, category: 'email'}
                    })
                  ">
                    <icon-eye style="font-size:16" />
                  </a-link>
                </a-tooltip>
              </a-space>
            </template>
          </a-table>
        </template>
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
              <a-input v-model="form.name"></a-input>
            </a-form-item>
            <!-- country -->
            <a-form-item label="国家/地区" field="country">
              <a-select v-model="form.country" :placeholder="$t('请选择')">
                <a-option value="china">中国</a-option>
                <a-option value="usa">美国</a-option>
              </a-select>
            </a-form-item>
            <!-- other_info -->
            <a-form-item label="其他信息" field="other_info">
              <a-input
                v-model="form.other_info"
                :placeholder="$t('请输入其他信息')"
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
    </div>
</template>

<script lang="ts" setup>
  import {
    Message,
    SelectOptionData,
    TableColumnData,
  } from '@arco-design/web-vue';
  import { useI18n } from 'vue-i18n';
  import { computed, onMounted, reactive, ref } from 'vue';
  import useLoading from '@/hooks/loading';
  import {
    createMailBox,
    deleteMailBox,
    queryMailBoxDetail,
    queryMailBoxList,
    MailBoxParams,
    MailBoxReq,
    MailBoxRes,
    updateMailBox,
    getEmailProviderDistribution,
    getMailboxRanking,
    EmailProviderDistributionItem,
    MailboxRankingItem,
  } from '@/api/mailbox';
  import { Pagination } from '@/types/global';
  import { useRouter } from 'vue-router';
  import { use, graphic } from 'echarts/core';
  import { CanvasRenderer } from 'echarts/renderers';
  import { PieChart, BarChart } from 'echarts/charts';
  import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
  } from 'echarts/components';
  import VChart from 'vue-echarts';
  import { useAppStore } from '@/store';
  import GmailIcon from '@/assets/svg/gmail.svg';
  import OutlookIcon from '@/assets/svg/outlook.svg';
  import EmailIcon from '@/assets/svg/email.svg';

  use([
    CanvasRenderer,
    PieChart,
    BarChart,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
  ]);

  const { t } = useI18n();
  const { loading, setLoading } = useLoading(true);
  const router = useRouter();
  const appStore = useAppStore();
  const viewType = ref(true);

  // 存储图表数据
  const mailboxRankingData = ref<MailboxRankingItem[]>([]);
  const emailProviderDistributionData = ref<EmailProviderDistributionItem[]>([]);

  // 获取邮箱类型分布数据
  const fetchEmailProviderDistribution = async () => {
    try {
      const res = await getEmailProviderDistribution();
      emailProviderDistributionData.value = res;
    } catch (error) {
      console.error('获取邮箱类型分布失败:', error);
    }
  };

  // 获取邮箱邮件数量排名数据
  const fetchMailboxRanking = async () => {
    try {
      const res = await getMailboxRanking();
      // 按邮件数量降序排序并取前5个
      mailboxRankingData.value = [...res]
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
    } catch (error) {
      console.error('获取邮箱邮件数量排名失败:', error);
    }
  };

  // 初始化图表数据
  const initChartData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchEmailProviderDistribution(),
        fetchMailboxRanking()
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 饼图选项
  const pieChartOption = computed(() => {
    return {
      tooltip: {
        trigger: 'item',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: {
          color: appStore.theme === 'dark' ? '#fff' : '#333',
        },
      },
      series: [
        {
          name: '邮件类型',
          type: 'pie',
          radius: '50%',
          data: emailProviderDistributionData.value.length > 0 
            ? emailProviderDistributionData.value 
            : [
                { value: 1048, name: 'Gmail' },
                { value: 735, name: 'Outlook' },
                { value: 580, name: 'Proton' },
                { value: 484, name: 'Other' },
              ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          label: {
            color: appStore.theme === 'dark' ? '#fff' : '#333',
          },
        },
      ],
      color: ['#2d6aDE', '#5ab1ef', '#d8e9f8', '#b9d4f4'],
    };
  });

  // 柱状图选项
  const barChartOption = computed(() => {
    const data = mailboxRankingData.value.length > 0 
      ? mailboxRankingData.value 
      : [
          { email: 'user1@example.com', count: 18203 },
          { email: 'user2@example.com', count: 23489 },
          { email: 'user3@example.com', count: 29034 },
          { email: 'user4@example.com', count: 104970 },
          { email: 'user5@example.com', count: 131744 },
        ];

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        boundaryGap: [0, 0.01],
        axisLabel: {
          color: appStore.theme === 'dark' ? '#fff' : '#333',
        },
      },
      yAxis: {
        type: 'category',
        data: data.map(item => item.email),
        axisLabel: {
          color: appStore.theme === 'dark' ? '#fff' : '#333',
          formatter: (value: string) => {
            // 如果邮箱地址太长，进行截断处理
            if (value.length > 20) {
              return value.substring(0, 20) + '...';
            }
            return value;
          }
        },
      },
      series: [
        {
          name: '邮件数量',
          type: 'bar',
          data: data.map(item => item.count),
          itemStyle: {
            color: new graphic.LinearGradient(1, 0, 0, 0, [
              { offset: 0, color: '#2d6aDE' },
              { offset: 1, color: '#5ab1ef' },
            ]),
          },
        },
      ],
    };
  });

  const getMailboxIcon = (name: string) => {
    if (name.toLowerCase().includes('gmail')) {
      return GmailIcon;
    }
    if (name.toLowerCase().includes('outlook')) {
      return OutlookIcon;
    }
    return EmailIcon;
  };

  const toggleSelection = (id: number) => {
    const index = rowSelectKeys.value.indexOf(id);
    if (index > -1) {
      rowSelectKeys.value.splice(index, 1);
    } else {
      rowSelectKeys.value.push(id);
    }
  };

  // 表单
  const generateFormModel = () => {
    return {
      name: undefined,
    };
  };
  const formModel = ref(generateFormModel());
  // 表格
  const renderData = ref<MailBoxRes[]>([]);
  const operateRow = ref<number>(0);
  const rowSelectKeys = ref<number[]>([]);
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
      width: 80,
    },
    {
      title: '邮箱',
      dataIndex: 'name',
      ellipsis: true,
      tooltip: true,
    },
    {
      title: '邮件数量',
      dataIndex: 'email_num',
      sortable: {
        sortDirections: ['ascend', 'descend']
      },
      width: 120
    },
    {
      title: '国家/地区',
      dataIndex: 'country',
      ellipsis: true,
      tooltip: true,
      width: 120
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
  const NewMailBox = () => {
    buttonStatus.value = 'new';
    drawerTitle.value = t('新增');
    resetForm(formDefaultValues);
    openNewOrEdit.value = true;
  };
  const EditMailBox = async (pk: number) => {
    buttonStatus.value = 'edit';
    operateRow.value = pk;
    drawerTitle.value = t('编辑');
    await fetchMailBoxDetail(pk);
    openNewOrEdit.value = true;
  };
  const DeleteMailBox = () => {
    drawerTitle.value = t('删除');
    openDelete.value = true;
  };

  // 对话框
  const openNewOrEdit = ref<boolean>(false);
  const openDelete = ref<boolean>(false);
  const drawerTitle = ref<string>('');
  const cancelReq = () => {
    openNewOrEdit.value = false;
    openDelete.value = false;
  };
  const formDefaultValues: MailBoxReq = {
    name: '',
  };
  const form = reactive<MailBoxReq>({ ...formDefaultValues });
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
        await createMailBox(form);
        cancelReq();
        Message.success(t('submit.create.success'));
        await fetchMailBoxList();
      } else {
        await updateMailBox(operateRow.value, form);
        cancelReq();
        Message.success(t('submit.update.success'));
        await fetchMailBoxList();
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
      await deleteMailBox({ pk: rowSelectKeys.value });
      cancelReq();
      Message.success(t('submit.delete.success'));
      await fetchMailBoxList();
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
  const fetchMailBoxList = async (params: MailBoxParams = {}) => {
    setLoading(true);
    try {
      const res = await queryMailBoxList(params);
      renderData.value = res.items;
      pagination.total = res.total;
      pagination.current = params.page;
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取数据
  onMounted(async () => {
    await Promise.all([
      fetchMailBoxList(),
      initChartData()
    ]);
  });


  // 请求部门详情
  const fetchMailBoxDetail = async (pk: number) => {
    setLoading(true);
    try {
      const res = await queryMailBoxDetail(pk);
      resetForm(res);
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // 事件: 分页
  const onPageChange = async (current: number) => {
    await fetchMailBoxList({ page: current, size: pagination.pageSize });
  };

  // 事件: 分页大小
  const onPageSizeChange = async (pageSize: number) => {
    pagination.pageSize = pageSize;
    await fetchMailBoxList({ page: 1, size: pageSize });
  };

  // 搜索
  const search = async () => {
    await fetchMailBoxList({
      ...formModel.value,
    } as unknown as MailBoxParams);
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
    name: 'MailBox',
  };
</script>
