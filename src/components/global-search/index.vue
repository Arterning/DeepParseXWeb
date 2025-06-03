<template>
  <a-input 
    v-model="searchQuery"
    placeholder="搜索"
    allow-clear
    class="rounded-lg p-2 w-[50vw]"  @input="handleInput">
    <template #append>
      <icon-search />
    </template>
  </a-input>
  <div v-if="searchQuery && searchResults?.length > 0"  class="searchResults">
    <div class="result-count">搜索到{{ searchResults?.length }}个结果</div>

    <a-list :max-height="500">
      <a-list-item v-for="result in searchResults" :key="result.id">
        <a-list-item-meta>
          <template #title>
            <a-link class="ResultItem" @click="handleResultClick(result)">{{ result.name }}</a-link>
          </template>
          <template #description>
            <span v-html="highlightedHit(result.hit)"></span>
          </template>
          <template #avatar>
            <a-avatar shape="square">{{ result.type?.toUpperCase() }}</a-avatar>
          </template>
        </a-list-item-meta>
      </a-list-item>
    </a-list>
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


const handleInput = async () => {
  if (!searchQuery.value) {
    showHistory.value = true;
  } else {
    showHistory.value = false;
    try {
      const results = await searchSysDocList({
        tokens: searchQuery.value,
      });
      searchResults.value = results.items;
    } catch (error) {
      // console.error('搜索失败:', error);
    }
  }
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
};

const highlightedHit = (hit: string | undefined) => {
  if (!hit) {
    return "";
  }
  return hit.replace(/<b>(.*?)<\/b>/g, `<b style="color: yellow;">$1</b>`);
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
</style>