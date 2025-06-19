<template>
    <div class="container">
        <a-layout style="padding: 0 18px">
            <a-card class="general-card">
                <template #title>
                    <a-space size="large">
                        <span class="font-bold">{{ info.title }}</span>
                    </a-space>
                </template>
                <div class="content">
                    <a-card class="info-card">
                        <template #title>
                            <div class="flex justify-between items-center">
                                <div class="flex gap-3">
                                    {{ $t('内容') }}
                                </div>
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
                            <div class="w-1/2 h-[500px]">
                                <!-- <icon-music class="media-icon" /> -->
                                <video :src="buildSrcURL(info.file)" class="w-full h-full" controls></video>
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
                                    <MdPreview :theme="theme" previewTheme="github" :model-value="markdownContent" class="p-2 rounded-lg" />
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
                                <MdPreview :theme="theme" previewTheme="github" :model-value="markdownContent" class="p-2 rounded-lg" />
                            </a-scrollbar>
                        </div>
                    </a-card>
                </div>
            </a-card>
        </a-layout>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useAppStore } from '@/store';
import { extractText } from '@/api/doc';

const appStore = useAppStore();

const theme = computed(() => {
    return appStore.theme;
});


const props = defineProps(['info']);
const compare = ref<boolean>(true);

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

const loading = ref<boolean>(false);
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
