<template>
  <div class="mb-4">
    <h3 class="text-xl font-semibold text-[#2971CF] mb-2">实体提取结果</h3>
    <p class="text-gray-500 text-sm">从文件中提取出的实体按类型分组展示</p>
  </div>

  <!-- 加载状态 -->
  <div v-if="loading" class="flex justify-center items-center py-10">
    <a-spin />
  </div>

  <!-- 没有实体数据时 -->
  <div v-else-if="!entities || entities.length === 0" class="flex flex-col items-center justify-center py-10 text-gray-500">
    <i class="iconfont icon-info-circle text-4xl mb-2" style="color: #909399"></i>
    <p>当前文件暂无提取到的实体</p>
  </div>

  <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    <div v-for="(entitiesByType, entityType) in groupedEntities" :key="entityType" 
      class="rounded-lg shadow-sm border" style="border-color: var(--color-border);">
      <div class="py-3 px-5 border-b" style="border-color: var(--color-border);">
        <h3 class="font-semibold flex items-center text-[#2971CF]">
          {{ entityType }} ({{ entitiesByType.length }})
        </h3>
      </div>
      <div class="max-h-80 overflow-y-auto">
        <a-list :data="entitiesByType" :bordered="false" size="small">
          <template #item="{ item }">
            <a-list-item class="break-all">
              <a-list-item-meta
                :title="item.name || '未知'"
                :description="item.description"
              >
              </a-list-item-meta>
            </a-list-item>
          </template>
        </a-list>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, watch, ref } from 'vue';
import type { DocEntity } from '@/api/doc';

interface Props {
  entities?: DocEntity[];
}

const props = defineProps<Props>();
const loading = ref(false);

// 按实体类型分组
const groupedEntities = computed(() => {
  const groups: Record<string, DocEntity[]> = {};
  
  if (!props?.entities || props.entities.length === 0) {
    return groups;
  }
  
  props.entities.forEach(entity => {
    if (!groups[entity.entity_type]) {
      groups[entity.entity_type] = [];
    }
    groups[entity.entity_type].push(entity);
  });
  
  return groups;
});

// 实体列表
const entities = computed(() => props?.entities || []);

// 监听info变化
watch(() => props.entities, (newInfo) => {
  // 可以在这里添加加载动画逻辑
  if (newInfo) {
    loading.value = true;
    // 模拟加载延迟
    setTimeout(() => {
      loading.value = false;
    }, 300);
  }
}, { immediate: true });
</script>
