<template>
  <div class="p-4">
    <!-- Search Input -->
    <div class="relative mb-6">
      <input
        v-model="searchQuery"
        type="text"
        class="w-full pl-12 pr-10 py-4 text-lg bg-white dark:bg-gray-700 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-300 shadow-sm hover:shadow-md"
        placeholder="搜索您感兴趣的内容..."
        @keyup.enter="handleSearch"
      />
      <div
        class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
      >
        <icon-search class="text-gray-400" size="24" />
      </div>
      <button
        v-if="searchQuery"
        class="absolute inset-y-0 right-0 pr-4 flex items-center"
        @click="searchQuery = ''"
      >
        <icon-close-circle class="text-gray-400 hover:text-gray-600" size="20" />
      </button>
    </div>

    <!-- History Section -->
    <div v-if="!searchQuery && showHistory" class="w-full">
      <div
        v-if="historyItems.length > 0"
        class="flex justify-between items-center mb-3"
      >
        <h2 class="text-lg font-semibold text-gray-700">最近搜索</h2>
        <button
          class="text-sm text-blue-600 hover:text-blue-800 font-medium"
          @click="clearHistory"
        >
          清除全部
        </button>
      </div>
      <ul v-if="historyItems.length > 0" class="space-y-2">
        <li
          v-for="(item, index) in historyItems"
          :key="item"
          class="flex items-center justify-between bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
          @click="historyHandle(item)"
        >
          <div class="flex items-center">
            <icon-history class="text-gray-500 mr-3" />
            <span class="text-gray-800 dark:text-gray-200">{{ item }}</span>
          </div>
          <button @click.stop="deleteHistoryItem(index)">
            <icon-delete class="text-gray-400 hover:text-red-500" />
          </button>
        </li>
      </ul>
    </div>

    <!-- Search Results Section -->
    <div v-else class="searchResults">
      <div class="mb-4 text-md text-gray-600">
        为您找到 {{ total }} 个相关结果
      </div>

      <div v-if="loading" class="text-center py-10">
        <a-spin size="large" tip="正在努力搜索中..." />
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="result in searchResults"
          :key="result.id"
          class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          @click="handleResultClick(result)"
        >
          <div class="p-6">
            <div
              class="tracking-wide text-sm text-blue-500 font-semibold uppercase"
            >
              {{ result.entity_type }}
            </div>
            <a
              href="#"
              class="block mt-1 text-lg leading-tight font-bold text-black hover:underline"
              v-html="highlightedHit(result.title)"
            ></a>
            <p
              class="mt-2 text-gray-500 text-sm"
              v-html="highlightedHit(result.hit)"
            ></p>
          </div>
        </div>
      </div>

      <div
        v-if="!loading && searchResults && searchResults.length === 0"
        class="text-center py-16"
      >
        <a-empty description="没有找到匹配的结果，换个关键词试试？" />
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="total > 0" class="flex justify-center mt-8">
      <a-pagination
        v-model:page-size="pageSize"
        :total="total"
        show-total
        show-jumper
        show-page-size
        @change="pageChange"
        @page-size-change="onPageSizeChange"
      />
    </div>
  </div>
</template>
  
  <script setup lang="ts">
  import { ref, onMounted, reactive } from 'vue';
  //   import { result } from 'lodash';
  import { useRouter } from 'vue-router';
  import { searchSysDocList } from '@/api/doc';
  // import { SearchItem, SearchRes, search } from '@/api/dashboard';
  
  const visible = ref(true);
  const showHistory = ref(true);
  const historyItems = ref<string[]>([]);
  const searchResults = ref();
  // const search_after = ref<string[]>();
  const total = ref<number>(0);
  const searchQuery = ref('');
  const router = useRouter(); // 使用 Vue Router
  const loading = ref(false);
  const pageSize = ref(10);
  
  const handleSearch = async () => {
    if (!searchQuery.value) {
      showHistory.value = true;
    } else {
      showHistory.value = false;
      loading.value = true;
      try {
        const results = await searchSysDocList({
          tokens: searchQuery.value,
        });
        searchResults.value = results.items;
        total.value = results.total;
        // console.log("total", total.value);
        saveHistory();
      } catch (error) {
        console.error('搜索失败:', error);
      } finally {
        loading.value = false;
      }
    }
  };
  
  const handleSaveHistory = () => {
    if (searchQuery.value) {
      saveHistory();
    }
  };
  
  const saveHistory = () => {
    // 如果搜索历史中已经存在该记录，则先删除它
    const index = historyItems.value.indexOf(searchQuery.value);
    if (index !== -1) {
      historyItems.value.splice(index, 1);
    }
    // 将新记录插入到数组的第一个位置
    historyItems.value.unshift(searchQuery.value);
  
    // 只保留最多5条历史记录
    if (historyItems.value.length > 8) {
      historyItems.value = historyItems.value.slice(0, 8);
    }
  
    localStorage.setItem('searchHistory', JSON.stringify(historyItems.value));
  };
  
  const historyHandle = (item: any) => {
    searchQuery.value = item;
    handleSaveHistory();
    handleSearch();
  };
  
  
  const clearHistory = () => {
    historyItems.value = [];
    localStorage.removeItem('searchHistory');
  };
  
  const deleteHistoryItem = (index: number) => {
    historyItems.value.splice(index, 1);
    localStorage.setItem('searchHistory', JSON.stringify(historyItems.value));
  };
  
  const loadSearchHistory = () => {
    const storedHistory = localStorage.getItem('searchHistory');
    if (storedHistory) {
      historyItems.value = JSON.parse(storedHistory);
    }
  };
  
  // 在组件挂载时加载历史搜索记录
  onMounted(loadSearchHistory);
  
  // 搜索结果跳转
  const handleResultClick = (item: { entity_type: string; id: any }) => {
    
    router.push({
      name: 'DocDetail',
      params: { id: item.id },
    });

    handleSaveHistory();
    visible.value = false;
  };
  
  const highlightedHit = (hit: string | undefined) => {
    if (!hit) {
      return '';
    }
    return hit.replace(/<b>(.*?)<\/b>/g, `<b style="color: #F6B17A;">$1</b>`);
  };
  
  const pageChange = async (current: number) => {
    try {
        loading.value = true;
        const results = await searchSysDocList({
          tokens: searchQuery.value, page: current, size: pageSize.value 
        });
        searchResults.value = results.items;
        total.value = results.total;
    } catch (error) {
        console.error('搜索失败:', error);
    } finally {
        loading.value = false;
    }
}


const onPageSizeChange = async (_pageSize: number) => {
    try {
        loading.value = true;
        const results = await searchSysDocList({
          tokens: searchQuery.value, page: 0, size: _pageSize 
        });
        searchResults.value = results.items;
        total.value = results.total;
        pageSize.value = _pageSize; // 更新页面大小
    } catch (error) {
        console.error('搜索失败:', error);
    } finally {
        loading.value = false;
    }
};
  </script>
  
  <style scoped lang="less">
  </style>
  
  