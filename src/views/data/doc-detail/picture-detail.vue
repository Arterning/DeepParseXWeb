<template>
    <div class="container">
        <a-layout>
            <a-card class="general-card">
                <template #title>
                    <div class="flex justify-start gap-3 items-center">
                        
                        <a-image fit="contain" :src="buildSrcURL(info.file)" class="w-16 h-12" />

                        <span class="font-bold">{{ info.title }}</span>
                    </div>
                </template>
                <div class="content">
                    <a-card class="info-card">
                        <template #title>
                            <div class="flex justify-between items-center">
                                <div class="flex gap-3">
                                    
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
                            <div class="w-1/2 relative">
                                <a-scrollbar ref="scrollbarRef" @mousedown="handleScrollbarMouseDown"  style="height:800px;overflow: auto;">

                                    <div class="custom-image-toolbar">
                                        <a-space>
                                            <a-tooltip content="放大">
                                                <a-button shape="circle" @click="zoom(0.2)">
                                                    <icon-plus />
                                                </a-button>
                                            </a-tooltip>
                                            <a-tooltip content="缩小">
                                                <a-button shape="circle" @click="zoom(-0.2)">
                                                    <icon-minus />
                                                </a-button>
                                            </a-tooltip>
                                            <a-tooltip content="重置">
                                                <a-button shape="circle" @click="resetImage">
                                                    <icon-refresh />
                                                </a-button>
                                            </a-tooltip>
                                            <!-- <a-tooltip :content="isDragging ? '释放拖动' : '拖动模式'">
                                                <a-button 
                                                    shape="circle" 
                                                    @click="toggleDragMode"
                                                    >
                                                <icon-drag-arrow />
                                                </a-button>
                                            </a-tooltip> -->
                                        </a-space>
                                    </div>

                                    <div 
                                        class="image-container" 
                                        ref="imageContainer"
                                        :style="containerStyle"
                                        >
                                        <a-image 
                                            :src="buildSrcURL(info.file)" 
                                            fit="cover"
                                            :preview="false"
                                            ref="imageRef"
                                            :style="imageStyle"
                                            @mousedown="startDrag"
                                        />
                                    </div>

                                    
                                    
                                </a-scrollbar>
                            </div>
                            <div class="w-1/2">
                                <a-skeleton :loading="loading" :animation="true">
                                    <a-space direction="vertical" :style="{width:'100%'}" size="large">
                                        <a-skeleton-line :rows="16" />
                                    </a-space>
                                </a-skeleton>
                                <a-scrollbar v-if="!loading" style="height:800px;overflow: auto;">
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
                                    <a-skeleton-line :rows="16" />
                                </a-space>
                            </a-skeleton>
                            <a-scrollbar v-if="!loading" style="height:800px;overflow: auto;">
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
import { computed, onBeforeUnmount, ref } from 'vue';
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

const imageRef = ref(null);
const currentScale = ref(1);

const position = ref({ x: 0, y: 0 });
const isDragging = ref(true);
const startDragPos = ref({ x: 0, y: 0 });
const startMousePos = ref({ x: 0, y: 0 });
const imageContainer = ref(null);
const scrollbarRef = ref(null);

// 计算样式
const imageStyle = computed(() => ({
  transform: `scale(${currentScale.value})`,
  transformOrigin: '0 0',
  cursor: isDragging.value ? 'grabbing' : 'grab',
  display: 'block',
  maxWidth: 'none' // 禁用最大宽度限制
}));

const containerStyle = computed(() => ({
  width: '100%',
  height: '100%',
  position: 'relative',
  overflow: 'hidden'
}));

// 更新图片位置
const updateImagePosition = () => {
  if (imageRef.value?.$el) {
    const imgEl = imageRef.value.$el.querySelector('img');
    if (imgEl) {
      imgEl.style.transform = `translate(${position.value.x}px, ${position.value.y}px) scale(${currentScale.value})`;
    }
  }
};

// 缩放功能
const zoom = (delta: number) => {
  const oldScale = currentScale.value;
  currentScale.value = Math.max(0.5, Math.min(3, currentScale.value + delta));
  
  // 保持缩放中心位置
  if (imageContainer.value && oldScale !== currentScale.value) {
    const containerRect = imageContainer.value.getBoundingClientRect();
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;
    
    position.value = {
      x: position.value.x + (centerX - position.value.x) * (1 - currentScale.value / oldScale),
      y: position.value.y + (centerY - position.value.y) * (1 - currentScale.value / oldScale)
    };
    
    updateImagePosition();
  }
};

// 重置功能
const resetImage = () => {
  currentScale.value = 1;
  position.value = { x: 0, y: 0 };
  updateImagePosition();
};

// 拖动模式切换
const toggleDragMode = () => {
  isDragging.value = !isDragging.value;
};


// 滚动条区域鼠标按下处理
const handleScrollbarMouseDown = (e: any) => {
  if (isDragging.value && e.button === 0) { // 左键
    startDrag(e);
  }
};

// 开始拖动
const startDrag = (e: any) => {
  if (!isDragging.value) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  startMousePos.value = { x: e.clientX, y: e.clientY };
  startDragPos.value = { ...position.value };
  
  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('mouseleave', stopDrag);
};

// 处理拖动
const handleDrag = (e: any) => {
  if (!isDragging.value) return;
  
  const dx = e.clientX - startMousePos.value.x;
  const dy = e.clientY - startMousePos.value.y;
  
  position.value = {
    x: startDragPos.value.x + dx,
    y: startDragPos.value.y + dy
  };
  
  updateImagePosition();
};

// 停止拖动
const stopDrag = () => {
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', stopDrag);
  document.removeEventListener('mouseleave', stopDrag);
};

// 组件卸载时清理事件监听
onBeforeUnmount(() => {
  stopDrag();
});
</script>

<style lang="less" scoped>
    .image-container {
        width: 100%;
        height: 100%;
        touch-action: none; /* 禁用触摸默认行为 */
    }

    .custom-image-toolbar {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--color-bg-3);
        padding: 8px 16px;
        border-radius: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        z-index: 100;
        display: flex;
        gap: 8px;
    }



</style>
