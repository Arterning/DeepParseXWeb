<template>
  <div class="container">
    <a-card class="general-card">
    <div class="left-content" style="float: left; width: 45%;">
      <a-layout class="flex-layout">
      <!-- <Breadcrumb /> -->
      <a-card class="general-card">
      <a-row>
        <a-col :span="24">
          <h3>新闻关联</h3>
          <a-space direction="vertical" size="large" fill>
        <!-- 筛选条件 -->
        <a-row :gutter="16" align="center">
          <a-col :span="10">
            <a-input-search 
              v-model="searchKeyword"
              placeholder="输入关键词搜索"
              @search="handleSearch"
            />
          </a-col>
          <a-col :span="14">
            <a-range-picker
              v-model="dateRange"
              style="width: 100%"
              @change="handleDateChange"
            />
          </a-col>
        </a-row>

        <!-- 数据表格 -->
        <a-table 
          :columns="columns"
          :data="filteredData"
          :filter-icon-align-left="alignLeft"
          @sorter-change="handleSort"
        />
      </a-space>
        </a-col>
      </a-row>
    </a-card>
    <!-- <Footer /> -->
  </a-layout>
</div>
    <div class="right-content" style="float: left; width: 55%; padding-left: 20px; box-sizing: border-box;">
      <div class="wordCloudContainer">
      <div class="wordClouds"> </div>
    </div>
    <div class="second">
      <div id="pieChart" style="padding: 20px"></div>
      <div id="barChart" style="padding: 20px"></div>
    </div>
    <div class="third">
      <div id="barCharts" style="padding: 20px; height: 200px; width: 100%;"></div>
      <div id="popChart" style="padding: 20px; width: 100%;"></div>
    </div>
    </div>
  </a-card>
  </div>
  
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted, getCurrentInstance,computed } from 'vue';
// import { ref } from 'vue';
import Footer from '@/components/footer/index.vue';
import { Form, FormItem } from '@arco-design/web-vue';
import * as echarts from 'echarts'
import 'echarts-wordcloud'
import TagCloud from 'TagCloud';
// import { Chart } from '@antv/g2';

import router from "@/router";


// import Breadcrumb from '@/components/Breadcrumb.vue';
// 局部导入 Arco Design 组件
import { TableColumnData } from '@arco-design/web-vue/es/table/interface'; // 导入 
// 这里假设从父组件传递人物数据，实际中可以根据需求调整
// const props = defineProps(['info']);
// 在合适的位置添加这个类型声明

const current = ref(1);
const bottom = ref(false);
const data = ['123'];
const scrollbar = ref(true);

const props = defineProps({
  person: {
    type: Object,
    required: true
  }
});
  const alignLeft = ref(false);
// 假数据生成
const generateMockData = () => {
  const mockData = [];
  const keywords = ['发布会', '签约', '获奖', '合作', '战略', '融资', '产品'];
  const organizations = ['腾讯', '阿里', '百度', '字节跳动', '美团'];
  
  for (let i = 1; i <= 50; i+=1) {
    mockData.push({
      key: String(i),
      time: `2024-0${Math.ceil(i/10)}-${String(i%30+1).padStart(2, '0')}`, // 生成日期
      job: `${organizations[i%5]} ${keywords[i%7]}相关新闻记录 ${i}`,
      timestamp: new Date(2024, Math.floor(i/30), i%30).getTime()
    });
  }
  return mockData;
};
// 响应式数据
const rawData = reactive(generateMockData());
const searchKeyword = ref('');
const dateRange = ref<[Date | null, Date | null]>([null, null]);
const sortOrder = ref<'ascend' | 'descend'>('ascend');

// 处理排序
const handleSort = (dataIndex: string, order: string) => {
  sortOrder.value = order;
};


// 处理搜索
const handleSearch = (value: string) => {
  searchKeyword.value = value;
};

// 切换排序方式
const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'ascend' ? 'descend' : 'ascend';
};

const isValidDate = (d: unknown): d is Date => {
  return d instanceof Date && !Number.isNaN(d.getTime());
};
// 计算属性处理过滤和排序
const filteredData = computed(() => {
  return rawData
    .filter(item => {
      const matchesKeyword = item.job.toLowerCase().includes(searchKeyword.value.toLowerCase());
      
      // 处理日期范围类型
      const [start, end] = dateRange.value as [Date | undefined, Date | undefined];
      const itemDate = new Date(item.time);
      
      // 日期范围过滤逻辑
      let inDateRange = true;
      if (start && isValidDate(start)) {
        inDateRange = itemDate >= start;
      }
      if (end && isValidDate(end)) {
        inDateRange = inDateRange && itemDate <= end;
      }

      return matchesKeyword && inDateRange;
    })
    .sort((a, b) => {
      return sortOrder.value === 'ascend' 
        ? a.timestamp - b.timestamp 
        : b.timestamp - a.timestamp;
    });
});

// 处理日期变化事件
const handleDateChange = (dates: [Date | null, Date | null]) => {
  dateRange.value = dates;
};

// 表格列配置
const columns: TableColumnData[] = [
  {
    title: '时间',
    dataIndex: 'time',
    sortable: {
      sortDirections: ['ascend', 'descend']
    },
    width: 120
  },
  {
    title: '新闻内容',
    dataIndex: 'job',
    ellipsis: true,
    tooltip: true
  }
];

const currentCase = ref('Horizontal Tree');

  const relationVisible = ref(false);

  const container = '.wordClouds';
  const texts1 = [
    ' 111',
    ' 关键词2',
    ' 关键词3',
    ' 关键词4',
    ' 关键词5',
    ' 关键词6',
    ' 关键词7',
    ' 关键词8',
    ' 关键词9',
    ' 关键词10',
    ' lyw',
  ];
  const options1 = {
    containerClass: '__tagcloud',
    radius: 220,
    initSpeed: 0,
    maxSpeed: 0,
  };
  const options2 = {
    containerClass: '__tagcloud',
    radius: 200,
    initSpeed: 'slow',
    maxSpeed: 'slow',
  };
  const options3 = {
    containerClass: '__tagcloud',
    radius: 240,
    initSpeed: 0,
    maxSpeed: 0,
  };
  const options4 = {
    containerClass: '__tagcloud',
    radius: 200,
    initSpeed: 'slow',
    maxSpeed: 'slow',
  };
  const randomColor = () => {
    // 给定font 随机颜色
    const spans = document.querySelectorAll('.__tagcloud > span');

    spans.forEach((span) => {
      const hoverStyle = {
        backgroundColor: '#f4f5f8',
      };

      // 定义鼠标离开时的样式
      const defaultStyle = {
        backgroundColor: null,
      };

      // 设置默认样式
      Object.assign((span as HTMLSpanElement).style, defaultStyle);

      const hex = Math.floor(Math.random() * 0xffffff).toString(16);
      const Color = `#${`000000${hex}`.slice(-6)}`; // 保证返回的颜色值是6位
      (span as HTMLSpanElement).style.color = Color;
      (span as HTMLSpanElement).style.cursor = 'pointer';
      (span as HTMLSpanElement).addEventListener('click', () => {
        alert((span as HTMLSpanElement).innerText);
      });

      // 添加鼠标悬停事件监听器
      span.addEventListener('mouseenter', function () {
        Object.assign((span as HTMLSpanElement).style, hoverStyle);
      });

      // 添加鼠标离开事件监听器
      span.addEventListener('mouseleave', function () {
        Object.assign((span as HTMLSpanElement).style, defaultStyle);
      });
    });
  };

  onMounted(() => {
    TagCloud('.wordClouds', texts1, options1);
    initPieChart();
    initBarChart();
    initBarCharts();
    initPopChart();
    randomColor();
  });

  const initPieChart = () => {
    const myPieChart = echarts.init(document.getElementById('pieChart'));

    const option = {
      title: {
        text: '主题分类占比',
      },
      tooltip: {
        trigger: 'item',
      },
      legend: {
        orient: 'vertical',
        left: 'right',
        textStyle: {
        fontSize: 8 // 可根据需要调整字体大小
      }
      },
      series: [
        {
          name: '主题分类占比',
          type: 'pie',
          radius: ['30%', '50%'], // 内外圆的半径
          avoidLabelOverlap: false,

          emphasis: {
            label: {
              show: true,
              fontSize: '20',
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: [
            { value: 300, name: '主题1' },
            { value: 220, name: '主题2' },
            { value: 700, name: '主题3' },
            { value: 100, name: '主题4' },
            { value: 1800, name: '主题5' },
          ],
        },
      ],
    };

    myPieChart.setOption(option);
  };

    const initBarChart = () => {
    const myBarChart = echarts.init(document.getElementById('barChart'));

    const option = {
      title: {
        text: '媒体来源',
      },
      tooltip: {},
      legend: {
        data: ['test'],
      },
      xAxis: {
        data: ['媒体1', '媒体2', '媒体3', '媒体4', '媒体5', '媒体6'],
        axisLabel: {
        fontSize: 10 // 这里可以根据需要调整字体大小
      }
      },
      yAxis: {},
      series: [
        {
          name: '数量',
          type: 'bar',
          data: [18, 7, 4, 5, 9, 23],
          barWidth: 20, 
        },
      ],
    };
    myBarChart.setOption(option);
  };
  
  const chartRef = ref(null)
  const initBarCharts = () => {
  const myBarChart = echarts.init(document.getElementById('barCharts'));

  const option = {
    title: {
        text: '情感分布图'
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow'
        }
    },
    xAxis: {
        type: 'value',
        max: 60,
        min: 0,  // 明确设置最小值
        splitLine: {
            show: false
        },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false }
    },
    yAxis: {
        type: 'category',
        data: ['情绪1', '情绪2', '情绪3', '情绪4', '情绪5'], // 确保与数据项数量一致
        axisLabel: {
            fontSize: 12,
            margin: 20,  // 增加标签外边距
            padding: [0, 10] // 增加标签内边距
        },
        axisLine: { show: false },
        axisTick: { show: false },
        inverse: true  // 反转坐标轴让数据从顶部开始
    },
    series: [{
        name: '数量',
        type: 'bar',
        data: [
            { value: 56, itemStyle: { color: 'yellow' } },
            { value: 52, itemStyle: { color: 'pink' } },
            { value: 40, itemStyle: { color: 'blue' } },
            { value: 36, itemStyle: { color: 'red' } },
            { value: 30, itemStyle: { color: 'purple' } }
        ],
        barWidth: 12,  // 调整为固定像素值
        barGap: '40%', // 增大条间距
        barCategoryGap: '50%', // 增大类目间距
        label: {
            show: true,
            position: 'right',
            fontSize: 12,
            color: '#333',
            formatter: '{c}'
        },
        itemStyle: {
            borderRadius: [0, 6, 6, 0]
        }
    }],
    grid: {
        left: '5%',   // 增大左侧留白
        right: '20%',  // 增大右侧留白
        top: '20%',
        bottom: '15%',
        containLabel: true
    },
    // 添加动画配置
    animationDuration: 1000,
    animationEasing: 'cubicOut'
};
  myBarChart.resize();
  myBarChart.setOption(option);
};
  const initPopChart = () => {
    // if (!chartRef.value) return
    // const chartDom = chartRef.value;
    // const chartInstance = echarts.init(chartDom)
    const myPopChart = echarts.init(document.getElementById('popChart'));
    console.log("开始加载气泡图")
   
    const option = {
        title: {
          text: '新闻时间趋势'
        },
        xAxis: {
          type: 'value',
          name: 'X 轴',
          data: ['30', '31', '1', '2', '3', '4', '5', '6','7', '8', '9', '10', '11', '12', '13', '14', '15','16','17','18','19','20']

        },
        yAxis: {
          type: 'value',
          name: 'Y 轴',
          data: ['10','15','20','25','30','35','40']
        },
        tooltip: {
          formatter: (params: { seriesName: any; value: any[]; }) => {
            return `${params.seriesName}<br/>
                    X: ${params.value[0]}<br/>
                    Y: ${params.value[1]}<br/>
                    大小: ${params.value[2]}`
          }
        },
        visualMap: {
          show: false,
          dimension: 2, // 映射第三个维度（气泡大小）
          min: 1,
          max: 100,
          inRange: {
            symbolSize: [10, 50] // 气泡大小范围
          }
        },
        series: [{
          name: '数据系列',
          type: 'scatter',
          data: [
        {
          value: [5, 20, 30],
          itemStyle: {
            color: 'red' // 指定第一个气泡的颜色为红色
          }
        },
        {
          value: [7, 40, 25],
          itemStyle: {
            color: 'green' // 指定第二个气泡的颜色为绿色
          }
        },
        {
          value: [14, 30, 60],
          itemStyle: {
            color: 'blue' // 指定第三个气泡的颜色为蓝色
          }
        },
        {
          value: [15, 25, 80]
        },
        {
          value: [18, 10, 10]
        }
      ],
          // 气泡样式配置
          itemStyle: {
            color: '#2196F3',
            opacity: 0.8
          },
          // 气泡动画配置
          animationDuration: 200
        }]
      }
      myPopChart.setOption(option)

  //      // 添加防抖的 resize 监听
  //     const handleResize = () => {
  //     myPopChart.resize()
  // }
  // window.addEventListener('resize', handleResize)
      
      // // 窗口变化时自适应
      // window.addEventListener('resize', () => {
      //   myPopChart.resize()
      // })
  }


</script>

<style scoped>
/* 可根据需要添加样式 */
.chart-container {
  width: 100%;
  height: 80%;
  min-height: 600px;
  z-index: 1;
  overflow: hidden;
}
#barCharts {
  width: 60%;
  height: 150px;
}

#popChart {
  width: 100%;
  height: 300px;
}
 
.wordClouds {
    width: 100%;
    height: 100px;
  }
  /deep/.__tagcloud {
    width: 100% !important;
    height: 100% !important;
    font-size: 20px;
  }
  .second {
    width: 100%;
    display: flex;

    flex-direction: row;
    justify-content: space-between;
  }
  .second div {
    height: 400px;
    width: 100%;
  }
  .third {
    width: 100%;
    display: flex;

    flex-direction: column;
    justify-content: space-between;
  }
  .third div {
    height: auto;
    width: 100%;
  }

  .wordCloudContainer {
    height: 250px;
    display: flex;
  }

  .wordCloudContainer div {
    flex: 1;
  }
  .arco-col {
  margin-bottom: 12px;
}

/* 表格样式优化 */
:deep(.arco-table-th) {
  background-color: var(--color-fill-2);
}

:deep(.arco-table-tr):hover {
  background-color: var(--color-fill-1);
}

/* 响应式适配 */
@media (max-width: 768px) {
  .arco-col {
    width: 100%;
    margin-bottom: 8px;
  }
  
  .arco-range-picker {
    width: 100%;
  }
}

  /deep/.--tagcloud .tagcloud--item :hover {
    background-color: #999999 !important;
  }
</style>