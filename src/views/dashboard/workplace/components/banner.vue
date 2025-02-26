<template>
  <div class="main">
    <div class="wordCloud"> </div>
    <div class="second">
      <div id="pieChart" style="background-color: #f4f5f8"></div>
      <div id="barChart" style="background-color: #f4f5f8"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import * as echarts from 'echarts';
  import { onMounted } from 'vue';
  import TagCloud from 'TagCloud';



    const container = '.wordCloud';
  const texts = [
    ' 紅樓夢',
    ' 賈寶玉',
    ' 薛寶釵',
    ' 王熙鳳',
    ' 李紈',
    ' 賈元春',
    ' 賈迎春',
    ' 賈探春',
    ' 秦可卿',
    ' 林黛玉',
    ' 賈巧姐',
    ' 賈惜春',
    ' 紅樓夢',
    ' 賈寶玉',
    ' 薛寶釵',
    ' 王熙鳳',
    ' 李紈',
    ' 賈元春',
    ' 賈迎春',
    ' 賈探春',
    ' 秦可卿',
    ' 林黛玉',
    ' 賈巧姐',
    ' 賈惜春',
    ' 紅樓夢',
    ' 賈寶玉',
    ' 薛寶釵',
    ' 王熙鳳',
    ' 李紈',
    ' 賈元春',
    ' 賈迎春',
    ' 賈探春',
    ' 秦可卿',
    ' 林黛玉',
    ' 賈巧姐',
    ' 賈惜春',
    ' 史湘雲',
    ' 妙玉',
    ' 賈政',
    ' 賈赦',
    ' 賈璉',
    ' 賈珍',
    ' 賈環',
    ' 賈母',
    ' 王夫人',
    ' 薛姨媽',
    ' 尤氏',
    ' 平兒',
    ' 秦可卿',
    ' 林黛玉',
    ' 賈巧姐',
    ' 賈惜春',
    ' 史湘雲',
    ' 妙玉',
    ' 賈政',
    ' 賈赦',
    ' 賈璉',
    ' 賈珍',
    ' 賈環',
    ' 賈母',
    ' 王夫人',
    ' 薛姨媽',
    ' 尤氏',
    ' 平兒',
  ];
  const options = {
    containerClass: '__tagcloud',
    radius: 200,
    initSpeed: 'slow',
    maxSpeed: 'slow',
  };

  const randomColor = () => {
    // 给定font 随机颜色
    const spans = document.querySelectorAll('.__tagcloud > span');
    console.log(spans);

    spans.forEach((span) => {
      const hex = Math.floor(Math.random() * 0xffffff).toString(16);
      const Color = `#${`000000${hex}`.slice(-6)}`; // 保证返回的颜色值是6位
      span.style.color = Color;
    });
  };

  onMounted(() => {
    TagCloud(container, texts, options);
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
    //background-color: pink;
  }
  /deep/.__tagcloud {
    width: 100% !important;
    height: 100% !important;
    font-size: 20px;
  }
  .second {
    width: 100%;
    //background-color: yellow;
    display: flex;

    flex-direction: row;
    justify-content: space-between;
  }
  .second div {
    height: 400px;
    width: 100%;
  }
</style>
