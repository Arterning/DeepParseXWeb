<template>
  <div class="mainBody">
    <div class="leftContainer">
      <h1 class="text-4xl my-[15px]">组织名称xxxxxxxx </h1>
      <div class="structure rounded-lg float-shadow" style="padding: 10px">
        <div class="w-full h-full">
          <vue3-tree-org
              :data="dataRalation"
              :horizontal="horizontal"
              :collapsable="collapsable"
              :label-style="style"
              :node-draggable="true"
              :scalable="false"
              :only-one-node="onlyOneNode"
              :default-expand-level="1"
              :clone-node-drag="cloneNodeDrag"
              @on-contextmenu="onMenus"
              @on-node-click="onNodeClick"
          >
            <!-- 自定义节点内容 -->
            <template #default="{ node }">
              <div class="tree-org-node__text node-label">
                <div class="custom-content">自定义内容</div>
                <div>节点名称：{{ node.label }}</div>
              </div>
            </template>
            <!-- 自定义展开按钮 -->
            <template #expand="{ node }">
              <div>{{ node.children.length }}</div>
            </template>
          </vue3-tree-org>
        </div>
      </div>
      <div class="structureEmp rounded-lg float-shadow">
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
    </div>
    <div class="rightContainer pl-[15px] pt-[60px]">
      <div class="introduce">
        <a-card class="organization-card" style="width: 100%">
          <div class="image-section">
            <span>照片</span>
          </div>
          <div class="info-section">
            <a-descriptions title="" :column="1" class="info-descriptions">
              <a-descriptions-item label="组织地点">
                sdffffffffffff
              </a-descriptions-item>
              <a-descriptions-item label="组织文件数量">
                sdfffffffffffff
              </a-descriptions-item>
              <a-descriptions-item label="组织创建时间">
                gddddddddddddddddddf
              </a-descriptions-item>
              <a-descriptions-item label="组织标签">
                <a-tag color="blue">dfgdg</a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="组织介绍">
                fdgdg
              </a-descriptions-item>
            </a-descriptions>
          </div>
        </a-card>
      </div>
      <div class="dynamics">
        <div class="header h-[50px] w-full text-xl pl-[10px]"> 组织动态 </div>
        <div class="listBody">
          <div
              v-for="(item, index) in newsList"
              :key="index"
              class="h-[40px] leading-10 text-sm flex justify-between pl-[10px] pr-[10px]"
              style="background-color: pink; align-items: center"
          >
            <span>
              {{ item.title }}
            </span>
            <span>
              <span class="circle"></span>
              &nbsp;
              <span class="mr-[40px]"> {{ item.dyc }}</span>
              <span>
                {{ item.time }}
              </span>
            </span>
          </div>
        </div>
      </div>
      <div id="map" class="activity"></div>
      <div class="capacity" style="padding: 10px">
        <div id="redar" class="w-full h-full"> </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive } from 'vue';
import * as echarts from 'echarts';
import china from '../../../assets/jsonConfig/china.json';

const props = defineProps(['info']);

const dataRalation = reactive({
  id: 1,
  label: 'xxx科技有限公司',
  children: [
    {
      id: 2,
      pid: 1,
      label: '产品研发部',
      style: { color: '#fff', background: '#108ffe' },
      children: [
        { id: 6, pid: 2, label: '禁止编辑节点', disabled: true },
        { id: 8, pid: 2, label: '禁止拖拽节点', noDragging: true },
        { id: 10, pid: 2, label: '测试' },
      ],
    },
    {
      id: 3,
      pid: 1,
      label: '客服部',
      children: [
        { id: 11, pid: 3, label: '客服一部' },
        { id: 12, pid: 3, label: '客服二部' },
      ],
    },
    { id: 4, pid: 1, label: '业务部' },
  ],
});

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
  initRedarCharts();
  chinaMap();
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
</script>

<style scoped lang="less">
.mainBody {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
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
</style>
