<template>
  <div class="p-4 min-h-screen">
    <!-- Search Input -->
    <div class="relative mb-6">
      <input
        v-model="searchQuery"
        type="text"
        class="w-full pl-12 pr-10 py-4 text-lg bg-white dark:bg-gray-700 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-300 shadow-sm hover:shadow-md"
        placeholder="搜索您感兴趣的内容..."
        @input="handleInput"
        @keyup.enter="handleEnter"
      />
      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
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
    <div v-if="!searchQuery && showHistory && historyItems.length > 0" class="w-full">
      <div class="flex justify-between items-center mb-3">
        <h2 class="text-lg font-semibold text-gray-700">最近搜索</h2>
        <button class="text-sm text-blue-600 hover:text-blue-800 font-medium" @click="clearHistory">
          清除全部
        </button>
      </div>
      <ul class="space-y-2">
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
    <div v-else-if="searchQuery">
      <div class="mb-4 text-md text-gray-600">
        为您找到 <span class="font-bold text-blue-600">{{ total }}</span> 个相关结果
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
            <div class="tracking-wide text-sm text-blue-500 font-semibold uppercase">
              {{ result.entity_type }}
            </div>
            <a
              href="#"
              class="block mt-1 text-lg leading-tight font-bold text-black hover:underline"
              v-html="highlightedHit(result.title)"
            ></a>
            <p class="mt-2 text-gray-500 text-sm" v-html="highlightedHit(result.content)"></p>
          </div>
        </div>
      </div>
      
      <div v-if="!loading && searchResults && searchResults.length === 0" class="text-center py-16">
        <a-empty description="没有找到匹配的结果，换个关键词试试？" />
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="total > 0 && !loading" class="flex justify-center mt-8">
      <a-pagination
        v-model:current="currentPage"
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
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { searchSimilarDocList } from '@/api/doc';

const showHistory = ref(true);
const historyItems = ref<string[]>([]);
const searchResults = ref<any[]>([]);
const total = ref<number>(0);
const searchQuery = ref('');
const router = useRouter();
const loading = ref(false);
const pageSize = ref(10);
const currentPage = ref(1);

const totalPages = computed(() => Math.ceil(total.value / pageSize.value));

const handleInput = async () => {
  if (!searchQuery.value) {
    showHistory.value = true;
    return;
  }
  showHistory.value = false;
  await performSearch(1);
};

const handleEnter = () => {
  if (searchQuery.value) {
    saveHistory();
    performSearch(1);
  }
};

const performSearch = async (page: number) => {
  loading.value = true;
  try {
    const results = await searchSimilarDocList({
      query: searchQuery.value,
      page,
      size: pageSize.value,
    });
    searchResults.value = results.items;
    total.value = results.total;
    currentPage.value = page;
  } catch (error) {
    console.error('搜索失败:', error);
  } finally {
    loading.value = false;
  }
};

const saveHistory = () => {
  const query = searchQuery.value.trim();
  if (!query) return;

  const index = historyItems.value.indexOf(query);
  if (index !== -1) {
    historyItems.value.splice(index, 1);
  }
  historyItems.value.unshift(query);

  if (historyItems.value.length > 8) {
    historyItems.value = historyItems.value.slice(0, 8);
  }

  localStorage.setItem('searchHistory', JSON.stringify(historyItems.value));
};

const historyHandle = (item: string) => {
  searchQuery.value = item;
  handleEnter();
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

onMounted(loadSearchHistory);

const handleResultClick = (item: { entity_type: string; id: any }) => {
  const routeMap: { [key: string]: string } = {
    document: 'DocDetail',
    person: 'PersonDetail',
    org: 'OrgDetail',
    subject: 'SubjectDetail',
  };
  const routeName = routeMap[item.entity_type];

  if (routeName) {
    router.push({ name: routeName, params: { id: item.id } });
  }
  saveHistory();
};

const highlightedHit = (hit: string | undefined) => {
  if (!hit) return '';
  return hit.replace(/<b>(.*?)<\/b>/g, `<b class="text-yellow-500">$1</b>`);
};

const pageChange = (page: number) => {
  if (page > 0 && page <= totalPages.value) {
    performSearch(page);
  }
};

const onPageSizeChange = (size: number) => {
    pageSize.value = size;
    performSearch(1);
};
</script>
  