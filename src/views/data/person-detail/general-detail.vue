<template>
  <div class="containers">
    <a-card class="general-card">
      <div class="left-content" style="float: left; width: 50%">
        <a-layout class="flex-layout">
          <a-card class="general-card">
            <div class="left-left-content" style="float: left; width: 20%">
              <avatar-view></avatar-view>
            </div>       
            <div class="left-right-content" style="float: left; width: 80%; position: relative;">
              <a-space direction="vertical" size="large">
                <!-- 展示模式 -->
                <a-descriptions
                  v-if="!isEditing"
                  :data="lizi" 
                  title="User Info" 
                  :align="{ label: 'left' }"
                  :column="2"
                />
                <!-- 编辑模式 -->
                <div v-else class="edit-container">
                  <a-row :gutter="24" class="edit-row">
                    <a-col 
                      v-for="(item, index) in lizi" 
                      :key="index" 
                      :span="12"
                      class="edit-col"
                    >
                      <div class="edit-item">
                        <span class="edit-label">{{ item.label }}</span>
                        <a-input 
                          v-model="editableData[index].value"
                          class="edit-input"
                          :placeholder="item.value"
                        />
                      </div>
                    </a-col>
                  </a-row>
                </div>
              </a-space>

              <!-- 操作按钮组 -->
              <div class="edit-buttons" style="margin-top: 0px; text-align: right;">
                <icon-edit 
                  v-if="!isEditing"
                  type="primary"
                  @click="enterEditMode"
                  class="edit-button"
                  size="large"
                >
                  修改信息
                </icon-edit>
                <a-space v-else>
                  <a-button type="primary" @click="submitEdit">提交</a-button>
                  <a-button @click="cancelEdit">取消</a-button>
                </a-space>
              </div>
            </div>
            <a-divider/>
            <a-row>
              <a-col :span="24">
                <h3>个人简历</h3>
                <p>这是一段简历。。。。。。简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历简历</p>
              </a-col>
            </a-row>
            <!-- 相关新闻 -->
            <a-divider class="mt-0"/>
            <a-row>
              <a-col :span="24">
                <h3>工作记录</h3>
                <a-space direction="vertical" size="small" fill>
                  <a-table :columns="columns" :data="job" :bordered="false" class="compact-table">
                    <template #job-filter="{ filterValue, setFilterValue, handleFilterConfirm, handleFilterReset}">
                      <div class="custom-filter">
                        <a-space>
                          <a-input :model-value="filterValue[0]" @input="(value)=>setFilterValue([value])" />
                          <div class="custom-filter-footer">
                            <a-button @click="handleFilterConfirm">搜索</a-button>
                            <a-button @click="handleFilterReset">取消</a-button>
                          </div>
                        </a-space>
                      </div>
                    </template>
                  </a-table>
                </a-space>
              </a-col>
            </a-row>
            <a-divider class="mt-0"/>
            <a-row>
              <a-col>
                  <a-card  :bordered="false" class="compact-card">
                    <a-list :max-height="240" @reach-bottom="blackInfo" :scrollbar="scrollbar" class="borderless-list">
                      <template #header>黑料信息</template>
                      <template #scroll-loading>
                        <div v-if="bottom">No more data</div>
                        <a-spin v-else />
                      </template>
                      <a-list-item v-for="item of blackinfo" :key="item">{{item}}</a-list-item>
                    </a-list>
                  </a-card>
              </a-col>
            </a-row>
          </a-card>
        </a-layout>
      </div>
      <div class="right-content" style="float: left; width: 50%; padding-left: 20px; box-sizing: border-box;">
        <a-row>
              <a-col>
                  <a-card  :bordered="false" class="compact-card">
                    <a-list :max-height="140" :style="{ height: '150px' }" @reach-bottom="fetchData" :scrollbar="scrollbar" class="recent-activities">
                      <template #header>近期动态</template>
                      <template #scroll-loading>
                        <div v-if="bottom">No more data</div>
                        <a-spin v-else />
                      </template>
                      <a-list-item v-for="item of news" :key="item">{{item}}</a-list-item>
                    </a-list>
                  </a-card>
              </a-col>
            </a-row>
        <a-layout class="flex-layout">
          <a-card class="general-card">
            <h3>工作关系图谱</h3>
            <node-dialog></node-dialog>
          </a-card>
        </a-layout>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref, onMounted, h } from 'vue';
  import Footer from '@/components/footer/index.vue';
  import { Form, Input, Select, Button, Modal } from '@arco-design/web-vue';
  import cytoscape, { Core } from 'cytoscape';
  import dagre from 'cytoscape-dagre';
  import { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import { values } from 'lodash';
  import avatarView from '@/views/data/person-detail/avatarView.vue';
  import { IconSearch } from '@arco-design/web-vue/es/icon';

    // 新增：定义弹窗状态
    const showAvatarModal = ref(false);
    const scrollbar = ref(true);

  const props = defineProps({
    person: {
      type: Object,
      required: true,
    },
    avatars: {
      type: Array,
      default: () => []
    },
  });
  const lizi = [
    {
      label: '姓名',
      value: 'sjy',
    },
    {
      label: '其他名称',
      value: 'ywlp',
    },
    {
      label: '性别',
      value: '女',
    },
    {
      label: '所属组织',
      value: 'Beijing',
    },
    {
      label: '职位',
      value: 'zhanjie',
    },
    {
      label: '职业',
      value: 'woker',
    },
    {
      label: '出生日期',
      value: '2005.09.23',
    },
    {
      label: '毕业院校',
      value: '北京大学',
    },
    {
      label: '人物标签',
      value: '标签一',
    },
  ];

  const alignLeft = ref(false);
  const showGallery = ref(false);
  const activeIndex = ref(0);
  const currentAvatar = ref(props.avatars[0]);

  const openGallery = () => {
    showGallery.value = true;
    document.body.style.overflow = 'hidden'; // 禁止背景滚动
  };

  const closeGallery = () => {
    showGallery.value = false;
    document.body.style.overflow = '';
  };

  const columns: TableColumnData[] = [
    {
      title: '工作时间',
      dataIndex: 'time',
      sortable: {
        sortDirections: ['ascend', 'descend'],
      },
    },
    {
      title: '工作记录',
      dataIndex: 'job',
      filterable: {
          filter: (value, record) => record.job.includes(value),
          slotName: 'job-filter',
          icon: () => h(IconSearch)
        }
    },
  ];
  // 添加响应式状态
const isEditing = ref(false);
const editableData = reactive<Array<{label: string; value: string}>>([]);

// 进入编辑模式
const enterEditMode = () => {
  editableData.splice(0, editableData.length, ...lizi.map(item => ({
    ...item,
    // 保持与展示数据结构一致
    label: item.label,
    value: item.value
  })));
  isEditing.value = true;
};

// 提交修改
const submitEdit = () => {
  lizi.splice(0, lizi.length, ...editableData.map(item => ({...item})));
  isEditing.value = false;
};

// 取消修改
const cancelEdit = () => {
  isEditing.value = false;
};
  const job = reactive([
    {
      key: '1',
      time: '20240204',
      job: '工作了一阵子',
    },
    {
      key: '2',
      time: '20240205',
      job: '又工作了一阵子',
    },
    {
      key: '3',
      time: '20240206',
      job: '又又工作了一阵子',
    },
    {
      key: '4',
      time: '20240207',
      job: '又又又工作了一阵子',
    },
    {
      key: '5',
      time: '20240208',
      job: '又又又又工作了一阵子',
    },
  ]);

  const blackInfo = () => {
    console.log('reach bottom!');
    if (current.value <= 5) {
        blackinfo.value = [
          ...blackinfo.value,
          `黑料信息1: asdfghjkl1111111;`,
          `黑料信息2: asdfghjkl222222222;`,
          `黑料信息3: asdfghjkl333333; `,
          `黑料信息4: asdfghjkl444444444444;`,
          `黑料信息5: asdfghjkl5555;`
    ];
        current.value += 1;
    } else {
      bottom.value = true;
    }
  };

  const current = ref(1);
  const bottom = ref(false);
  const news = ref<string[]>([]);
  const blackinfo = ref<string[]>([]);

  const fetchData = () => {
    console.log('reach bottom!');
    if (current.value <= 5) {
      // window.setTimeout(() => {
        // const index = data.length;
        news.value = [
          ...news.value,
          `Beijing Bytedance Technology Co., Ltd.`,
          `Bytedance Technology Co., Ltd.`,
          `Beijing Toutiao Technology Co., Ltd.`,
          `Beijing Volcengine Technology Co., Ltd.`,
          `China Beijing Bytedance Technology Co., Ltd.`
    ];
        current.value += 1;
      // }, 2000);
    } else {
      bottom.value = true;
    }
  };

  // // 新增：定义虚拟头像数组
  // const avatars = ref([
  //   // 这里可以使用虚拟头像链接，实际使用时替换为真实头像链接
  //   './avatar/mjq.jpeg',
  //   './avatar/dcx.jpeg',
  //   './avatar/syx.jpeg'
  // ]);
  onMounted(() => {
  fetchData();
  blackInfo();
});

</script>

<style scoped>
  /* 可根据需要添加样式 */
  .container {
    width: 100%;
    height: 100vh;
    background: #f5f5f5;
  }

  .cy-container {
    width: 100%;
    height: 800px;
    border: 1px solid #ddd;
    background: white;
  }

  .highlight {
    background-color: #ffc107 !important;
    border-width: 3px !important;
    z-index: 9999 !important;
  }

  .related {
    opacity: 0.7;
  }

  .active-edge {
    width: 3px !important;
  }
  /* 修复布局问题 */
  .node-form {
    padding: 16px 0;
  }
  /* 颜色预览样式 */
  .color-preview {
    width: 18px;
    height: 18px;
    border-radius: 4px;
    border: 1px solid var(--color-border);
  }
  .edit-buttons {
    margin: 20px 0;
    height: 20px;
    text-align: right;
    padding: 2px 8px;
    font-size: 10px;
    line-height: 1.2;
    /* border-radius: 4px; */
}
/* 完全复用展示模式布局 */
.edit-container {
  width: 100%;
  padding: 12px 16px;
}

.edit-row {
  margin: -6px 0;
}

.edit-col {
  padding: 6px 0;
}

.edit-item {
  display: flex;
  align-items: center;
  height: 22px;
}

.edit-label {
  width: 35%;
  text-align: left;
  color: var(--color-text-2);
  font-size: 14px;
  margin-right: 12px;
}

.edit-input {
  flex: 1;
  height: 22px;
  line-height: 22px;
  padding: 0 8px;
  border-radius: 2px;
  border: 1px solid var(--color-border);
}

/* 覆盖默认输入框样式 */
.edit-input :deep(.arco-input) {
  height: 22px;
  min-height: 22px;
  padding: 0;
  border: none;
  background: transparent;
}

.edit-input :deep(.arco-input:hover),
.edit-input :deep(.arco-input:focus) {
  background: var(--color-fill-2);
  border-radius: 2px;
}
.recent-activities :deep(.arco-list-header) {
  font-size: 16px !important;
  font-weight: 600 !important;
  padding: 8px 0 4px 0 !important; /* 上 8px 下 4px */
  margin-left: 12px;
}

.recent-activities :deep(.arco-list-item) {
  font-size: 15px !important;
  line-height: 1.5 !important;
  min-height: 28px !important; /* 根据字体大小调整 */
  padding: 5px 0 !important;
  margin-left: 12px;
}

/* 移除默认悬停背景色 */
.recent-activities :deep(.arco-list-item:hover) {
  background-color: transparent !important;
}

/* 调整加载状态样式 */
.recent-activities :deep(.arco-spin) {
  margin: 4px 0 !important;
}

  /* 自定义样式 */
  /* 确保隐藏样式优先级 */
  .custom-filter {
  padding: 20px;
  background: var(--color-bg-5);
  border: 1px solid var(--color-neutral-3);
  border-radius: var(--border-radius-medium);
  box-shadow: 0 2px 5px rgb(0 0 0 / 10%);
}

.custom-filter-footer {
  display: flex;
  justify-content: space-between;
}
.borderless-list :deep(.arco-list) {
  border: none !important;
}

.borderless-list :deep(.arco-list-header) {
  border-bottom: none !important;
  padding: 8px 0 !important;
}

.borderless-list :deep(.arco-list-item) {
  border-bottom: none !important;
  padding: 4px 0 !important;
}

</style>
