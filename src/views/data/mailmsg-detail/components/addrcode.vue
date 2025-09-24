<template>
  <div class="p-3 rounded transition-colors" 
       style="background-color: var(--color-fill-1); border: 1px solid var(--color-border-2);">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <a-tag :color="tagColor" size="small">{{ item.value }}</a-tag>
        <span v-if="item.location" class="text-xs" style="color: var(--color-text-3);">
          {{ item.location }}
        </span>
      </div>
      <div v-if="item.locations && item.locations.length > 0" class="text-xs" style="color: var(--color-text-3);">
        <span class="font-medium">出现位置：</span>
        <a-tag v-for="(location, idx) in item.locations" :key="idx" size="small" class="mr-1">
          {{ location }}
        </a-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  interface AddrCodeItem {
    id: number;
    type: string;
    value: string;
    location?: string;
    locations?: string[];
  }

  interface Props {
    item: AddrCodeItem;
    tagColor: string;
  }

  defineProps<Props>();
</script>
