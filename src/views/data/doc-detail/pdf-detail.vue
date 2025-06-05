<template>
    <div class="container">
        <a-layout style="padding: 0 18px">
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
                                <a-button>重新提取</a-button>
                            </div>
                        </template>
                        <div class="flex gap-1" v-if="compare">
                            <iframe :src="buildSrcURL(info.file)" frameborder="0" class="h-[500px] w-1/2 "></iframe>
                            <div class="w-1/2">
                                <a-scrollbar style="height:500px;overflow: auto;">
                                    <!-- <p class="text-xl max-w-6xl whitespace-pre-wrap break-words p-4 rounded-lg">
                                        {{ info.content }}
                                    </p> -->
                                    <MdPreview :theme="theme"  previewTheme="github" :model-value="info.content" class="p-2 rounded-lg" />
                                </a-scrollbar>
                            </div>
                        </div>
                        <div v-else>
                            <a-scrollbar style="height:500px;overflow: auto;">
                                <!-- <p class="text-xl max-w-6xl whitespace-pre-wrap break-words p-4 rounded-lg">
                                    {{ info.content }}
                                </p> -->
                                <MdPreview :theme="theme"  previewTheme="github" :model-value="info.content" class="p-2 rounded-lg" />
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
import ScanSvg from '@/assets/svg/scan.svg';
import InfoSvg from '@/assets/svg/info.svg';
import { useAppStore } from '@/store';

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

</script>

<style lang="less" scoped>

</style>
