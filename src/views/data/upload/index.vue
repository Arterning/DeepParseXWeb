<template>
  <a-layout class="flex-layout">
    <Breadcrumb />
    <a-card :title="$t('menu.data.upload')" class="general-card">
      <a-card :style="{ width: '100%', marginBottom: '20px' }" title="上传选项">
        <a-space size="large">
          <a-checkbox v-model="uploadDirectory" :default-checked="false">上传目录</a-checkbox>
        </a-space>
      </a-card>
      <a-upload multiple draggable :directory="uploadDirectory" :custom-request="customRequest" />

      <a-space style="padding-top: 22px" />
      <a-row>
        <a-col>
          <a-list :data="hotDocs" :hoverable="true" :loading="loading">
            <template #header> 最新文件 </template>
            <template #item="{ item, index }">
              <a-list-item :key="index" class="ResultItem" @click="
                $router.push({
                  name: 'DataDocDetail',
                  query: { docId: item.id },
                })
                ">
                <div class="flex justify-between cursor-pointer">
                  <div>
                    <icon-file style="font-size: large" /> {{ item.title }}
                  </div>
                  <a-tag>上传于 {{ item.created_time }}</a-tag>
                </div>
              </a-list-item>
            </template>
          </a-list>
        </a-col>
      </a-row>
    </a-card>
    <Footer />
  </a-layout>
</template>

<script lang="ts" setup>
import {
  Message,
  RequestOption,
  UploadRequest,
  Modal,
} from '@arco-design/web-vue';
import { useI18n } from 'vue-i18n';
import { computed, reactive, ref, nextTick, onMounted } from 'vue';
import Footer from '@/components/footer/index.vue';
import { getToken } from '@/utils/auth';
import { queryRecentDocs, SysDocRes } from '@/api/doc';
import useLoading from '@/hooks/loading';

const { t } = useI18n();

const uploadDirectory = ref(false);
const { loading, setLoading } = useLoading(true);
const hotDocs = ref<SysDocRes[]>([]);

  // 请求数据
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await queryRecentDocs();
      hotDocs.value = res;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  onMounted(async () => {
    await fetchData();
  })


const beforeUpload = (file: File): Promise<boolean> => {
  if (uploadDirectory.value) {
    return Promise.resolve(true);
  }
  return new Promise((resolve, reject) => {
    Modal.confirm({
      title: '确认上传',
      content: `确认上传 ${file.name}`,
      onOk: () => resolve(true),
      onCancel: () => reject(new Error('取消上传')),
    });
  });
};

const customRequest = (option: RequestOption): UploadRequest => {
  const { onProgress, onError, onSuccess, fileItem } = option;
  const xhr = new XMLHttpRequest();
  if (xhr.upload) {
    xhr.upload.onprogress = function (event) {
      let percent = 0;
      if (event.total > 0) {
        percent = event.loaded / event.total;
      }
      onProgress(percent, event);
    };
  }
  xhr.onerror = function error(e) {
    onError(e);
  };
  xhr.onload = function onload() {
    if (xhr.status < 200 || xhr.status >= 300) {
      Message.error(t('导入失败'));
      return onError(xhr.responseText);
    }

    Message.success(t('导入成功'));
    return onSuccess(xhr.response);
  };
  const formData = new FormData();
  formData.append('file', fileItem.file as Blob);
  formData.append('title', "23");
  const token = getToken();
  let url = '/api/v1/sys/upload';
  if (import.meta.env.VITE_API_BASE_URL) {
    url = `${import.meta.env.VITE_API_BASE_URL}/api/v1/sys/upload`;
  }
  xhr.open('post', url, true);
  xhr.setRequestHeader('Authorization', `Bearer ${token}`);
  xhr.send(formData);

  return {
    abort() {
      xhr.abort();
    },
  };
};
</script>