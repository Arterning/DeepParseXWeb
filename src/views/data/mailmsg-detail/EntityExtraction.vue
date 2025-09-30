<template>
  <div class="p-4">
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

    <!-- 实体数据列表 -->
    <div v-else class="space-y-6">
      <div v-for="(entitiesByType, entityType) in groupedEntities" :key="entityType">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-lg font-medium bg-[#2971CF]/10 text-[#2971CF] px-3 py-1 rounded">
            {{ entityType }} ({{ entitiesByType.length }})
          </h4>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          <div 
            v-for="entity in entitiesByType" 
            :key="entity.id"
            class="border border-[#2971CF]/20 rounded-lg p-3 hover:border-[#2971CF] transition-all duration-200"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <p class="font-medium text-gray-800 dark:text-white mb-1">{{ entity.name }}</p>
                <p v-if="entity.description" class="text-sm text-gray-500 line-clamp-2">
                  {{ entity.description }}
                </p>
              </div>
              <span class="text-xs bg-[#2971CF]/10 text-[#2971CF] px-2 py-1 rounded-full">
                ID: {{ entity.id }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, watch, ref } from 'vue';
import type { DocEntity } from '@/api/doc';

interface Props {
  info?: {
    entities?: DocEntity[];
  };
}

const props = defineProps<Props>();
const loading = ref(false);

// 按实体类型分组
const groupedEntities = computed(() => {
  const groups: Record<string, DocEntity[]> = {};
  
  if (!props.info?.entities || props.info.entities.length === 0) {
    return groups;
  }
  
  props.info.entities.forEach(entity => {
    if (!groups[entity.entity_type]) {
      groups[entity.entity_type] = [];
    }
    groups[entity.entity_type].push(entity);
  });
  
  return groups;
});

// 实体列表
const entities = computed(() => props.info?.entities || []);

// 监听info变化
watch(() => props.info, (newInfo) => {
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

<style scoped lang="less">
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>