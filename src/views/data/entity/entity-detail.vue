<template>
  <div class="p-4">
    <!-- 属性详情部分 -->
    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-3 text-gray-700">属性详情</h3>
      <div v-if="Object.keys(data.properties || {}).length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div v-for="[key, value] in Object.entries(data.properties || {})" :key="key" class="flex items-start gap-2 bg-white p-3 rounded shadow-sm">
          <span class="text-gray-500 font-medium min-w-[80px]">{{ formatPropertyKey(key) }}:</span>
          <template v-if="key==='tags'">
            <a-tag v-for="tag in value" :key="`${data.id}-${tag}`">{{ tag }}</a-tag>
          </template>
          <template v-else>
            <span class="text-gray-800 flex-1 word-break-break-all">{{ value || '-' }}</span>
          </template>
        </div>
      </div>
      <div v-else class="text-gray-500 italic text-center py-2">暂无属性信息</div>
    </div>
    
    <!-- 实体详情部分 -->
    <div v-if="data.description && data.description.trim()" class="mt-4 border-t border-gray-200 pt-4">
      <h3 class="text-lg font-semibold mb-2 text-gray-700">实体详情</h3>
      <div class="bg-white p-3 rounded shadow-sm text-gray-800">{{ data.description }}</div>
    </div>
    <div v-else class="mt-4 border-t border-gray-200 pt-4">
      <div class="text-gray-500 italic text-center">暂无实体详情</div>
    </div>
    
    <!-- 关系展示部分 -->
    <div class="mt-4 border-t border-gray-200 pt-4">
      <h3 class="text-lg font-semibold mb-3 text-gray-700">实体关系</h3>
      <div v-if="Array.isArray(data.relationships) && data.relationships.length > 0" class="space-y-3">
        <div v-for="(relation, index) in data.relationships" :key="index" class="bg-white p-3 rounded shadow-sm">
          <div class="flex flex-col md:flex-row md:items-center gap-2">
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="text-gray-800 font-medium">{{ data.name }}</span>
                <span class="text-blue-500 px-2 py-0.5 rounded text-xs bg-blue-50">{{ relation.relation_type }}</span>
                <span class="text-gray-500">{{ relation.direction === 'outgoing' ? '->' : '<-' }}</span>
                <span class="text-gray-800 font-medium">{{ relation.related_entity?.name }}</span>
              </div>
              <span v-if="relation.related_entity?.entity_type" class="text-xs text-gray-500 mt-1 inline-block">
                类型: {{ relation.related_entity.entity_type }}
              </span>
            </div>
            <div v-if="relation.weight > 0" class="text-xs bg-yellow-50 text-yellow-600 px-2 py-1 rounded">
              权重: {{ relation.weight }}
            </div>
          </div>
          <div v-if="relation.description" class="text-sm text-gray-600 mt-2 pl-1">{{ relation.description }}</div>
        </div>
      </div>
      <div v-else class="text-gray-500 italic text-center py-2">暂无关系信息</div>
    </div>
    
    <!-- 关联文件展示部分 -->
    <div class="mt-4 border-t border-gray-200 pt-4">
      <h3 class="text-lg font-semibold mb-3 text-gray-700">关联文件</h3>
      <div v-if="Array.isArray(data.docs) && data.docs.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div v-for="(doc, index) in data.docs" :key="index" class="bg-white p-3 rounded shadow-sm hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start">
            <div class="flex-1 min-w-0">
              <div class="text-gray-800 font-medium mb-1 truncate">{{ doc.title }}</div>
              <div class="flex flex-wrap gap-2">
                <span class="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded">{{ doc.type }}</span>
                <span class="text-xs text-gray-500">{{ formatDate(doc.doc_time) }}</span>
              </div>
            </div>
            <div class="text-blue-500 cursor-pointer ml-2">
              <a-link class="text-sm" @click="router.push({name: 'DocDetail', params: { id: doc.id }, query: { appendix: doc.title, category: 'doc' }})">查看</a-link>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-gray-500 italic text-center py-2">暂无关联文件</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { EntityRes } from '@/api/entity';
import router from '@/router';

interface Props {
  data: EntityRes;
}

const props = defineProps<Props>();

const formatPropertyKey = (key: string): string => {
  const keyMap: Record<string, string> = {
    gender: '性别',
    nationality: '国籍',
    organization: '组织',
    position: '职位',
    contact: '联系方式',
    tags: '标签',
    type: '类型',
    country: '国家'
  };
  return keyMap[key] || key;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};
</script>

<style scoped>
/* 组件样式已通过tailwind实现，这里可以添加额外的样式 */
</style>