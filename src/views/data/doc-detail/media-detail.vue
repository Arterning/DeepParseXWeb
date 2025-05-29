<template>
    <div class="container">
        <a-layout style="padding: 0 18px">
            <a-card class="general-card">
                <template #title>
                    <a-space size="large">
                        {{ info.title }}
                    </a-space>
                </template>
                <div class="content">
                    <a-card class="info-card">
                        <template #title>
                            <div class="flex gap-5 items-center">
                                {{ $t('文件信息') }}
                            </div>
                        </template>
                        <a-descriptions :column="1">
                            <a-descriptions-item label="标题">
                                {{ info.title }}
                            </a-descriptions-item>
                            <a-descriptions-item label="状态">
                                {{ info.status }}
                            </a-descriptions-item>
                        </a-descriptions>
                    </a-card>

                    <a-space style="padding-top: 22px" />
                    <a-card>
                        <template #title>
                            <div class="flex gap-5 items-center">
                                {{ $t('摘要') }}
                            </div>
                        </template>
                        <p class="text-xl max-w-6xl whitespace-pre-wrap break-words p-4 rounded-lg">
                            {{ descMD }}
                        </p>
                    </a-card>

                    <a-space style="padding-top: 22px" />

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
                                <a-button>重新提取</a-button>
                            </div>
                        </template>
                        <div class="flex gap-1" v-if="compare">
                            <div class="media-box">
                                <icon-music class="media-icon" />
                                <video :src="buildSrcURL(info.file)" class="video" controls></video>
                            </div>
                            <div class="w-1/2">
                                <a-scrollbar style="height:500px;overflow: auto;">
                                    <p class="text-xl max-w-6xl whitespace-pre-wrap break-words p-4 rounded-lg">
                                        {{ info.content }}
                                    </p>
                                </a-scrollbar>
                            </div>
                        </div>
                        <div v-else>
                            <a-scrollbar style="height:500px;overflow: auto;">
                                <p class="text-xl max-w-6xl whitespace-pre-wrap break-words p-4 rounded-lg">
                                        {{ info.content }}
                                </p>
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
import { marked } from 'marked';

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


const descMD = computed(() => {
    if (!props.info.desc) return '';
    return marked(props.info.desc) as string;
})

</script>

<style lang="less" scoped>
.content-box {
    width: 70vw;
    height: 360px;
    overflow: auto;
    background-color: var(--color-bg-1);
    padding: 0 1rem;
}

// .desc{
// //  line-height: 1rem;
// }

.flex {
    display: flex;
}

.media-box {
    // background: #f3f3f3;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 70vw;

    .media-icon {
        position: absolute;
        font-size: 3rem;
        color: #555;
    }
}

.email-title {
    font-weight: bold;
    font-size: 1.5rem;
}

.email-label {
    min-width: 3rem;
    text-align: justify;
    text-align-last: justify;
    margin-right: 1rem;
}

.email-person {
    color: rgb(var(--primary-6));
}

.mb-1 {
    margin-bottom: 0.5rem;
}

.mb-2 {
    margin-bottom: 1rem;
}

.image {
    cursor: pointer;
}

.video {
    width: 100%;
    z-index: 1;
}


::-webkit-scrollbar {
    width: 0.5rem;
    height: 0.5rem;
    display: block;
}

/* 设置滚动条轨道的背景色 */
::-webkit-scrollbar-track {
    background: transparent;
}

/* 设置滚动条滑块的颜色 */
::-webkit-scrollbar-thumb {
    background: #999;
    border-radius: 1rem;
}

/* 设置滚动条滑块在悬停时的颜色 */
::-webkit-scrollbar-thumb:hover {
    background: #777;
}
</style>
