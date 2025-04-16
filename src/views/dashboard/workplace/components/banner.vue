<template>
  <div class="main">
    <a-tabs default-active-key="1">
      <a-tab-pane key="1" title="热点事件">
        <div id="map" class="wordCloudContainer"> 
        </div>
        <div class="wordCloudContainer">
          <div class="wordCloud1"> </div>
          <div class="wordCloud2"> </div>
          <div class="wordCloud3"> </div>
          <div class="wordCloud4"> </div>
        </div>
      </a-tab-pane>
      <a-tab-pane key="2" title="情报统计">
        <div class="second">
          <div id="pieChart" style="background-color: #f4f5f8; padding: 20px"></div>
          <div id="barChart" style="background-color: #f4f5f8; padding: 20px"></div>
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts" setup>
  import * as echarts from 'echarts';
  import { onMounted, ref } from 'vue';
  import TagCloud from 'TagCloud';
  import china from '../../../../assets/jsonConfig/china.json';

  const texts1 = [
    ' G7峰会',
    ' 美国大选',
    ' 特朗普贸易战',
    ' 保护环境',
  ];
  const options1 = {
    containerClass: '__tagcloud',
    radius: 220,
    initSpeed: 'slow',
    maxSpeed: 'slow',
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
    initSpeed: 'slow',
    maxSpeed: 'slow',
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
    TagCloud('.wordCloud1', texts1, options1);
    TagCloud('.wordCloud2', texts1, options2);
    TagCloud('.wordCloud3', texts1, options3);
    TagCloud('.wordCloud4', texts1, options4);
    initPieChart();
    initBarChart();
    randomColor();
    chinaMap();
  });

  const initPieChart = () => {
    const myPieChart = echarts.init(document.getElementById('pieChart'));

    const option = {
      title: {
        text: '测试数据',
      },
      tooltip: {
        trigger: 'item',
      },
      legend: {
        orient: 'vertical',
        left: 'right',
      },
      series: [
        {
          name: '测试数据',
          type: 'pie',
          radius: ['40%', '70%'], // 内外圆的半径
          avoidLabelOverlap: false,

          emphasis: {
            label: {
              show: true,
              fontSize: '30',
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: [
            { value: 335, name: '测试数据1' },
            { value: 310, name: '测试数据2' },
            { value: 234, name: '测试数据3' },
            { value: 135, name: '测试数据4' },
            { value: 1548, name: '测试数据5' },
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
        text: '测试数据',
      },
      tooltip: {},
      legend: {
        data: ['test'],
      },
      xAxis: {
        data: ['测试1', '测试2', '测试3', '测试4', '测试5', '测试6'],
      },
      yAxis: {},
      series: [
        {
          name: '数量',
          type: 'bar',
          data: [5, 20, 36, 10, 10, 20],
        },
      ],
    };

    myBarChart.setOption(option);
  };

  const chinaMap = () => {
    const initMap = echarts.init(document.getElementById('map'));
    echarts.registerMap('world', china);

    const option = {
      title: {
        text: '',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}'
      },
      toolbox: {
        show: true,
        feature: {
          dataZoom: {
            yAxisIndex: 'none'
          },
          restore: {},
          saveAsImage: {}
        }
      },
      geo: {
        map: 'world',
        roam: true, // 开启缩放和平移
        zoom: 1.2, // 初始缩放级别
        label: {
          show: false // 默认不显示国家名称
        },
        itemStyle: {
          areaColor: '#e6f3ff',
          borderColor: '#00287F', // 国境线颜色
          borderWidth: 1 // 国境线宽度
        },
        emphasis: {
          label: {
            show: true // 悬停时显示国家名称
          },
          itemStyle: {
            areaColor: '#a5d8ff' // 悬停颜色
          }
        }
      },
      // 示例打点数据（可以自行修改或添加）
      series: [{
        type: 'scatter',
        coordinateSystem: 'geo',
        symbol: 'pin',
        symbolSize: 20,
        itemStyle: {
          color: '#D32F2F'
        },
        data: [
          { name: 'China', value: [116.46, 39.92, '北京'] },
          { name: 'United States', value: [-77.0365, 38.8951, '华盛顿'] },
          { name: 'France', value: [2.3522, 48.8566, '巴黎'] }
        ],
        tooltip: {
          formatter(params) {
            return params.data.value;
          }
        }
      }]
    };

    initMap.setOption(option);
  };
</script>

<style scoped>
  .main {
    width: 100%;
    height: 100%;
  }
  .wordCloud {
    width: 100%;
    height: 350px;
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

  .wordCloudContainer {
    height: 400px;
    display: flex;
  }

  .wordCloudContainer div {
    flex: 1;
  }

  /deep/.--tagcloud .tagcloud--item :hover {
    background-color: #999999 !important;
  }
</style>
