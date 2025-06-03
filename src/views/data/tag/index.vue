<template>
  <a-layout class="flex-layout">
    <Breadcrumb />
    <a-card :title="$t('')" class="general-card pt-8">
      <div class="flex flex-wrap gap-4">
        <a-card v-for="tag in renderData" :key="tag.id" class="tag-card w-64 hover:shadow-lg transition-shadow duration-300">
          <template #title>
            <div class="text-lg font-semibold">{{ tag.name }}</div>
          </template>
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2 text-gray-600">
              <icon-calendar />
              <span>{{ tag.created_at }}</span>
            </div>
            <div class="flex items-center gap-2 text-gray-600">
              <icon-file />
              <span>{{ tag.doc_count || 0 }} 个文件</span>
            </div>
          </div>
          <template #extra>
            <!-- <div class="flex gap-2">
              <a-button type="text" size="small" @click="EditTag(tag.id)">
                <icon-edit />
              </a-button>
              <a-button type="text" size="small" status="danger" @click="DeleteTag(tag.id)">
                <icon-delete />
              </a-button>
            </div> -->
          </template>
        </a-card>
      </div>
      <div class="flex justify-center mt-4">
        <a-pagination
          v-model:current="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          show-total
          show-jumper
          @change="handlePageChange"
        />
      </div>
    </a-card>
    <Footer />
  </a-layout>
</template>

<script lang="ts" setup>
import { Message } from '@arco-design/web-vue';
import { useI18n } from 'vue-i18n';
import { reactive, ref } from 'vue';
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

const { t } = useI18n();
const { loading, setLoading } = useLoading(true);

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

// 初始化加载数据
fetchTagList();

// 其他原有的方法保持不变...
</script>

<style scoped>
.tag-card {
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.tag-card:hover {
  border-color: var(--color-primary-light-3);
}
</style>
  