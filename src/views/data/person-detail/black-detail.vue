<template>
  <div class="container">
    <a-card class="general-card">
    <div class="left-content" style="float: left; width: 50%;">
      <a-layout class="flex-layout">
      <!-- <Breadcrumb /> -->
      <a-card class="general-card">
      <a-divider />
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
    <div class="right-content" style="float: left; width: 50%; padding-left: 20px; box-sizing: border-box;">
      <!-- <div style="margin-bottom: 10px">
        <a-switch v-model="scrollbar" />
          Virtual Scrollbar
      </div> -->
      <a-layout class="flex-layout">
        <a-card class="general-card">
        <a-list :max-height="240" @reach-bottom="fetchData" :scrollbar="scrollbar">
          <template #header>
            List title
          </template>
          <template #scroll-loading>
            <div v-if="bottom">No more data</div>
            <a-spin v-else />
          </template>
          <a-list-item v-for="item of data" :key="item">{{item}}</a-list-item>
        </a-list>
        <a-divider />
      <a-row>
        <a-col :span="24">
          <h3>工作关系图谱</h3>
            <a-space direction="vertical" size="large" fill>
              <a-space>
                
              </a-space>
            </a-space>
          <ul>
            
          </ul>
        </a-col>
      </a-row>

      </a-card>
      </a-layout>
    </div>
  </a-card>
  </div>
  
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
// import { ref } from 'vue';
import Footer from '@/components/footer/index.vue';
import { Form, FormItem } from '@arco-design/web-vue';

// import Breadcrumb from '@/components/Breadcrumb.vue';
// 局部导入 Arco Design 组件
import { TableColumnData } from '@arco-design/web-vue/es/table/interface'; // 导入 

// 这里假设从父组件传递人物数据，实际中可以根据需求调整
// const props = defineProps(['info']);

const current = ref(1);
    const bottom = ref(false);
    const data = [ '123'];
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



</script>

<style scoped>
/* 可根据需要添加样式 */
</style>