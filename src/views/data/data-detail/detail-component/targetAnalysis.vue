<template>
  <div class="flex">
    <!-- 左侧列表 -->
    <div class="w-1/4 p-4">
      <a-card>
        <a-list>
          <a-list-item v-for="(item, index) in users" :key="index">
            <div class="flex flex-row items-center gap-5">
              <a-checkbox
                v-model="selectedUsers"
                :value="item.email"
              ></a-checkbox>
              <a-avatar>
                <img
                  :src="item.avatarUrl"
                  alt="头像"
                  width="100%"
                  height="100%"
                />
              </a-avatar>
              <div class="ml-4">
                <div>{{ item.name }}</div>
                <div class="text-sm text-gray-500">{{ item.email }}</div>
                <div class="text-sm text-gray-500">{{ item.region }}</div>
              </div>
            </div>
          </a-list-item>
        </a-list>
        <a-button type="primary" class="mt-5 w-full" @click="startAnalysis"
          >开始分析</a-button
        >
      </a-card>
    </div>

    <!-- 右侧图表 -->
    <div class="w-3/4 p-4">
      <a-card>
        <a-tabs default-active-key="1">
          <a-tab-pane key="1" title="邮件路径分析">
            <div
              id="email-relationship-chart"
              style="flex: 1; height: 700px"
            ></div>
          </a-tab-pane>
          <a-tab-pane key="2" title="时空轨迹图">
            <div id="time-space-chart" style="flex: 1; height: 700px"></div>
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import * as echarts from 'echarts';
  import chinaCountry from '../../../../assets/jsonConfig/chinaCountry.json';

  echarts.registerMap('chinaCountry', chinaCountry);

  interface User {
    name: string;
    email: string;
    region: string;
    avatarUrl: string;
  }

  const users = ref<User[]>([
    {
      name: '特朗普',
      email: '688@qq.com',
      avatarUrl:
        'https://pic.rmb.bdstatic.com/bjh/bb84bb8e736/241110/ea0db58190ba332273ff981cfe0b7e50.png',
      region: '国家/地区: 1区',
    },
    {
      name: '拜登',
      email: '688345676543@qq.com',
      avatarUrl:
        'https://pic.rmb.bdstatic.com/bjh/other/cf065ec15610785f573aaf29d7a2134e.jpeg?for=bg',
      region: '国家/地区: 1区',
    },
    {
      name: '马克龙',
      email: '6883456ee76543@qq.com',
      avatarUrl:
        'https://pic.rmb.bdstatic.com/bjh/other/cf065ec15610785f573aaf29d7a2134e.jpeg?for=bg',
      region: '国家/地区: 1区',
    },
  ]);
  const selectedUsers = ref<string[]>([]);

  const initChart = () => {
    const chartDom = document.getElementById('email-relationship-chart');
    if (chartDom) {
      const myChart = echarts.init(chartDom);
      const option = {
        title: {
          text: '人物邮件关系图',
        },
        tooltip: {},
        series: [
          {
            type: 'graph',
            layout: 'force',
            data: users.value.map((user) => ({
              name: user.name,
              symbolSize: 60,
              symbolOffset: [0, 0],
              symbolRotate: null,
              symbolKeepAspect: true,
              symbol: `image://${user.avatarUrl}`,
              symbolClip: true,
              symbolBorderRadius: '50%',
            })),
            links: [
              {
                source: '特朗普',
                target: '普京',
                label: {
                  show: true,
                  position: 'middle',
                  formatter: '邮件回复1',
                },
                lineStyle: { curveness: 0.2 },
                symbol: ['none', 'arrow'],
                symbolSize: [0, 10],
              },
              {
                source: '特朗普',
                target: '拜登',
                label: {
                  show: true,
                  position: 'middle',
                  formatter: '邮件回复2',
                },
                lineStyle: { curveness: -0.2 },
                symbol: ['none', 'arrow'],
                symbolSize: [0, 10],
              },
              {
                source: '特朗普',
                target: '马克龙',
                label: {
                  show: true,
                  position: 'middle',
                  formatter: '邮件回复3',
                },
                lineStyle: { curveness: 0.3 },
                symbol: ['none', 'arrow'],
                symbolSize: [0, 10],
              },
              {
                source: '拜登',
                target: '普京',
                label: {
                  show: true,
                  position: 'middle',
                  formatter: '邮件回复4',
                },
                lineStyle: { curveness: -0.3 },
                symbol: ['none', 'arrow'],
                symbolSize: [0, 10],
              },
              {
                source: '拜登',
                target: '马克龙',
                label: {
                  show: true,
                  position: 'middle',
                  formatter: '邮件回复5',
                },
                lineStyle: { curveness: 0.4 },
                symbol: ['none', 'arrow'],
                symbolSize: [0, 10],
              },
              {
                source: '普京',
                target: 'mzd',
                label: {
                  show: true,
                  position: 'middle',
                  formatter: '邮件转发',
                },
                lineStyle: { curveness: -0.4 },
                symbol: ['none', 'arrow'],
                symbolSize: [0, 10],
              },
            ],
            force: {
              repulsion: 5000,
              edgeLength: 100,
              layoutAnimation: true,
            },
          },
        ],
      };
      myChart.setOption(option);
    }
  };

  const initTimeSpaceChart = () => {
    const chartDom = document.getElementById('time-space-chart');
    if (chartDom) {
      const myChart = echarts.init(chartDom);
      const option = {
        title: {
          text: '时空轨迹图',
        },
        tooltip: {},
        geo: {
          map: 'chinaCountry',
          roam: true,
          zoom: 1.2,
          itemStyle: {
            areaColor: '#f0f0f0', // 更清爽的地图背景色
            borderColor: '#ccc', // 更浅的边框颜色
          }
        },
        series: [
          {
            type: 'lines',
            coordinateSystem: 'geo',
            curveness: 0.5, // 调整弯曲度
            data: [
              {
                coords: [
                  [116.4074, 39.9042], // 北京
                  [121.4737, 31.2304], // 上海
                ],
              },
            ],
            lineStyle: {
              color: '#b6a2de',
              opacity: 0.6,
              width: 2,
            },
          },
          {
            type: 'effectScatter',
            coordinateSystem: 'geo',
            data: [
              {
                name: '北京',
                value: [116.4074, 39.9042],
              },
              {
                name: '上海',
                value: [121.4737, 31.2304],
              },
            ],
            symbolSize: 10,
            itemStyle: {
              color: '#f00',
            },
          },
        ],
      };
      myChart.setOption(option);
    }
  };

  const startAnalysis = () => {
    console.log('开始分析');
    initChart();
    initTimeSpaceChart();
  };

  onMounted(() => {
    if (selectedUsers.value.length > 0) {
      startAnalysis();
    }
  });
</script>

<style scoped>
  .flex {
    display: flex;
  }
  .w-1\/4 {
    width: 25%;
  }
  .w-3\/4 {
    width: 75%;
  }
  .p-4 {
    padding: 1rem;
  }
</style>
