<template>
    <a-carousel
      :autoPlay="true"
      animation-name="card"
      indicator-position="outer"
      class="mt-8 mx-auto"
      :style="{
        width: '80%',
        height: '340px',
      }"
    >
      <a-carousel-item :key="index" v-for="(item, index) in hotDocs" :style="{ width: '60%' }">
        <div class="flex flex-col justify-center items-center cursor-pointer" 
            @click="
                $router.push({
                    name: 'DocDetail',
                    params: { 
                        id: item.id,
                    },
                    query: {
                        appendix: item.title,
                    }
                })
            ">
            <img
                v-if="item.type === '图片'"
                :src="buildSrcURL(item.file || '')"
            />
            <component v-else :is="getSvgByFileName(item.title || '')" />
            <div class="flex flex-col justify-center items-center">
                <span class="text-lg font-semibold">{{ item.title }}</span>
                <span class="text-sm text-gray-400">{{ item.desc }}</span>
                <!-- 上传日期 -->
                <span class="text-sm text-gray-400">上传于 {{ item.created_time }}</span>
            </div>
        </div>
      </a-carousel-item>
    </a-carousel>
  </template>
  
  <script setup lang="ts">
    import { onMounted, ref } from 'vue';
    import { queryRecentDocs, SysDocRes } from '@/api/doc';
    import useLoading from '@/hooks/loading';
    import { getSvgByFileName, buildSrcURL } from '@/utils/doc';


    const hotDocs = ref<SysDocRes[]>([]);  
    const { loading, setLoading } = useLoading(true);
    
    // 请求数据
    const fetchData = async () => {
        setLoading(true);
        try {
        const res = await queryRecentDocs();
        hotDocs.value = res;
        } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        } finally {
        setLoading(false);
        }
    };

    onMounted(() => {
        fetchData();
    });
  </script>
  