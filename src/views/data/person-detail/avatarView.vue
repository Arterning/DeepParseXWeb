<template>
    <!-- 头像展示区 -->
    <div class="avatar-container">
      <div class="avatar-preview" @click="openGallery">
        <img 
          :src="currentAvatar" 
          alt="用户头像"
          class="preview-image"
        />
      </div>
      <!-- 全屏画廊 -->
      <div v-show="showGallery" class="gallery-overlay">
        <div class="gallery-header">
          <a-button 
            type="text" 
            @click="closeGallery"
            class="close-btn"
          >
            <template #icon><IconClose /></template>
          </a-button>
        </div>
  
        <a-carousel 
          v-model:current="activeIndex"
          :autoplay="false"
          animation-name="fade"
          class="gallery-carousel"
        >
          <a-carousel-item v-for="(avatar, index) in avatars" :key="index">
            <img 
              :src="avatar" 
              :alt="`头像${index + 1}`"
              class="gallery-image"
            />
          </a-carousel-item>
        </a-carousel>
      </div>
    </div>
  </template> 
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { IconClose } from '@arco-design/web-vue/es/icon';
  
  // 本地头像路径解决方案
  const getImageUrl = (name: string) => {
    return new URL(`./avatar/${name}`, import.meta.url).href;
  };
  
  // 直接定义本地头像数组
  const avatars = ref([
    getImageUrl('mjq.jpeg'),  // 假设图片存放在组件同目录的avatars文件夹
    getImageUrl('dcx.jpeg'),
    getImageUrl('syx.jpeg')
  ]);
  
  const showGallery = ref(false);
  const activeIndex = ref(0);
  const currentAvatar = ref(avatars.value[0]);
  
  const openGallery = () => {
    showGallery.value = true;
    document.body.style.overflow = 'hidden';
    console.log('当前头像路径:', avatars.value); // 调试路径
  };
  
  const closeGallery = () => {
    showGallery.value = false;
    document.body.style.overflow = '';
  };
  
  // 验证图片加载
  onMounted(() => {
    avatars.value.forEach(url => {
      new Image().src = url;
      console.log('预加载头像:', url); 
    });
  });
  </script>
  
  <style scoped>
  .gallery-overlay {
  position: fixed;  /* 改为固定定位 */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;    /* 确保足够高的层级 */
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
}
.gallery-carousel {
  flex: 1;
  height: calc(100vh - 60px); /* 留出头部空间 */
}

.gallery-header {
  padding: 16px;
  text-align: right;
}

.close-btn {
  color: #fff;
  font-size: 20px;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
  /* 保持原有样式不变 */
  :deep(.avatar-preview) {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.3s;
  }
  
  :deep(.preview-image) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    background: #f0f2f5; /* 加载失败时的背景色 */
  }
  
  /* 其他样式保持不变... */
  </style>