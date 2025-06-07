<template>
  <div class="search-container">
    <a-input 
      v-model="searchQuery"
      placeholder="搜索"
      allow-clear
      class="rounded-lg w-[50vw]"  
      @input="handleInput"
    >
      <template #prefix>
        <icon-loading v-if="searchLoading" />
        <icon-search v-else class="cursor-pointer" @click="handleInput"/>
      </template>
    </a-input>
    <!-- 搜索结果 -->
    <div v-if="searchQuery && searchResults?.length > 0 && showResults" class="search-results-dropdown">
      <a-card class="results-card">
        <template #extra>
          <div class="flex gap-6 items-center justify-between">
            <div>搜索到{{ searchResults?.length }}个结果</div>
            <icon-close class="close-icon" @click="handleClose" />
          </div>
        </template>
        <a-list :max-height="500">
          <a-list-item v-for="result in searchResults" :key="result.id" class="cursor-pointer"  @click="handleResultClick(result)">
            <a-list-item-meta>
              <template #title>
              <a>
                <span v-html="highlightedHit(result.title)"></span>
              </a>
            </template>
              <a-list-item-meta>
              <template #title>
                <a>
                  <span v-html="highlightedHit(result.title)"></span>
                </a>
              </template>
            </a-list-item-meta>
              <template #description>
                <span v-html="highlightedHit(result.hit)"></span>
              </template>
              <template #avatar>
                <a-avatar shape="square">{{ result.type?.toUpperCase() }}</a-avatar>
              </template>
            </a-list-item-meta>
          </a-list-item>
        </a-list>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { SysDocQueryRes, searchSysDocList } from '@/api/doc';
//   import { result } from 'lodash';
import { useRouter } from 'vue-router';

const showHistory = ref(false);
const historyItems = ref<string[]>([]);
const searchResults = ref();
const searchQuery = ref('');
const router = useRouter(); // 使用 Vue Router
const showResults = ref(true);
const searchLoading = ref(false);


const handleInput = async () => {
  if (!searchQuery.value) {
    showHistory.value = true;
    showResults.value = false;
  } else {
    showHistory.value = false;
    showResults.value = true;
    searchLoading.value = true;
    try {
      const results = await searchSysDocList({
        tokens: searchQuery.value,
      });
      searchResults.value = results.items;
    } catch (error) {
      // console.error('搜索失败:', error);
    } finally {
      searchLoading.value = false;
    }
  }
};

const handleClose = () => {
  showResults.value = false;
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
const handleResultClick = (item: { id: number }) => {
  router.push({ name: 'DocDetail', params: { id: item.id } });
  showResults.value = false;
};

const highlightedHit = (hit: string | undefined) => {
  if (!hit) {
    return "";
  }
  return hit.replace(/<b>(.*?)<\/b>/g, `<b style="color: #F6B17A;">$1</b>`);
}
</script>

<style scoped lang="less">
.nav-btn {
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-title {
  width: 100%;
  margin-right: 2rem;
  border-radius: 2rem;
}

.search {
  position: relative;
  width: 100%;
  background-color: transparent;
  border: none;
  box-shadow: none;
}

.search:focus {
  outline: none;
  box-shadow: none;
}

.del {
  cursor: pointer;
  color: #13c2c2;
}

.time {
  margin-left: 15px;
}

.history,
.searchResults {
  width: 100%;
  height: 100%;

  .result-count{
    margin-bottom: 1rem;
  }
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
}

.history-item:hover,
.ResultItem:hover {
  color: #13c2c2;
  opacity: 1.5;
  cursor: pointer;
}

.delete-icon {
  float: right;
}

.history {
  margin-top: 0;
}

.searchResults {
  margin-top: 0;
}

.search-container {
  position: relative;
  display: inline-block;
}

.search-results-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  margin-top: 4px;
}

.results-card {
  background-color: var(--color-bg-2);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.result-count {
  margin-bottom: 1rem;
  color: var(--color-text-2);
}

.ResultItem:hover {
  color: rgb(var(--primary-6));
  opacity: 1.5;
  cursor: pointer;
}
.close-icon {
  cursor: pointer;
  color: var(--color-text-2);
  transition: color 0.2s;
}

.close-icon:hover {
  color: var(--color-text-1);
}
</style>