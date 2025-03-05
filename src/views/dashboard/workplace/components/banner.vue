<template>
  <div class="main">
    <div class="wordCloudContainer">
      <div class="wordCloud1"> </div>
      <div class="wordCloud2"> </div>
      <div class="wordCloud3"> </div>
      <div class="wordCloud4"> </div>
    </div>
    <div class="second">
      <div id="pieChart" style="background-color: #f4f5f8; padding: 20px"></div>
      <div id="barChart" style="background-color: #f4f5f8; padding: 20px"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import * as echarts from 'echarts';
  import { onMounted, ref } from 'vue';
  import TagCloud from 'TagCloud';

  const currentCase = ref('Horizontal Tree');

  const relationVisible = ref(false);

  const container = '.wordCloud1';
  const texts1 = [
    ' 紅樓夢',
    ' 賈寶玉',
    ' 薛寶釵',
    ' 王熙鳳',
    ' 李紈',
    ' 賈元春',
    ' 紅樓夢',
    ' 賈寶玉',
    ' 薛寶釵',
    ' 王熙鳳',
    ' 李紈',
    ' 賈元春',
  ];
  const options1 = {
    containerClass: '__tagcloud',
    radius: 220,
    initSpeed:'slow',
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
