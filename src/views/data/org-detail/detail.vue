<template>
  <div class="mainBody">
    <!--    组织信息修改表单-->
    <a-modal
      v-model:visible="orgVisible"
      title="修改组织信息"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-form
        :model="form"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 14 }"
      >
        <a-form-item label="组织地点">
          <a-input v-model="form.location" />
        </a-form-item>
        <a-form-item label="文件数量">
          <a-input-number v-model="form.fileCount" />
        </a-form-item>
        <a-form-item label="创建时间">
          <a-date-picker v-model="form.createTime" show-time />
        </a-form-item>
        <a-form-item label="组织标签">
          <a-select v-model="form.tags" mode="tags" style="width: 100%">
            <a-select-option v-for="tag in tagOptions" :key="tag" :value="tag">
              {{ tag }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="组织介绍">
          <a-textarea v-model="form.introduction" :rows="4" />
        </a-form-item>
      </a-form>
    </a-modal>
    <h1 class="text-4xl my-[15px]">{{ organizationInfo.org_name }}</h1>
    <div class="mainContent">
      <div class="contentItem relative">
        <a-button type="dashed" class="absolute z-50 right-0" @click="saveOrgTree">保存</a-button>
        <vue3-tree-org
          :data="organizationInfo.org_structure"
          center
          :horizontal="false"
          :collapsable="false"
        />
      </div>
      <div class="contentItem relative">
        <div class="cursor-pointer absolute right-0" @click="orgVisible = true">
          <icon-edit size="30" />
        </div>
        <a-row :gutter="24">
          <!-- 左侧大图 -->
          <a-col :span="12">
            <a-image
              src="https://pic.rmb.bdstatic.com/4bd087cb5bb5d810a13d9662f4398be8.jpg@h_1280"
              width="100%"
              height="100%"
              :preview="false"
              :style="{ borderRadius: '6px' }"
            />
          </a-col>

          <!-- 右侧信息 -->
          <a-col :span="12">
            <a-descriptions
              :column="1"
              bordered
              layout="inline-vertical"
              :label-style="{ fontWeight: 500, color: '#1D2129' }"
            >
              <!-- 组织地点 -->
              <a-descriptions-item :label="'组织地点:'">
                {{ organizationInfo.org_location }}
              </a-descriptions-item>

              <!-- 文件数量 -->
              <a-descriptions-item :label="'文件数量:'">
                {{ organizationInfo.org_file_nums }} 个
              </a-descriptions-item>

              <!-- 创建时间 -->
              <a-descriptions-item :label="'创建时间:'">
                {{ organizationInfo.created_time }}
              </a-descriptions-item>

              <!-- 组织标签 -->
              <a-descriptions-item :label="'组织标签:'">
                <a-space>
                  <a-tag
                    v-for="(tag, index) in organizationInfo.org_tag"
                    :key="index"
                    color="arcoblue"
                  >
                    {{ tag }}
                  </a-tag>
                </a-space>
              </a-descriptions-item>

              <!-- 组织介绍 -->
              <a-descriptions-item :label="'组织介绍:'">
                <div style="color: #4e5969; line-height: 1.6">
                  {{ organizationInfo.org_introduce }}
                </div>
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
        </a-row>
      </div>
      <div class="contentItem">
        <p class="text-xl my-[15px]">组织成员</p>
        <div class="ml-[10px] flex">
          <div class="flex my-[15px]">
            男 &nbsp;
            <div class="oneCharts"></div>
            &nbsp;女
          </div>
          <div class="flex my-[15px] ml-[100px]">
            年龄比例 &nbsp;
            <div class="twoCharts"></div>
          </div>
        </div>
        <a-table :columns="columns" :data="data" size="large" />
      </div>
      <div class="contentItem">
        <a-tabs default-active-key="2">
          <a-tab-pane key="1" title="组织活动">
            <div id="map" class="activity"></div>
          </a-tab-pane>
          <a-tab-pane key="2" title="组织新闻">
            <a-table :columns="columns" :data="data" size="large" />
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Notification } from '@arco-design/web-vue';
  import {
    ref,
    onMounted,
    reactive,
    computed,
    watch,
    onBeforeMount,
    nextTick,
  } from 'vue';
  import * as echarts from 'echarts';
  import orgStore from '@/store/modules/org';
  import { orgFormType } from '@/store/modules/org/types';
  import { Vue3TreeOrg } from 'vue3-tree-org';
  import { updateSysOrg } from '@/api/org';
  import org from '@/store/modules/org';
  import china from '../../../assets/jsonConfig/china.json';

  const props = defineProps(['info']);

  // 组织数据
  const organizationInfo = reactive<orgFormType>({
    name: '',
    org_file_nums: 0,
    org_assets_nums: 0,
    org_desc: '',
    org_location: '',
    org_introduce: '',
    org_structure: '',
    org_tag: '',
    docs: [],
    assets: [],
    org_name: '',
    id: 0,
  });

  const dataRalation = reactive({
    label: '组织架构图默认根节点',
  });
  // watch(
  //   () => dataRalation,
  //   async (v) => {
  //     // console.log(v);
  //     organizationInfo.org_structure = JSON.stringify(v);
  //     organizationInfo.org_tag = JSON.stringify(organizationInfo.org_tag);
  //     await updateSysOrg(props.info.id, organizationInfo);
  //     organizationInfo.org_tag = JSON.parse(organizationInfo.org_tag);
  //   },
  //   {
  //     deep: true,
  //   }
  // );

  const saveOrgTree = async () => {
    organizationInfo.org_structure = JSON.stringify(organizationInfo.org_structure);
    organizationInfo.org_tag = JSON.stringify(organizationInfo.org_tag);
    const res = await updateSysOrg(props.info.id, organizationInfo);
    organizationInfo.org_tag = JSON.parse(organizationInfo.org_tag);
    organizationInfo.org_structure = JSON.parse(organizationInfo.org_structure);
    Notification.success({
      title: '保存成功！',
      content: '保存组织架构图成功',
    })
  }

  const newsList = [
    {
      title: '新闻二',
      dyc: '动态二',
      time: '2004.11.12',
    },
    {
      title: '新闻三',
      dyc: '动态三',
      time: '2004.11.12',
    },
    {
      title: '新闻一',
      dyc: '动态一',
      time: '2004.11.12',
    },
  ];

  const initRedarCharts = () => {
    const myChart = echarts.init(document.getElementById('redar'));

    // 雷达图配置项
    const option = {
      title: {
        text: '组织能力',
      },
      legend: {
        data: ['Allocated Budget', 'Actual Spending'],
      },
      radar: {
        // shape: 'circle',
        indicator: [
          { name: 'Sales', max: 6500 },
          { name: 'Administration', max: 16000 },
          { name: 'Information Technology', max: 30000 },
          { name: 'Customer Support', max: 38000 },
          { name: 'Development', max: 52000 },
          { name: 'Marketing', max: 25000 },
        ],
      },
      series: [
        {
          name: 'Budget vs spending',
          type: 'radar',
          data: [
            {
              value: [4200, 3000, 20000, 35000, 50000, 18000],
              name: 'Allocated Budget',
            },
            {
              value: [5000, 14000, 28000, 26000, 42000, 21000],
              name: 'Actual Spending',
            },
          ],
        },
      ],
    };

    myChart.setOption(option);
  };

  onMounted(() => {
    // initRedarCharts();
    chinaMap();
    const storeData = orgStore().getForm();
    console.log('1231');
    // console.log(storeData)
    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    for (const storeDataKey in storeData) {
      organizationInfo[storeDataKey] = storeData[storeDataKey];
    }
    organizationInfo.org_tag = JSON.parse(organizationInfo.org_tag);
    console.log(organizationInfo);
    if(organizationInfo.org_structure === '' || organizationInfo.org_structure === null || organizationInfo. org_structure === undefined) {
      organizationInfo.org_structure = {
        label: '组织架构图默认根节点',
      }
    } else {
      organizationInfo.org_structure = JSON.parse(
        organizationInfo.org_structure
      );
    }
  });
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
    },
    {
      title: '性别',
      dataIndex: 'salary',
    },
    {
      title: '年龄',
      dataIndex: 'address',
    },
    {
      title: '毕业高校',
      dataIndex: 'email',
    },
  ];
  const data = reactive([
    {
      key: '1',
      name: 'Jane Doe',
      salary: 23000,
      address: '32 Park Road, London',
      email: 'jane.doe@example.com',
    },
    {
      key: '2',
      name: 'Alisa Ross',
      salary: 25000,
      address: '35 Park Road, London',
      email: 'alisa.ross@example.com',
    },
    {
      key: '3',
      name: 'Kevin Sandra',
      salary: 22000,
      address: '31 Park Road, London',
      email: 'kevin.sandra@example.com',
    },
    {
      key: '4',
      name: 'Ed Hellen',
      salary: 17000,
      address: '42 Park Road, London',
      email: 'ed.hellen@example.com',
    },
    {
      key: '5',
      name: 'William Smith',
      salary: 27000,
      address: '62 Park Road, London',
      email: 'william.smith@example.com',
    },
  ]);

  const chinaMap = () => {
    const initMap = echarts.init(document.getElementById('map'));
    echarts.registerMap('china', china);
    const options = {
      title: {
        text: '中国地图',
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}<br/>{c} (销量)',
      },
      toolbox: {
        show: true,
        orient: 'vertical',
        left: 'right',
        top: 'center',
        feature: {
          dataView: { readOnly: false },
          restore: {},
          saveAsImage: {},
        },
      },
      visualMap: {
        min: 0,
        max: 1000,
        text: ['High', 'Low'],
        realtime: false,
        calculable: true,
        inRange: {
          color: ['lightskyblue', 'yellow', 'orangered'],
        },
      },
      // geo: {
      //   map: 'china',
      // },
      series: [
        {
          coordinateSystem: 'geo',
          name: '中国',
          type: 'map',
          mapLocation: { x: '0%', y: '0%', width: '100%', height: '140%' },
          map: 'china',
          label: {
            show: false,
          },
          data: [
            { name: '北京市', value: 200 },
            { name: '天津市', value: 320 },
            { name: '河北省', value: 240 },
            { name: '山西省', value: 520 },
            { name: '内蒙古自治区', value: 120 },
            { name: '辽宁省', value: 210 },
            { name: '吉林省', value: 620 },
            { name: '黑龙江省', value: 20 },
            { name: '上海市', value: 220 },
            { name: '江苏省', value: 820 },
            { name: '浙江省', value: 320 },
            { name: '安徽省', value: 520 },
            { name: '福建省', value: 120 },
            { name: '江西省', value: 620 },
            { name: '山东省', value: 920 },
            { name: '河南省', value: 220 },
            { name: '湖北省', value: 720 },
            { name: '湖南省', value: 210 },
            { name: '广东省', value: 20 },
            { name: '广西壮族自治区', value: 20 },
            { name: '海南省', value: 240 },
            { name: '重庆市', value: 20 },
            { name: '四川省', value: 240 },
            { name: '贵州省', value: 420 },
            { name: '云南省', value: 320 },
            { name: '西藏自治区', value: 20 },
            { name: '陕西省', value: 240 },
            { name: '甘肃省', value: 920 },
            { name: '青海省', value: 720 },
            { name: '宁夏回族自治区', value: 120 },
            { name: '新疆维吾尔自治区', value: 420 },
            { name: '台湾省', value: 230 },
            { name: '香港特别行政区', value: 420 },
            { name: '澳门特别行政区', value: 210 },
          ],
        },
      ],
    };

    initMap.setOption(options);
  };

  // 组织修改表单
  const form = reactive({
    location: '',
    fileCount: 0,
    createTime: '',
    tags: [],
    introduction: '',
  });

  const orgVisible = ref(false);

  const handleOk = () => {
    // 在这里处理表单提交逻辑
    console.log('提交的表单数据：', form);
    orgVisible.value = false;
  };

  const handleCancel = () => {
    orgVisible.value = false;
  };
</script>

<style scoped lang="less">
  .mainBody {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .mainBody .leftContainer,
  .rightContainer {
    flex: 1;
  }

  .leftContainer {
    .structure {
      height: 700px;
    }
    .structureEmp {
      margin-top: 15px;
      background-color: #e5e5e5;
      height: 700px;
    }
  }

  /* 柔和阴影悬浮 */
  .float-shadow {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);
  }

  /* 调整单元格内边距 */
  /deep/.structureEmp .arco-table-td {
    padding: 20px 20px;
  }

  .oneCharts {
    width: 180px;
    height: 20px;
    //background-color: red;
    background-color: #e5e5e5;
    border-radius: 10px;
  }

  .twoCharts {
    width: 400px;
    height: 20px;
    //background-color: red;
    background-color: #e5e5e5;
    border-radius: 10px;
  }

  .header {
    line-height: 50px;
  }

  .introduce {
    width: 100%;
    //background-color: yellow;
  }
  .activity {
    border-radius: 20px;
  }
  .dynamics {
    height: 180px;
    border-radius: 20px;
    //background-color: yellow;
    background-color: #e5e5e5;
    margin-top: 20px;
  }
  .activity {
    height: 450px;
    //background-color: red;
    background-color: #e5e5e5;
    border-radius: 20px;
    margin-top: 20px;
  }
  .capacity {
    height: 500px;
    border-radius: 20px;
    margin-top: 20px;
  }
  .circle {
    width: 12px;
    height: 12px;
    display: inline-block;
    //background-color: hotpink;
    background-color: #e5e5e5;
    border-radius: 50%;
  }

  .card {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .edit-button {
    margin-left: auto;
  }

  .content {
    line-height: 1.6;
  }

  .organization-card {
    display: flex;
    border-radius: 8px;
    overflow: hidden;
    flex-direction: row;
  }

  .image-section {
    width: 200px;
    height: 200px;
    background-color: #f5f5dc;
    //align-items: center;
    //justify-content: center;
    font-size: 24px;
    color: #333;
  }

  .info-section {
    padding: 20px;
  }

  .info-descriptions {
    line-height: 1.6;
  }

  /deep/.arco-card-body {
    width: 100%;
    display: flex;
  }

  .tree-org-node__text {
    text-align: left;
    font-size: 14px;
    .custom-content {
      padding-bottom: 8px;
      margin-bottom: 8px;
      border-bottom: 1px solid currentColor;
    }
  }

  .mainContent {
    width: 100%;
    //height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr; /* 两列，每列占用可用空间的一部分 */
    grid-template-rows: auto auto; /* 两行，根据内容自动调整高度 */
    gap: 10px; /* 网格项之间的间隔 */
  }

  .mainContent .contentItem {
    background-color: #f0f0f0; /* 网格项的背景颜色 */
    border: 1px solid #ccc; /* 网格项的边框 */
  }
</style>
