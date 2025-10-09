<template>
    <div class="container">
        <a-layout>
            <a-card class="general-card">
                <div class="content">
                    <a-card class="info-card">
                        <template #title>
                            <div class="flex justify-between items-center">
                                <ScanSvg class="w-8 h-8"/>
                                <a-switch v-model="compare">
                                    <template #checked>
                                        比对
                                    </template>
                                    <template #unchecked>
                                        原文
                                    </template>
                                </a-switch>
                                <a-button @click="extract">重新提取</a-button>
                            </div>
                        </template>
                        <div class="flex gap-1" v-if="compare">
                            
                            <iframe v-if="info.file_suffix == '.doc'" class="h-[500px] w-1/2 " :src="buildSrcURL(info.file)" frameborder="0" ></iframe>

                            <div v-else class="w-1/2 h-[500px]">
                                <!-- <vue-office-docx :src="buildSrcURL(info.file)" /> -->
                                <!-- 动态组件渲染 -->
                                <component 
                                    :is="currentViewer" 
                                    :src="buildSrcURL(info.file)"
                                />
                            </div>
                            <div class="w-1/2">
                                <a-skeleton :loading="loading" :animation="true">
                                    <a-space direction="vertical" :style="{width:'100%'}" size="large">
                                        <a-skeleton-line :rows="8" />
                                    </a-space>
                                </a-skeleton>
                                <a-scrollbar v-if="!loading" style="height:500px;overflow: auto;">
                                    <!-- <p class="text-xl max-w-6xl whitespace-pre-wrap break-words p-4 rounded-lg">
                                        {{ info.content }}
                                    </p> -->
                                    <MdPreview :theme="theme"  previewTheme="github" :model-value="markdownContent" class="p-2 rounded-lg" />
                                </a-scrollbar>
                            </div>
                        </div>
                        <div v-else>
                            <a-skeleton :loading="loading" :animation="true">
                                <a-space direction="vertical" :style="{width:'100%'}" size="large">
                                    <a-skeleton-line :rows="8" />
                                </a-space>
                            </a-skeleton>
                            <a-scrollbar v-if="!loading" style="height:500px;overflow: auto;">
                                <!-- <p class="text-xl max-w-6xl whitespace-pre-wrap break-words p-4 rounded-lg">
                                    {{ info.content }}
                                </p> -->
                                <MdPreview :theme="theme"  previewTheme="github" :model-value="markdownContent" class="p-2 rounded-lg" />
                            </a-scrollbar>
                        </div>
                    </a-card>
                </div>
            </a-card>
        </a-layout>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref, markRaw, shallowRef  } from 'vue';
import ScanSvg from '@/assets/svg/scan.svg';
import VueOfficeDocx from '@vue-office/docx'
import VueOfficeExcel from '@vue-office/excel'
import VueOfficePptx from '@vue-office/pptx'
import { useAppStore } from '@/store';
import { extractText } from '@/api/doc';
import '@vue-office/docx/lib/index.css'

const appStore = useAppStore();
const loading = ref<boolean>(false);

const theme = computed(() => {
    return appStore.theme;
});

const props = defineProps(['info', 'fileType']);
const compare = ref<boolean>(true);

const currentViewer = shallowRef(null);


const components = {
  docx: markRaw(VueOfficeDocx),
  xlsx: markRaw(VueOfficeExcel),
  pptx: markRaw(VueOfficePptx)
}

const {fileType} = props
currentViewer.value = components[fileType]



const buildSrcURL = (file: string) => {
    let url;
    if (import.meta.env.VITE_API_BASE_URL) {
        url = `${import.meta.env.VITE_API_BASE_URL}/api/v1/sys/docs/preview/${file}`;
    } else {
        url = `${window.origin}/api/v1/sys/docs/preview/${file}`;
    }
    return url;
}

const markdownContent = ref(props.info.content || '');

const extract = () => {
    loading.value = true;
    extractText(props.info.id).then((res) => {
        markdownContent.value = res;
        loading.value = false;
    }).catch(() => {
        loading.value = false;
    });
}

</script>

<style lang="less" scoped>

</style>
