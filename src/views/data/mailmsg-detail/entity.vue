<template>
  <a-empty v-if="entities&&!entities.length"/>
  <div class="grid gap-6 grid-cols-2">
    <!-- 人物信息 -->
    <div v-if="personList.length > 0" class="rounded-lg shadow-sm border" style="background-color: var(--color-bg-1); border-color: var(--color-border);">
      <div class="p-4 border-b" style="border-color: var(--color-border);">
        <h3 class="text-lg font-semibold flex items-center" style="color: var(--color-text-1);">
          <IconUser class="mr-2" /> 人物信息
        </h3>
      </div>
      <div class="max-h-80 overflow-y-auto">
        <a-list :data="personList" :bordered="false">
          <template #item="{ item }">
            <a-list-item class="transition-colors" style="--hover-bg: var(--color-fill-1);">
              <div class="flex items-start justify-between w-full">
                <div class="flex-1 space-y-2">
                  <div class="flex items-center space-x-2">
                    <div style="color: var(--color-text-1);">{{ item.name || '未知姓名' }}</div>
                    <span class="inline-flex items-center">
                      <IconMan v-if="item.gender === '男'" style="color: #1e88e5;" />
                      <IconWoman v-else-if="item.gender === '女'" style="color: #ec407a;" />
                      <IconUser v-else style="color: #9e9e9e;" />
                    </span>
                    <template v-if="item.tags && item.tags.length > 0">
                      <a-tag v-for="(tag, index) in item.tags" :key="`${item.id}-${tag}`" size="small" color="green">{{ tag }}</a-tag>
                    </template>
                  </div>

                  <div class="space-y-2 text-sm" style="color: var(--color-text-2);">
                    <div v-if="item.description"><span>描述：</span>{{ item.description }}</div>
                    <div v-if="item.country"><span>国家：</span>{{ item.country }}</div>
                    <div v-if="item.organization"><span>组织：</span>{{ item.organization }}</div>
                    <div v-if="item.position"><span>职位：</span>{{ item.position }}</div>
                    <div v-if="item.contact"><span>联系方式：</span>{{ item.contact }}</div>
                  </div>
                </div>

                <div class="flex items-center space-x-2 ml-4">
                  <a-tooltip content="加入人物库">
                    <a-button type="text" size="small" shape="circle"><IconPlus /></a-button>
                  </a-tooltip>
                  <a-tooltip content="编辑">
                    <a-button type="text" size="small" shape="circle"><IconEdit /></a-button>
                  </a-tooltip>
                  <a-tooltip content="删除">
                    <a-button type="text" size="small" shape="circle" status="danger"><IconDelete /></a-button>
                  </a-tooltip>
                </div>
              </div>
            </a-list-item>
          </template>
        </a-list>
      </div>
    </div>

    <!-- 组织信息 -->
    <div v-if="organizationList.length > 0" class="rounded-lg shadow-sm border" style="background-color: var(--color-bg-1); border-color: var(--color-border);">
      <div class="p-4 border-b" style="border-color: var(--color-border);">
        <h3 class="text-lg font-semibold flex items-center" style="color: var(--color-text-1);">
          <IconRelation class="mr-2" /> 组织信息
        </h3>
      </div>
      <div class="max-h-80 overflow-y-auto">
        <a-list :data="organizationList" :bordered="false">
          <template #item="{ item }">
            <a-list-item class="transition-colors" style="--hover-bg: var(--color-fill-1);">
              <div class="flex items-start justify-between w-full">
                <div class="flex-1 space-y-2">
                  <div class="flex items-center space-x-4">
                    <div style="color: var(--color-text-1);">{{ item.name || '未知组织' }}</div>
                    <template v-if="item.tags && item.tags.length > 0">
                      <a-tag v-for="(tag, index) in item.tags" :key="`${item.id}-${tag}`" size="small" color="orange">{{ tag }}</a-tag>
                    </template>
                  </div>
                  <div class="space-y-2 text-sm" style="color: var(--color-text-2);">
                    <div v-if="item.description"><span>描述：</span>{{ item.description }}</div>  
                    <div v-if="item.type"><span>类型：</span>{{ item.type }}</div>
                    <div v-if="item.country"><span>国家：</span>{{ item.country }}</div>
                  </div>
                </div>

                <div class="flex items-center space-x-2 ml-4">
                  <a-tooltip content="加入组织库">
                    <a-button type="text" size="small" shape="circle"><IconPlus /></a-button>
                  </a-tooltip>
                  <a-tooltip content="编辑">
                    <a-button type="text" size="small" shape="circle"><IconEdit /></a-button>
                  </a-tooltip>
                  <a-tooltip content="删除">
                    <a-button type="text" size="small" shape="circle" status="danger"><IconDelete /></a-button>
                  </a-tooltip>
                </div>
              </div>
            </a-list-item>
          </template>
        </a-list>
      </div>
    </div>

    <!-- 地点信息 -->
    <div v-if="locationList.length > 0" class="rounded-lg shadow-sm border" style="background-color: var(--color-bg-1); border-color: var(--color-border);">
      <div class="p-4 border-b" style="border-color: var(--color-border);">
        <h3 class="text-lg font-semibold flex items-center" style="color: var(--color-text-1);">
          <IconLocation class="mr-2" /> 地点信息
        </h3>
      </div>
      <div class="max-h-80 overflow-y-auto">
        <a-list :data="locationList" :bordered="false">
          <template #item="{ item }">
            <a-list-item>
              <div class="flex flex-col space-y-2">
                <div style="color: var(--color-text-1);">{{ item.name || '未知地点' }}</div>
                <div v-if="item.description" class="text-sm" style="color: var(--color-text-2);">
                  {{ item.description }}
                </div>
              </div>
            </a-list-item>
          </template>
        </a-list>
      </div>
    </div>

    <!-- 事件信息 -->
    <div v-if="eventList.length > 0" class="rounded-lg shadow-sm border" style="background-color: var(--color-bg-1); border-color: var(--color-border);">
      <div class="p-4 border-b" style="border-color: var(--color-border);">
        <h3 class="text-lg font-semibold flex items-center" style="color: var(--color-text-1);">
          <IconCalendar class="mr-2" /> 事件信息
        </h3>
      </div>
      <div class="max-h-80 overflow-y-auto">
        <a-list :data="eventList" :bordered="false">
          <template #item="{ item }">
            <a-list-item>
              <div class="flex flex-col space-y-2">
                <div style="color: var(--color-text-1);">{{ item.name || '未知事件' }}</div>
                <div v-if="item.description" class="text-sm" style="color: var(--color-text-2);">
                  {{ item.description }}
                </div>
              </div>
            </a-list-item>
          </template>
        </a-list>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { IconUser, IconMan, IconWoman, IconPlus, IconEdit, IconDelete, IconRelation, IconLocation, IconCalendar } from '@arco-design/web-vue/es/icon'
import type { DocEntity } from '@/api/doc'

interface Props {
  entities?: DocEntity[]
}
const props = defineProps<Props>()

const personList = computed(() => props.entities?.filter(e => e.entity_type === '人物').map(e => ({ ...e.properties, ...e })) || [])
const organizationList = computed(() => props.entities?.filter(e => e.entity_type === '组织').map(e => ({ ...e.properties, ...e })) || [])
const locationList = computed(() => props.entities?.filter(e => e.entity_type === '地点').map(e => ({ ...e.properties, ...e })) || [])
const eventList = computed(() => props.entities?.filter(e => e.entity_type === '事件').map(e => ({ ...e.properties, ...e })) || [])
</script>
