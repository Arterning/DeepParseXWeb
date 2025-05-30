<template>
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
        <a-descriptions-item label="状态">
            {{ info.status }}
        </a-descriptions-item>
    </a-descriptions>
</template>

<script lang="ts" setup>

const props = defineProps(['info']);

</script>