<template>
    <a-card class="info-card">
        <template #title>
            <div class="flex gap-5 items-center">
                <InfoSvg class="w-8 h-8"/>
            </div>
        </template>
        <a-descriptions :column="2">
        <a-descriptions-item label="文件原名">
            {{ info.title }}
        </a-descriptions-item>
        <a-descriptions-item label="文件名">
            {{ info.name }}
        </a-descriptions-item>
        <!-- 文件来源 -->
        <a-descriptions-item label="文件来源">
            {{ info.source }}
        </a-descriptions-item>
        <a-descriptions-item label="文件类型">
            {{ info.type }}
        </a-descriptions-item>
        <a-descriptions-item label="文件大小">
            {{ info.size }}
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">
            {{ info.created_time }}
        </a-descriptions-item>
        <a-descriptions-item label="修改时间">
            {{ info.updated_time }}
        </a-descriptions-item>
        <a-descriptions-item label="创建人">
            {{ info.created_user }}
        </a-descriptions-item>
        <a-descriptions-item label="文件标签">
            <a-space wrap>
                <a-tag v-for="tag of info.tags" :key="tag.id">
                {{ tag.name }}
                </a-tag>
            </a-space>
        </a-descriptions-item>
        <a-descriptions-item label="状态">
            <a-tag v-if="info.status === 0" :color="`orange`" bordered>
              {{ $t(`处理中`) }}
            </a-tag>
            <a-tag v-else-if="info.status === 1" :color="`green`" bordered>
              {{ $t(`admin.menu.form.status.${info.status}`) }}
            </a-tag>
            <a-tag v-else-if="info.status === 2" :color="`red`" bordered>
              {{ $t(`解析失败`) }}
            </a-tag>
        </a-descriptions-item>
        <!-- 错误信息 -->
        <a-descriptions-item label="错误信息" v-if="info.status === 2">
            {{ info.error_msg }}
        </a-descriptions-item>
    </a-descriptions>
    </a-card>
</template>

<script lang="ts" setup>
import InfoSvg from '@/assets/svg/info.svg';

const props = defineProps(['info']);

</script>