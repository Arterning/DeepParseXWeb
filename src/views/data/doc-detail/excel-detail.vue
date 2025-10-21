<template>
    <div class="container">
        <a-layout>
            <a-card class="general-card">
                <div class="content">
                    <a-row :gutter="24" class="mb-10">
                        <a-col :span="24" >
                            <a-input class="p-3" v-model="term" @press-enter="search" placeholder="搜索" />
                        </a-col>
                        <!-- <a-col :span="12">
                            <a-button type="primary" @click="search">
                                <template #icon>
                                    <icon-search />
                                </template>
                                {{ $t('data.doc.form.search') }}
                            </a-button>
                        </a-col> -->
                    </a-row>

                    <div style="width:100%">
                        <a-table :columns="columns" :data="filteredData" column-resizable :hoverable="false"
                            :bordered="{ cell: true }" :ellipsis="true" :scroll="scrollPercent" />
                    </div>

                    <div class="mt-2 overflow-scroll"  style="height: 80vh; width: 100%">
                        <VueOfficeExcel :src="buildSrcURL(props.info?.file)"/>
                    </div>
                </div>
            </a-card>
        </a-layout>
    </div>
</template>

<script lang="ts" setup>
import {  SysDocRes } from '@/api/doc';
import { PropType, computed, ref, watchEffect } from 'vue';
import VueOfficeExcel from '@vue-office/excel'

const term = ref('')
const data = ref<Record<string, any>[]>([])
const filteredData = ref<Record<string, any>[]>([]);

const search = () => {
    if (term.value) {
        // 根据 term 过滤数据
        filteredData.value = data.value.filter(item =>
            Object.values(item).some(v => {
                const value = `${v}`;
                return value.includes(term.value);
            })
        );
    } else {
        // 如果 term 为空，返回原始数据
        filteredData.value = data.value;
    }
};


const scrollPercent = {
    x: '100%',
    y: 500
};
// 动态生成 columns
const columns = computed(() => {
    if (!props.info.doc_data) {
        return []
    }
    if (props.info.doc_data.length > 0) {
        // 获取第一个对象的键名
        const keys = Object.keys(props.info.doc_data[0]);
        return keys.map(key => ({
            title: key.charAt(0).toUpperCase() + key.slice(1), // 将键名首字母大写
            dataIndex: key,
            minWidth: 120
        }));
    }
    return []; // 如果 doc_data 为空，返回空数组
});


interface Props {
    info: SysDocRes;
}

const props = defineProps<Props>();

// Model 组件需要接受props的变化
watchEffect(() => {
    data.value = props.info.doc_data || [];
    filteredData.value = data.value;
})

const buildSrcURL = (file?: string) => {
    let url;
    if (import.meta.env.VITE_API_BASE_URL) {
        url = `${import.meta.env.VITE_API_BASE_URL}/api/v1/sys/docs/preview/${file}`;
    } else {
        url = `${window.origin}/api/v1/sys/docs/preview/${file}`;
    }
    return url;
}
</script>