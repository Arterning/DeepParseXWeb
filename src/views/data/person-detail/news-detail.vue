<template>
  <div class="container">
    <a-card class="general-card">
    <div class="left-content" style="float: left; width: 40%;">
      <a-layout class="flex-layout">
      <!-- <Breadcrumb /> -->
      <a-card class="general-card">
     
      <a-row>
        <a-col :span="24">
          <h3>新闻关联</h3>
            <a-space direction="vertical" size="large" fill>
              <a-space>
                <a-switch v-model="alignLeft" />
                <span>Filter icon align left: {{alignLeft}}</span>
              </a-space>
              <a-table :columns="columns" :data-source="job" :filter-icon-align-left="alignLeft" />
            </a-space>
          <ul>
            
          </ul>
        </a-col>
      </a-row>
    </a-card>
    <!-- <Footer /> -->
  </a-layout>

    </div>
    <div class="right-content" style="float: left; width: 60%; padding-left: 20px; box-sizing: border-box;">
      <div class="wordCloudContainer">
      <div class="wordClouds"> </div>
    </div>
    <div class="second">
      <div id="pieChart" style="background-color: #f4f5f8; padding: 20px"></div>
      <div id="barChart" style="background-color: #f4f5f8; padding: 20px"></div>
    </div>
    <div class="third">
      <div id="barCharts" style="background-color: #f4f5f8; padding: 20px; width: 100%;"></div>
      <div id="popChart" style="background-color: #f4f5f8; padding: 20px; width: 100%;"></div>
    </div>
    </div>
  </a-card>
  </div>
  
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted, getCurrentInstance } from 'vue';
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
const lizi = [{
      label: '姓名',
      value: 'sjy',
    }, {
      label: '其他名称',
      value: 'ywlp',
    }, {
      label: '性别',
      value: '女'
    }, {
      label: '所属组织',
      value: 'Beijing',
    }, {
      label: '职位',
      value: 'zhanjie'
    }];

  const alignLeft = ref(false);

  const columns: TableColumnData[] = [
      {
        title: '工作时间',
        dataIndex: 'time',
        sortable: {
          sortDirections: ['ascend', 'descend']
        }
      },
      {
        title: '工作记录',
        dataIndex: 'job',
      },
    ];
    const job = reactive([{
      key: '1',
      time: '20240204',
      job: '工作了一阵子',
    }, {
      key: '2',
      time: '20240205',
      job: '又工作了一阵子',
    }, {
      key: '3',
      time: '20240206',
      job: '又又工作了一阵子',
    }, {
      key: '4',
      time: '20240207',
      job: '又又又工作了一阵子',
    }, {
      key: '5',
      time: '20240208',
      job: '又又又又工作了一阵子',
    }]);

    const fetchData = () => {
      console.log('reach bottom!');
      if (current.value <= 5) {
        window.setTimeout(() => {
          const index = data.length;
          data.push(
            `Beijing Bytedance Technology Co., Ltd. ${index + 1}`,
            `Bytedance Technology Co., Ltd. ${index + 2}`,
            `Beijing Toutiao Technology Co., Ltd. ${index + 3}`,
            `Beijing Volcengine Technology Co., Ltd. ${index + 4}`,
            `China Beijing Bytedance Technology Co., Ltd. ${index + 5}`
          );
          current.value += 1
        }, 2000)
      } else {
        bottom.value = true
      }
    }

    const goBack = () => {
  setTimeout(() => {
    router.push('/Echarts')
  }, 1000)
}

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
      text: '情感分布图',
    },
    tooltip: {},
    legend: {
      data: ['test'],
    },
    // 修改 xAxis 和 yAxis 的类型和数据
    xAxis: {
      type: 'value',
      axisLine: { show: false }, // 隐藏 x 轴轴线
      axisTick: { show: false }, // 隐藏 x 轴刻度
      axisLabel: { show: false }, // 隐藏 x 轴刻度标签
    },
    yAxis: {
      type: 'category',
      data: ['情绪1', '情绪2', '情绪3', '情绪4', '情绪5', '情绪6'],
      axisLabel: {
        fontSize: 7 // 这里可以根据需要调整字体大小
      }
    },
    series: [
      {
        name: '数量',
        type: 'bar',
        data: [
          {
            value: 56,
            itemStyle: {
              color: 'yellow'
            }
          },
          {
            value: 52,
            itemStyle: {
              color: 'pink'
            }
          },
          {
            value: 40,
            itemStyle: {
              color: 'blue'
            }
          },
          {
            value: 36,
            itemStyle: {
              color: 'red'
            }
          },
          {
            value: 30,
            itemStyle: {
              color: 'purple'
            }
          },
        ],
        barWidth: 10,
        label: {
          show: true,
          position: 'right', // 将数值显示在柱的右侧（柱头）
          valueAnimation: true // 开启数值动画
        }
      },
    ],
  };
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
          text: '气泡图示例'
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

  /deep/.--tagcloud .tagcloud--item :hover {
    background-color: #999999 !important;
  }
</style>