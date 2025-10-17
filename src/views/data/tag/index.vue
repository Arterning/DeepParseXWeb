<template>
  <a-layout class="flex-layout">
    <a-card :title="$t('我的标签')" class="general-card">
      <div class="flex flex-wrap content gap-3">
        <a-empty v-if="renderData.length == 0"/>
        <a-tag v-for="tag in renderData" :key="tag.id" @click="handleTagClick(tag)" :color="getRandomColor(tag.id)" class="cursor-pointer text-lg font-semibold">{{ tag.name }}</a-tag>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 content">
        <a-card v-for="doc in tagDocuments" :key="doc.id" @click="handleDocClick(doc)" class="doc-card rounded-lg cursor-pointer hover:shadow-lg transition-all duration-300">
            <div class="flex items-center gap-2 mb-2">
              <component :is="getSvgByType(doc.type)" class="w-10 h-10" />
              <span class="text-lg font-semibold truncate flex-1 min-w-0">{{ doc.title }}</span>
            </div>
            
            <div class="flex items-center gap-2 text-gray-600">
              <icon-calendar />
              <span>{{ tableDateFormat(doc?.doc_time) }}</span>
            </div>
          <!-- <template #extra>
              <div class="flex gap-2">
                <a-button type="text" size="small" @click="EditTag(tag.id)">
                  <icon-edit />
                </a-button>
                <a-button type="text" size="small" status="danger" @click="DeleteTag(tag.id)">
                  <icon-delete />
                </a-button>
              </div>
            </template> -->
        </a-card>
      </div>
      <!-- <div class="flex justify-center mt-4">
        <a-pagination
          v-model:current="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          show-total
          @change="handlePageChange"
        />
      </div> -->
    </a-card>
    <Footer />
  </a-layout>
</template>

<script lang="ts" setup>
import { Message } from '@arco-design/web-vue';
import { useI18n } from 'vue-i18n';
import { reactive, ref, onMounted } from 'vue';
import useLoading from '@/hooks/loading';
import Footer from '@/components/footer/index.vue';
import {
  createTag,
  deleteTag,
  queryTagDetail,
  queryTagList,
  TagParams,
  TagReq,
  TagRes,
  updateTag,
} from '@/api/tag';
import { Pagination } from '@/types/global';
import { getSvgByType, getSvgByFileName} from '@/utils/doc';
import { tableDateFormat } from '@/utils/date';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const { loading, setLoading } = useLoading(true);
const router = useRouter();

// 表单
const generateFormModel = () => {
  return {
    name: undefined,
  };
};
const formModel = ref(generateFormModel());

// 数据
const renderData = ref<TagRes[]>([]);
const operateRow = ref<number>(0);

// 分页
const basePagination: Pagination = {
  current: 1,
  pageSize: 20,
  defaultPageSize: 20,
  showTotal: true,
  showPageSize: true,
  bufferSize: 3,
};
const pagination: Pagination = reactive({
  ...basePagination,
});

// 处理分页变化
const handlePageChange = (page: number) => {
  fetchTagList({ page });
};

// 请求标签列表
const fetchTagList = async (params: TagParams = {}) => {
  setLoading(true);
  try {
    const res = await queryTagList(params);
    renderData.value = res.items;
    pagination.total = res.total;
    pagination.current = params.page || 1;
  } catch (error) {
    // console.log(error);
  } finally {
    setLoading(false);
  }
};


onMounted(async () => {
  // 初始化加载数据
  await fetchTagList();
  selectedTag.value = renderData.value && renderData.value.length > 0 ? renderData.value[0] : null;
  if (!selectedTag.value) {
    return;
  }
  const res = await queryTagDetail(selectedTag.value.id);
  tagDocuments.value = res.docs || [];
})


const COLORS_CUSTOM = [
  '#f53f3f',
  '#7816ff',
  '#00b42a',
  '#165dff',
  '#ff7d00',
  '#eb0aa4',
  '#7bc616',
  '#86909c',
  '#b71de8',
  '#0fc6c2',
  '#ffb400',
  '#168cff',
  '#ff5722',
];

const getRandomColor = (id: number) => {
  if (id === selectedTag.value?.id) {
    return COLORS_CUSTOM[Math.floor(Math.random() * COLORS_CUSTOM.length)];
  }
  return '#86909c';
};

interface TagDocument {
  id: number;
  title: string;
  name: string;
  type: string;
  doc_time: string;
}

const selectedTag = ref<TagRes | null>(null);
const tagDocuments = ref<TagDocument[]>([]);
const handleTagClick = async (tag: TagRes) => {
  selectedTag.value = tag;
  // 这里可以添加更多逻辑，比如跳转到标签详情页
  // Message.success(`点击了标签: ${tag.name}`);

  const res = await queryTagDetail(tag.id);
  // console.log('queryTagDetail res', res);
  tagDocuments.value = res.docs || [];
  // console.log('tagDocuments.value', tagDocuments.value);
};

const isSelected = (tag: TagRes) => {
  return selectedTag.value && selectedTag.value.id === tag.id;
};

const handleDocClick = (doc: TagDocument) => {
  console.log(doc);
  
  // 这里可以添加更多逻辑，比如跳转到文档详情页
  router.push({name: 'DocDetail', params: { id: doc.id }, query: { appendix: doc.title, category: 'doc' }});
};
</script>

<style scoped>
/* .tag-card { */
  /* border: 1px solid var(--color-border); */
/* } */

/* .tag-card:hover {
  border-color: var(--color-primary-light-3);
} */
</style>
  