<template>
    <a-input v-model="searchQuery" class="p-3 w-full rounded-lg" placeholder="搜索您感兴趣的内容" allow-clear
        @input="handleInput" @keyup.enter="handleEnter">
        <template #prefix>
            <icon-search />
        </template>
        </a-input>

        <div v-if="!searchQuery" v-show="showHistory" class="history w-full">
            <div v-if="historyItems.length > 0" class="history-header">
            <div class="tip">最近搜索</div>
            <span class="del" @click="clearHistory">清除全部</span>
            </div>
            <a-list style="margin-top: 10px" :max-height="580" :scrollbar="true" v-if="historyItems.length > 0">
            <a-list-item v-for="(item, index) in historyItems" :key="item" class="history-item"
                @click="historyHandle(item)">
                <icon-history />
                <span class="time">{{ item }}</span>
                <icon-delete type="close" class="delete-icon" @click.stop="deleteHistoryItem(index)" />
            </a-list-item>
            </a-list>
        </div>

        <div v-else class="searchResults">
        <div class="tip">搜索到{{ total }}个结果</div>
        <a-list :max-height="450" :scrollbar="true" :loading="loading">
            <a-list-item v-for="result in searchResults" :key="result.id" class="ResultItem" @click="handleResultClick(result)">
            <a-list-item-meta>
                <template #title>
                <a>
                    <span v-html="highlightedHit(result.title)"></span>
                </a>
                </template>
            </a-list-item-meta>
            <a-list-item-meta>
                <template #description>
                <span v-html="highlightedHit(result.content)"></span>
                </template>
            </a-list-item-meta>
            </a-list-item>
        </a-list>
        </div>
        
        <a-pagination 
            v-model:page-size="pageSize" class="pagination" :total="total" show-total show-jumper
            show-page-size @change="pageChange" @page-size-change="onPageSizeChange" />
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, reactive } from 'vue';
  //   import { result } from 'lodash';
  import { useRouter } from 'vue-router';
  import { searchSimilarDocList } from '@/api/doc';
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
  
  const handleInput = async () => {
    if (!searchQuery.value) {
      showHistory.value = true;
    } else {
      showHistory.value = false;
      loading.value = true;
      try {
        const results = await searchSimilarDocList({
          query: searchQuery.value,
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
  
  const handleEnter = () => {
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
    handleEnter();
    handleInput();
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

    if (item.entity_type === 'document') {
      router.push({
        name: 'DocDetail',
        params: { id: item.id },
      });
      // window.open(window.origin + '/data/doc-detail?docId='+item.id);
    }
  
    if (item.entity_type === 'person') {
      router.push({
        name: 'DocDetail',
        query: { personId: item.id },
      });
    }
  
    if (item.entity_type === 'org') {
      router.push({
        name: 'DocDetail',
        query: { orgId: item.id },
      });
    }
  
    if (item.entity_type === 'subject') {
      router.push({
        name: 'DocDetail',
        query: { subjectId: item.id },
      });
    }
  
    handleEnter();
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
        const results = await searchSimilarDocList({
          query: searchQuery.value, page: current, size: pageSize.value 
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
        const results = await searchSimilarDocList({
          query: searchQuery.value, page: 0, size: _pageSize 
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
  .banner {
    width: 100%;
    padding: 20px 20px 0 20px;
    background-color: var(--color-bg-2);
    border-radius: 4px 4px 0 0;
  }

  :deep(.arco-icon-home) {
    margin-right: 6px;
  }
  .nav-btn {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .modal-title {
    width: 100%;
  }
  
  .search {
    position: relative;
    width: 100%;
  }
  
  .search:focus {
    outline: none;
    box-shadow: none;
  }
  
  .del {
    cursor: pointer;
    color: rgb(22, 93, 255);
  }
  
  .time {
    margin-left: 15px;
  }
  
  .history,
  .searchResults {
    height: 100%;
  
    .tip {
      color: #F6B17A;
      padding: 8px;
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
    background-color: var(--color-bg-3);
    opacity: 1.5;
    cursor: pointer;
    color: rgb(22, 93, 255);
  }
  
  .delete-icon {
    float: right;
    cursor: pointer;
    display: none;
    color: rgb(22, 93, 255);
  }
  
  .history-item:hover .delete-icon {
    display: block;
  }
  
  .history {
    margin-top: 0;
  }
  
  .searchResults {
    margin-top: 0;
  }
  
  .pagination {
    margin-top: 20px;
  }
  
  </style>
  