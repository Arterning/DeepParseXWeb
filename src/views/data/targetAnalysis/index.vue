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
          <a-tab-pane key="1" title="邮件路径分析"> test </a-tab-pane>
          <a-tab-pane key="2" title="时空轨迹图">
            Content of Tab Panel 2
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';

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
  ]);
  const selectedUsers = ref<string[]>([]);

  const startAnalysis = () => {
    console.log('开始分析');
  };
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
