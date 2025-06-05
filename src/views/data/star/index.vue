<template>
  <a-layout class="flex-layout">
    <Breadcrumb />
    <a-card :title="$t('我的收藏')" class="general-card">
      <!-- 顶部收藏夹选择区域 -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-4 flex-1">
          <a-select
            v-model="selectedCollection"
            :style="{ width: '300px' }"
            placeholder="选择收藏夹"
            allow-clear
            @change="handleCollectionChange"
          >
            <a-option
              v-for="collection in collections"
              :key="collection.id"
              :value="collection.id"
            >
              {{ collection.name }}
            </a-option>
          </a-select>
          <a-button type="primary" @click="NewStarCollection">
            <template #icon>
              <icon-plus />
            </template>
            新建收藏夹
          </a-button>
          <a-button v-if="selectedCollection" @click="EditStarCollection(selectedCollection)">
            <template #icon>
              <icon-edit />
            </template>
            编辑收藏夹
          </a-button>
        </div>
      </div>

      <!-- 文件卡片展示区域 -->
      <div v-if="selectedCollection && currentCollection?.docs?.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <a-card
          v-for="doc in currentCollection.docs"
          :key="doc.id"
          class="doc-card hover:shadow-lg transition-shadow duration-300"
          :style="{ cursor: 'pointer' }"
          @click="handleDocClick(doc)"
        >
          <div class="flex items-start gap-3">
            <div class="flex-1">
              <h3 class="text-lg font-medium mb-2">{{ doc.name }}</h3>
              <div class="flex items-center gap-2 text-gray-500">
                <a-tag>{{ doc.type }}</a-tag>
              </div>
            </div>
            <a-button
              type="text"
              status="danger"
              class="hover:text-red-600"
              @click.stop="removeFromCollection(doc.id)"
            >
              <template #icon>
                <icon-delete />
              </template>
            </a-button>
          </div>
        </a-card>
      </div>
      <a-empty v-else description="暂无收藏文件" />

      <!-- 新增/编辑收藏夹弹窗 -->
      <a-modal
        :visible="openNewOrEdit"
        :title="drawerTitle"
        @cancel="cancelReq"
        :on-before-ok="beforeSubmit"
        @ok="submitNewOrEdit"
        :closable="false"
        :width="550"
      >
        <a-form ref="formRef" :model="form">
          <a-form-item
            field="name"
            label="名称"
            :rules="[{ required: true, message: 'required' }]"
            :feedback="true"
          >
            <a-input v-model="form.name"></a-input>
          </a-form-item>
          <a-form-item field="description" label="描述">
            <a-textarea v-model="form.description" />
          </a-form-item>
        </a-form>
      </a-modal>
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
  createStarCollection,
  deleteStarCollection,
  queryStarCollectionDetail,
  queryStarCollectionList,
  StarCollectionReq,
  StarCollectionRes,
  updateStarCollection,
} from '@/api/starCollection';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const { loading, setLoading } = useLoading(true);
const router = useRouter();

// 收藏夹列表
const collections = ref<StarCollectionRes[]>([]);
const selectedCollection = ref<number>();
const currentCollection = ref<StarCollectionRes>();

// 表单相关
const form = reactive<StarCollectionReq>({
  name: '',
  description: '',
});
const formRef = ref();
const openNewOrEdit = ref(false);
const drawerTitle = ref('');
const buttonStatus = ref<'new' | 'edit'>();

// const handleOk = async () => {
//     try {
//       await formRef.value?.validate();
//       await submitNewOrEdit();
//     } catch (error) {
//       return false;
//     }
//     return true;
//   };

// 加载收藏夹列表
const fetchCollections = async () => {
  setLoading(true);
  try {
    const res = await queryStarCollectionList({});
    collections.value = res.items;
  } catch (error) {
    Message.error('加载收藏夹失败');
  } finally {
    setLoading(false);
  }
};

// 切换收藏夹
const handleCollectionChange = async (id: number) => {
  if (!id) {
    currentCollection.value = undefined;
    return;
  }
  setLoading(true);
  try {
    const res = await queryStarCollectionDetail(id);
    currentCollection.value = res;
  } catch (error) {
    Message.error('加载收藏夹详情失败');
  } finally {
    setLoading(false);
  }
};

// 新建收藏夹
const NewStarCollection = () => {
  buttonStatus.value = 'new';
  drawerTitle.value = '新建收藏夹';
  form.name = '';
  form.description = '';
  openNewOrEdit.value = true;
};

// 编辑收藏夹
const EditStarCollection = async (id: number) => {
  buttonStatus.value = 'edit';
  drawerTitle.value = '编辑收藏夹';
  try {
    const res = await queryStarCollectionDetail(id);
    form.name = res.name;
    form.description = res.description;
    openNewOrEdit.value = true;
  } catch (error) {
    Message.error('加载收藏夹详情失败');
  }
};

// 表单提交前校验
const beforeSubmit = async (done: (closed: boolean) => void) => {
  const res = await formRef.value?.validate();
  if (!res) {
    // 关闭对话框
    done(true);
  }
  done(false);
};

// 提交表单
const submitNewOrEdit = async () => {
  try {
    if (buttonStatus.value === 'new') {
      await createStarCollection(form);
      Message.success('创建成功');
    } else {
      await updateStarCollection(selectedCollection.value!, form);
      Message.success('更新成功');
    }
    openNewOrEdit.value = false;
    await fetchCollections();
    if (selectedCollection.value) {
      await handleCollectionChange(selectedCollection.value);
    }
  } catch (error) {
    Message.error('操作失败');
  }
};

// 从收藏夹中移除文件
const removeFromCollection = async (docId: number) => {
  // 这里需要实现从收藏夹中移除文件的API调用
  Message.info('从收藏夹中移除文件的功能需要后端API支持');
};

// 点击文件卡片
const handleDocClick = (doc: { id: number; name: string; type: string }) => {
  // 这里可以实现跳转到文件详情页的逻辑
  router.push({name: 'DocDetail', params: { id: doc.id }, query: { appendix: doc.title }});
};

// 取消操作
const cancelReq = () => {
  openNewOrEdit.value = false;
};

// 初始化加载
onMounted(() => {
  fetchCollections();
  selectedCollection.value = collections.value.length > 0 ? collections.value[0].id : undefined;
  console.log("selectedCollection.value", selectedCollection.value);
  if (selectedCollection.value) {
    handleCollectionChange(selectedCollection.value);
  }
});
</script>

<style scoped>
.doc-card {
  border: 1px solid var(--color-border);
  transition: all 0.3s ease;
}

.doc-card:hover {
  border-color: var(--color-primary-light-3);
}
</style>