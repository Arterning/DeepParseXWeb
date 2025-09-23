<template>
  <div class="w-[80%] flex flex-col mx-auto banner">
      <a-input v-model="searchQuery" class="w-[30vw] mx-auto rounded-lg" placeholder="搜索" allow-clear
        @input="handleInput">
        <template #prefix>
          <icon-search />
        </template>
      </a-input>

    <div v-if="searchQuery" class="searchResults">
      <div class="tip">"{{ searchQuery }}"搜索到{{ total }}个结果</div>
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
              <span v-html="highlightedHit(result.hit)"></span>
            </template>
          </a-list-item-meta>
        </a-list-item>
      </a-list>
      <a-pagination v-model:page-size="pageSize" class="pagination" :total="total" show-total show-jumper
        show-page-size @change="pageChange" @page-size-change="onPageSizeChange" />
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
  
  const handleInput = async () => {
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
      } catch (error) {
        console.error('搜索失败:', error);
      } finally {
        loading.value = false;
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
  .banner {
    width: 100%;
    padding: 20px 20px 0 20px;
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
      font-weight: bold;
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
  