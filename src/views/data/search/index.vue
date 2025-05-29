<template>
  <div class="container">
    <a-layout style="padding: 0 18px">
      <Breadcrumb :items="[$t('menu.data'), $t('搜索')]" />
      <a-card :title="$t(' ')" class="general-card">
        <a-input-group class="w-full flex gap-2">
          <a-select v-model="selectValue" :options="[
            '文件名称',
            '人物名称',
            '组织名称',
            '社交账号',
            '邮箱账号',
            '邮件名称',
            '新闻数据',
          ]" placeholder="请选择搜索类型" class="w-1/3 p-3"/>
          <a-input v-model="searchQuery" class="p-3" placeholder="搜索您感兴趣的内容" allow-clear
            @input="handleInput" @keyup.enter="handleEnter">
            <template #prefix>
              <icon-search />
            </template>
          </a-input>
          <a-button type="primary" class="p-5 rounded-md" @click="handleInput">搜索</a-button>
          <a-button type="outline" class="p-5 rounded-md" @click="higherSearch">高级搜索</a-button>
        </a-input-group>
        <a-collapse :active-key="collapseBtn" style="border: none">
          <a-collapse-item key="1" :show-expand-icon="false">
            <a-form :model="form" layout="horizontal" labelCol="{ span: 4 }" wrapperCol="{ span: 14 }"
              v-if="selectValue === '文件名称'">
              <a-row>
                <a-col :span="8">
                  <a-form-item label="文件名">
                    <a-input v-model="form.fileName" placeholder="请输入文件名" />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="上传用户">
                    <a-input v-model="form.uploadUser" placeholder="请输入上传用户" />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="文件原名">
                    <a-input v-model="form.originalName" placeholder="请输入文件原名" />
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row>
                <a-col :span="8">
                  <a-form-item label="关联文件">
                    <a-input v-model="form.relatedFile" placeholder="请输入关联文件" />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="关联组织">
                    <a-input v-model="form.relatedOrganization" placeholder="请输入关联组织" />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="关联人物">
                    <a-input v-model="form.relatedPerson" placeholder="请输入关联人物" />
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row>
                <a-col :span="8">
                  <a-form-item label="文件所属部门">
                    <a-select v-model="form.department" placeholder="请选择文件所属部门">
                      <a-select-option value="department1">部门1</a-select-option>
                      <a-select-option value="department2">部门2</a-select-option>
                      <!-- 更多部门选项 -->
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="文件来源">
                    <a-select v-model="form.fileSource" placeholder="请选择文件来源">
                      <a-select-option value="source1">来源1</a-select-option>
                      <a-select-option value="source2">来源2</a-select-option>
                      <!-- 更多来源选项 -->
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="文件类型">
                    <a-select v-model="form.fileType" placeholder="请选择文件类型">
                      <a-select-option value="type1">类型1</a-select-option>
                      <a-select-option value="type2">类型2</a-select-option>
                      <!-- 更多类型选项 -->
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
            <a-form :model="form" layout="horizontal" labelCol="{ span: 4 }" wrapperCol="{ span: 14 }"
              v-if="selectValue === '人物名称'">
              <a-row>
                <a-col :span="8">
                  <a-form-item label="姓名">
                    <a-input v-model="form.name" placeholder="请输入姓名" />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="职业">
                    <a-input v-model="form.occupation" placeholder="请输入职业" />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="其他名称">
                    <a-input v-model="form.otherName" placeholder="请输入其他名称" />
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row>
                <a-col :span="8">
                  <a-form-item label="性别">
                    <a-select v-model="form.gender" placeholder="请选择性别">
                      <a-select-option value="male">男</a-select-option>
                      <a-select-option value="female">女</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="所属组织">
                    <a-select v-model="form.organization" placeholder="请选择所属组织">
                      <!-- 组织选项可以根据实际需求添加 -->
                      <a-select-option value="org1">组织1</a-select-option>
                      <a-select-option value="org2">组织2</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="出生日期">
                    <a-date-picker v-model="form.birthDate" placeholder="请选择出生日期" />
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
            <a-form :model="form" layout="horizontal" labelCol="{ span: 4 }" wrapperCol="{ span: 14 }"
              v-if="selectValue === '组织名称'">
              <a-row>
                <a-col :span="8">
                  <a-form-item label="标签">
                    <a-select v-model="form.tag" placeholder="请选择标签" style="width: 100%;">
                      <!-- 这里可以根据实际需求添加选项 -->
                      <a-select-option value="tag1">标签1</a-select-option>
                      <a-select-option value="tag2">标签2</a-select-option>
                      <a-select-option value="tag3">标签3</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="组织关键词">
                    <a-select v-model="form.organizationKeyword" placeholder="请选择组织关键词" style="width: 100%;">
                      <!-- 这里可以根据实际需求添加选项 -->
                      <a-select-option value="keyword1">关键词1</a-select-option>
                      <a-select-option value="keyword2">关键词2</a-select-option>
                      <a-select-option value="keyword3">关键词3</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="创建时间">
                    <a-date-picker v-model="form.creationTime" placeholder="请选择创建时间" style="width: 100%;" />
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
            <a-form :model="form" layout="horizontal" labelCol="{ span: 4 }" wrapperCol="{ span: 14 }"
              v-if="selectValue === '社交账号'">
              <a-row>
                <a-col :span="8">
                  <a-form-item label="社交账号ID">
                    <a-input v-model="form.socialAccountId" placeholder="请输入社交账号ID" />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="标签">
                    <a-select v-model="form.tag" placeholder="请选择标签" style="width: 100%;">
                      <!-- 这里可以根据实际需求添加选项 -->
                      <a-select-option value="tag1">标签1</a-select-option>
                      <a-select-option value="tag2">标签2</a-select-option>
                      <a-select-option value="tag3">标签3</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="国家">
                    <a-select v-model="form.country" placeholder="请选择国家" style="width: 100%;">
                      <!-- 这里可以根据实际需求添加选项 -->
                      <a-select-option value="country1">国家1</a-select-option>
                      <a-select-option value="country2">国家2</a-select-option>
                      <a-select-option value="country3">国家3</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="社交平台">
                    <a-select v-model="form.socialPlatform" placeholder="请选择社交平台" style="width: 100%;">
                      <!-- 这里可以根据实际需求添加选项 -->
                      <a-select-option value="platform1">平台1</a-select-option>
                      <a-select-option value="platform2">平台2</a-select-option>
                      <a-select-option value="platform3">平台3</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
            <a-form :model="form" layout="horizontal" :labelCol="{ span: 8 }" :wrapperCol="{ span: 16 }"
              v-if="selectValue === '邮箱账号'">
              <a-row>
                <a-col :span="8">
                  <a-form-item label="邮件数量">
                    <a-input-number v-model="form.emailCount" placeholder="请输入邮件数量" style="width: 100%;" />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="其他信息">
                    <a-input v-model="form.otherInfo" placeholder="请输入其他信息" />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="标签">
                    <a-select v-model="form.tag" placeholder="请选择标签" style="width: 100%;">
                      <!-- 这里可以根据实际需求添加选项 -->
                      <a-select-option value="tag1">标签1</a-select-option>
                      <a-select-option value="tag2">标签2</a-select-option>
                      <a-select-option value="tag3">标签3</a-select-option>
                      <!-- 更多标签选项 -->
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="国家/地区">
                    <a-select v-model="form.country" placeholder="请选择国家/地区" style="width: 100%;">
                      <!-- 这里可以根据实际需求添加选项 -->
                      <a-select-option value="country1">国家1</a-select-option>
                      <a-select-option value="country2">国家2</a-select-option>
                      <a-select-option value="country3">国家3</a-select-option>
                      <!-- 更多国家/地区选项 -->
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
            <a-form :model="form" layout="horizontal" :labelCol="{ span: 8 }" :wrapperCol="{ span: 16 }"
              v-if="selectValue === '邮件名称'">
              <a-row>
                <a-col :span="8">
                  <a-form-item label="发送者">
                    <a-input v-model="form.otherInfo" placeholder="请输入发送者名" />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="接收者">
                    <a-input v-model="form.otherInfo" placeholder="请输入接收者名" />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="邮件主题">
                    <a-input v-model="form.otherInfo" placeholder="请输入邮件主题" />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="类型">
                    <a-select v-model="form.tag" placeholder="请选择类型" style="width: 100%;">
                      <!-- 这里可以根据实际需求添加选项 -->
                      <a-select-option value="tag1">标签1</a-select-option>
                      <a-select-option value="tag2">标签2</a-select-option>
                      <a-select-option value="tag3">标签3</a-select-option>
                      <!-- 更多标签选项 -->
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="国家/地区">
                    <a-select v-model="form.country" placeholder="请选择国家/地区" style="width: 100%;">
                      <!-- 这里可以根据实际需求添加选项 -->
                      <a-select-option value="country1">国家1</a-select-option>
                      <a-select-option value="country2">国家2</a-select-option>
                      <a-select-option value="country3">国家3</a-select-option>
                      <!-- 更多国家/地区选项 -->
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
            <a-form :model="form" layout="horizontal" :labelCol="{ span: 8 }" :wrapperCol="{ span: 16 }"
              v-if="selectValue === '新闻数据'">
              <a-row>
                <a-col :span="8">
                  <a-form-item label="新闻标题">
                    <a-input v-model="form.otherInfo" placeholder="请输入新闻标题" />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="新闻简介">
                    <a-input v-model="form.otherInfo" placeholder="请输入新闻简介" />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="新闻作者">
                    <a-input v-model="form.otherInfo" placeholder="请输入新闻作者" />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="新闻来源">
                    <a-input v-model="form.otherInfo" placeholder="请输入新闻来源" />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="新闻类型">
                    <a-select v-model="form.tag" placeholder="请选择类型" style="width: 100%;">
                      <!-- 这里可以根据实际需求添加选项 -->
                      <a-select-option value="tag1">标签1</a-select-option>
                      <a-select-option value="tag2">标签2</a-select-option>
                      <a-select-option value="tag3">标签3</a-select-option>
                      <!-- 更多标签选项 -->
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="新闻组织">
                    <a-select v-model="form.country" placeholder="请选择新闻组织" style="width: 100%;">
                      <!-- 这里可以根据实际需求添加选项 -->
                      <a-select-option value="country1">国家1</a-select-option>
                      <a-select-option value="country2">国家2</a-select-option>
                      <a-select-option value="country3">国家3</a-select-option>
                      <!-- 更多国家/地区选项 -->
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
            <a-row :gutter="[16, 16]">
              <a-col :span="8">
                <a-button @click="handleReset">重置</a-button>
              </a-col>
            </a-row>
          </a-collapse-item>
        </a-collapse>
        <div v-if="!searchQuery" v-show="showHistory" class="history" style="width: 100%">
          <div v-if="historyItems.length > 0" class="history-header">
            <div class="tip">最近搜索</div>
            <span class="del" @click="clearHistory">清除全部</span>
          </div>
          <a-list style="margin-top: 10px" :max-height="580" :scrollbar="true">
            <a-list-item v-for="(item, index) in historyItems" :key="item" class="history-item"
              @click="historyHandle(item)">
              <icon-history />
              <span class="time">{{ item }}</span>
              <icon-delete type="close" class="delete-icon" @click.stop="deleteHistoryItem(index)" />
            </a-list-item>
          </a-list>
        </div>
        <div v-else class="searchResults" style="width: 100%">
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
                  <span v-html="highlightedHit(result.hit)"></span>
                </template>
              </a-list-item-meta>
            </a-list-item>
          </a-list>
          <a-pagination v-model:page-size="pageSize" class="pagination" :total="total" show-total show-jumper
            show-page-size @change="pageChange" @page-size-change="onPageSizeChange" />
        </div>
      </a-card>
    </a-layout>
  </div>
  <div class="footer">
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
//   import { result } from 'lodash';
import { useRouter } from 'vue-router';
import Footer from '@/components/footer/index.vue';
import { searchSysDocList } from '@/api/doc';
// import { SearchItem, SearchRes, search } from '@/api/dashboard';

const selectValue = ref();
const collapseBtn = ref<string[]>(['2']);
const form = reactive({
  socialAccountId: '',
  uploadUser: '',
  fileName: '',
  originalName: '',
  relatedFile: '',
  relatedOrganization: '',
  relatedPerson: '',
  department: '',
  fileSource: '',
  fileType: '',
  name: '',
  occupation: '',
  otherName: '',
  gender: '',
  organization: '',
  birthDate: '',
  organizationKeyword: '',
  creationTime: '',
  tag: '',
  countryL: '',
  socialPlatform: '',
  emailCount: 0,
  otherInfo: '',
  country: '',
});
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
      searchResults.value = results;
      total.value = searchResults.value.length;
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

const higherSearch = () => {
  if (collapseBtn.value[0] === '1') {
    collapseBtn.value[0] = '2';
  } else {
    collapseBtn.value[0] = '1';
  }
  console.log(collapseBtn.value);
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

// 计算过滤后的搜索结果
// const filteredResults = ref<SearchItem[]>([]);
// watch([searchQuery, searchResults], () => {
//   if (searchQuery.value) {
//     filteredResults.value = searchResults.value;
//   } else {
//     filteredResults.value = [];
//   }
// });

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
  return hit.replace(/<b>(.*?)<\/b>/g, `<b style="color: aqua;">$1</b>`);
};

const pageChange = async (current: number) => {
  try {
    loading.value = true;
    //   const results = await search({
    //     q: searchQuery.value,
    //     current: (current - 1) * pageSize.value,
    //     pageSize: pageSize.value,
    //     search_after: search_after.value,
    //   });
    //   searchResults.value = results.items;
    //   total.value = results.total;
    //   search_after.value = results.search_after;
    // } catch (error) {
    //   console.error('搜索失败:', error);
    // } finally {
    //   loading.value = false;
    // }
  } finally {
    /* empty */
  }
};

const handleReset = () => {
  console.log('handleReset');
};

const onPageSizeChange = () => {
  console.log('onPageSizeChange');
};
</script>

<style scoped lang="less">
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
  width: 1050px;
  height: 100%;

  .tip {
    color: aqua;
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
  background-color: #00424D;
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

/deep/.arco-icon-hover .arco-collapse-item-icon-hover {
  display: none;
  /* 隐藏箭头 */
}
</style>
