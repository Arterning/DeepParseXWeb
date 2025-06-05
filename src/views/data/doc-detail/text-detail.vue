<template>
    <div class="container">
        <a-layout class="flex-layout">
            <a-card class="general-card">
                <template #title>
                    <a-space size="large">
                        <span class="font-bold">{{ info.title }}</span>
                    </a-space>
                </template>
                
                <div class="content">
                    <a-card class="info-card">
                        <template #title>
                            <div class="flex justify-end items-center">
                                <ScanSvg class="w-8 h-8"/>
                            </div>
                        </template>
                        <div>
                            <a-scrollbar style="height:500px;overflow: auto;">
                                <!-- <p class="text-xl max-w-6xl whitespace-pre-wrap break-words p-4 rounded-lg">
                                        {{ info.content }}
                                </p> -->
                                <MdPreview :theme="theme" previewTheme="github" :model-value="info.content" class="p-2 rounded-lg" />
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
import { useAppStore } from '@/store';

const appStore = useAppStore();

const props = defineProps(['info']);

const theme = computed(() => {
    return appStore.theme;
});

</script>

<style lang="less" scoped>

</style>
