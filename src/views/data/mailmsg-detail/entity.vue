<template>
  <div class="p-4 space-y-6">
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div>
            <!-- 人物信息 -->
            <div class="rounded-lg shadow-sm border" style="background-color: var(--color-bg-1); border-color: var(--color-border);">
            <div class="p-4 border-b" style="border-color: var(--color-border);">
                <h3 class="text-lg font-semibold flex items-center" style="color: var(--color-text-1);">
                <IconUser class="mr-2" />
                人物信息
                </h3>
            </div>
            <div class="max-h-80 overflow-y-auto">
                <a-list :data="personList" :bordered="false">
                <template #item="{ item }">
                    <a-list-item class="transition-colors" style="--hover-bg: var(--color-fill-1);">
                    <div class="flex items-start justify-between w-full">
                        <div class="flex-1 space-y-2">
                        <div class="flex items-center space-x-2">
                            <div class="font-medium" style="color: var(--color-text-1);">{{ item.name || '未知姓名' }}</div>
                            <span class="inline-flex items-center">
                              <IconMan v-if="item.gender === '男'" style="color: #1e88e5;" />
                              <IconWoman v-else-if="item.gender === '女'" style="color: #ec407a;" />
                              <IconUser v-else style="color: #9e9e9e;" />
                            </span>
                            <a-tag v-if="item.nationality" color="green">{{ item.nationality }}</a-tag>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-2 text-sm" style="color: var(--color-text-2);">
                            <div v-if="item.organization">
                            <span class="font-medium">组织：</span>{{ item.organization }}
                            </div>
                            <div v-if="item.position">
                            <span class="font-medium">职位：</span>{{ item.position }}
                            </div>
                            <div v-if="item.contact">
                            <span class="font-medium">联系方式：</span>{{ item.contact }}
                            </div>
                            <div v-if="item.email">
                            <span class="font-medium">邮箱：</span>
                            <a-tag color="blue" size="small">{{ item.email }}</a-tag>
                            </div>
                        </div>
                        
                        <div v-if="item.locations && item.locations.length > 0" class="text-xs" style="color: var(--color-text-3);">
                            <span class="font-medium">出现位置：</span>
                            <a-tag v-for="(location, index) in item.locations" :key="index" size="small" class="mr-1">
                            {{ location }}
                            </a-tag>
                        </div>
                        </div>
                        
                        <div class="flex items-center space-x-2 ml-4">
                        <a-tooltip content="加入人物库">
                            <a-button type="text" size="small" shape="circle" @click="addToPersonLibrary(item)">
                            <IconPlus />
                            </a-button>
                        </a-tooltip>
                        <a-tooltip content="编辑">
                            <a-button type="text" size="small" shape="circle" @click="editPerson(item)">
                            <IconEdit />
                            </a-button>
                        </a-tooltip>
                        <a-tooltip content="删除">
                            <a-button type="text" size="small" shape="circle" status="danger" @click="deletePerson(item)">
                            <IconDelete />
                            </a-button>
                        </a-tooltip>
                        </div>
                    </div>
                    </a-list-item>
                </template>
                </a-list>
            </div>
            </div>
        </div>
        <div>
            <!-- 组织信息 -->
            <div class="rounded-lg shadow-sm border" style="background-color: var(--color-bg-1); border-color: var(--color-border);">
            <div class="p-4 border-b" style="border-color: var(--color-border);">
                <h3 class="text-lg font-semibold flex items-center" style="color: var(--color-text-1);">
                <IconRelation class="mr-2" />
                组织信息
                </h3>
            </div>
            <div class="max-h-80 overflow-y-auto">
                <a-list :data="organizationList" :bordered="false">
                <template #item="{ item }">
                    <a-list-item class="transition-colors" style="--hover-bg: var(--color-fill-1);">
                    <div class="flex items-start justify-between w-full">
                        <div class="flex-1 space-y-2">
                        <div class="flex items-center space-x-4">
                            <div class="font-medium" style="color: var(--color-text-1);">{{ item.name || '未知组织' }}</div>
                            <a-tag v-if="item.type" color="orange">{{ item.type }}</a-tag>
                        </div>
                        
                        <div v-if="item.locations && item.locations.length > 0" class="text-xs" style="color: var(--color-text-3);">
                            <span class="font-medium">出现位置：</span>
                            <a-tag v-for="(location, index) in item.locations" :key="index" size="small" class="mr-1">
                            {{ location }}
                            </a-tag>
                        </div>
                        </div>
                        
                        <div class="flex items-center space-x-2 ml-4">
                        <a-tooltip content="加入组织库">
                            <a-button type="text" size="small" shape="circle" @click="addToOrgLibrary(item)">
                            <IconPlus />
                            </a-button>
                        </a-tooltip>
                        <a-tooltip content="编辑">
                            <a-button type="text" size="small" shape="circle" @click="editOrganization(item)">
                            <IconEdit />
                            </a-button>
                        </a-tooltip>
                        <a-tooltip content="删除">
                            <a-button type="text" size="small" shape="circle" status="danger" @click="deleteOrganization(item)">
                            <IconDelete />
                            </a-button>
                        </a-tooltip>
                        </div>
                    </div>
                    </a-list-item>
                </template>
                </a-list>
            </div>
            </div>
        </div>
    </div>



    <!-- 码址信息 -->
    <div class="rounded-lg shadow-sm border" style="background-color: var(--color-bg-1); border-color: var(--color-border);">
      <div class="p-4 border-b" style="border-color: var(--color-border);">
        <h3 class="text-lg font-semibold flex items-center" style="color: var(--color-text-1);">
          <IconComputer class="mr-2" />
          码址信息
        </h3>
      </div>
      <div class="max-h-80 overflow-y-auto">
        <div class="p-4 space-y-4">
           <!-- 邮箱地址 -->
           <div v-if="getAddressByType('email').length > 0" class="space-y-2">
             <div class="flex items-center space-x-2 pb-2 border-b" style="border-color: var(--color-border-2);">
               <IconEmail style="color: var(--color-text-3);" />
               <span class="font-medium" style="color: var(--color-text-1);">邮箱地址</span>
               <a-tag size="small" color="blue">{{ getAddressByType('email').length }}</a-tag>
             </div>
             <div class="space-y-2">
               <AddrCodeItem 
                 v-for="(item, index) in getAddressByType('email')" 
                 :key="index"
                 :item="item"
                 tag-color="blue"
               />
             </div>
           </div>

           <!-- 手机号码 -->
           <div v-if="getAddressByType('phone').length > 0" class="space-y-2">
             <div class="flex items-center space-x-2 pb-2 border-b" style="border-color: var(--color-border-2);">
               <IconPhone style="color: var(--color-text-3);" />
               <span class="font-medium" style="color: var(--color-text-1);">手机号码</span>
               <a-tag size="small" color="green">{{ getAddressByType('phone').length }}</a-tag>
             </div>
             <div class="space-y-2">
               <AddrCodeItem 
                 v-for="(item, index) in getAddressByType('phone')" 
                 :key="index"
                 :item="item"
                 tag-color="green"
               />
             </div>
           </div>

           <!-- 社交网络账号 -->
           <div v-if="getAddressByType('social').length > 0" class="space-y-2">
             <div class="flex items-center space-x-2 pb-2 border-b" style="border-color: var(--color-border-2);">
               <IconWechat style="color: var(--color-text-3);" />
               <span class="font-medium" style="color: var(--color-text-1);">社交网络账号</span>
               <a-tag size="small" color="purple">{{ getAddressByType('social').length }}</a-tag>
             </div>
             <div class="space-y-2">
               <AddrCodeItem 
                 v-for="(item, index) in getAddressByType('social')" 
                 :key="index"
                 :item="item"
                 tag-color="purple"
               />
             </div>
           </div>

           <!-- IP地址 -->
           <div v-if="getAddressByType('ip').length > 0" class="space-y-2">
             <div class="flex items-center space-x-2 pb-2 border-b" style="border-color: var(--color-border-2);">
               <IconComputer style="color: var(--color-text-3);" />
               <span class="font-medium" style="color: var(--color-text-1);">IP地址</span>
               <a-tag size="small" color="red">{{ getAddressByType('ip').length }}</a-tag>
             </div>
             <div class="space-y-2">
               <AddrCodeItem 
                 v-for="(item, index) in getAddressByType('ip')" 
                 :key="index"
                 :item="item"
                 tag-color="red"
               />
             </div>
           </div>

          <!-- 无数据提示 -->
          <div v-if="addressList.length === 0" class="text-center py-8" style="color: var(--color-text-3);">
            <IconComputer class="mx-auto mb-2" style="font-size: 24px;" />
            <div>暂无码址信息</div>
          </div>
        </div>
      </div>
    </div>
    </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { 
    IconUser, 
    IconCode, 
    IconPlus, 
    IconEdit, 
    IconDelete,
    IconEmail,
    IconPhone,
    IconWechat,
    IconComputer,
    IconRelation,
    IconMan,
    IconWoman
  } from '@arco-design/web-vue/es/icon';
  import AddrCodeItem from './components/addrcode.vue';

  const props = defineProps<{
    info: any
  }>();

  // 模拟数据 - 实际应该从 props.info 中获取
  const personList = ref([
    {
      id: 1,
      name: '张三',
      gender: '男',
      nationality: '中国',
      organization: '阿里巴巴集团',
      position: '高级工程师',
      contact: '13800138000',
      email: 'zhangsan@alibaba.com',
      locations: ['邮件正文', '附件文档']
    },
    {
      id: 2,
      name: '李四',
      gender: '女',
      nationality: '美国',
      organization: 'Google Inc.',
      position: '产品经理',
      contact: '+1-555-0123',
      email: 'lisi@google.com',
      locations: ['邮件签名']
    }
  ]);

  const organizationList = ref([
    {
      id: 1,
      name: '阿里巴巴集团',
      type: '科技公司',
      locations: ['邮件正文', '附件文档']
    },
    {
      id: 2,
      name: 'Google Inc.',
      type: '互联网公司',
      locations: ['邮件签名']
    }
  ]);

  const addressList = ref([
    {
      id: 1,
      type: 'email',
      value: 'zhangsan@alibaba.com',
      locations: ['邮件正文', '附件文档']
    },
    {
      id: 2,
      type: 'email',
      value: 'zhangsan.work@company.com',
      locations: ['邮件签名']
    },
    {
      id: 3,
      type: 'phone',
      value: '13800138000',
      locations: ['邮件签名']
    },
    {
      id: 4,
      type: 'phone',
      value: '+86-21-12345678',
      locations: ['邮件正文']
    },
    {
      id: 5,
      type: 'social',
      value: '@zhangsan_wechat',
      locations: ['邮件正文']
    },
    {
      id: 6,
      type: 'social',
      value: 'zhangsan_linkedin',
      locations: ['邮件签名']
    },
    {
      id: 7,
      type: 'ip',
      value: '192.168.1.100',
      location: '北京市',
      locations: ['邮件头信息']
    },
    {
      id: 8,
      type: 'ip',
      value: '10.0.0.1',
      location: '上海市',
      locations: ['附件文档']
    }
  ]);

  // 获取地址类型图标
  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'email': return IconEmail;
      case 'phone': return IconPhone;
      case 'social': return IconWechat;
      case 'ip': return IconCode;
      default: return IconCode;
    }
  };

  // 获取地址类型文本
  const getAddressTypeText = (type: string) => {
    switch (type) {
      case 'email': return '邮箱地址';
      case 'phone': return '手机号码';
      case 'social': return '社交网络账号';
      case 'ip': return 'IP地址';
      default: return '未知类型';
    }
  };

  // 按类型获取码址信息
  const getAddressByType = (type: string) => {
    return addressList.value.filter(item => item.type === type);
  };

  // 人物信息操作
  const addToPersonLibrary = (item: any) => {
    Message.success(`已将 ${item.name} 加入人物库`);
  };

  const editPerson = (item: any) => {
    Message.info(`编辑人物：${item.name}`);
  };

  const deletePerson = (item: any) => {
    Message.warning(`删除人物：${item.name}`);
  };

  // 组织信息操作
  const addToOrgLibrary = (item: any) => {
    Message.success(`已将 ${item.name} 加入组织库`);
  };

  const editOrganization = (item: any) => {
    Message.info(`编辑组织：${item.name}`);
  };

  const deleteOrganization = (item: any) => {
    Message.warning(`删除组织：${item.name}`);
  };
</script>

<style scoped>
  /* 自定义滚动条样式 */
  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-track {
    @apply bg-gray-100;
  }
  ::-webkit-scrollbar-thumb {
    @apply bg-gray-300 rounded-full;
  }

  /* 美化正文内容样式 */
  :deep(.prose) {
    line-height: 1.6;
    p {
      @apply mb-4;
    }
    ol {
      @apply list-decimal pl-6 mb-4;
    }
    li {
      @apply mb-2;
    }
  }
</style>
