<template>
    <div class="cursor-pointer">
          <a-popover trigger="click" position="bl">
              <div class="action-icon"><icon-settings size="18" /></div>
              <template #content>
                  <div>
                      <a-checkbox-group v-model="selectedColumns">
                          <a-row>
                              <a-col v-for="column in columns" :key="column.dataIndex" :span="8">
                                  <a-checkbox :value="column.dataIndex">{{
                                      column.title
                                      }}</a-checkbox>
                              </a-col>
                          </a-row>
                      </a-checkbox-group>
                  </div>
              </template>
          </a-popover>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { ref, watch, onMounted, defineProps, defineEmits } from 'vue';
  import { TableColumnData } from '@arco-design/web-vue';
  
  interface Props {
    columns: TableColumnData[];
    storageKey: string;
  }
  
  const props = defineProps<Props>();
  const emit = defineEmits(['updateColumns']);
  
  // 初始化 selectedColumns，并过滤掉没有 dataIndex 的列
  const selectedColumns = ref<string[]>(
    props.columns
        .map((column) => column.dataIndex)
        .filter((dataIndex): dataIndex is string => dataIndex !== undefined)
  );
  
  const loadColumnSettings = () => {
    const savedColumns = localStorage.getItem(props.storageKey);
    if (savedColumns) {
        selectedColumns.value = JSON.parse(savedColumns);
    } else {
        selectedColumns.value = props.columns
            .map((column) => column.dataIndex)
            .filter((dataIndex): dataIndex is string => dataIndex !== undefined); // 默认全部选中
    }
  };
  
  const saveColumnSettings = () => {
    localStorage.setItem(
        props.storageKey,
        JSON.stringify(selectedColumns.value)
    );
  };
  
  watch(
    selectedColumns,
    (newSelectedColumns) => {
        saveColumnSettings();
        emit('updateColumns', newSelectedColumns);
    },
    { deep: true }
  );
  
  onMounted(() => {
    loadColumnSettings();
  });
  </script>
  
  <style lang="less" scoped></style>
  