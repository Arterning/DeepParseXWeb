<template>
  <a-layout class="flex-layout">
    <Breadcrumb />
    <a-card :title="$t('menu.data.upload')" class="general-card">
      <a-card :style="{ width: '100%', marginBottom: '20px' }" title="上传选项" class="info-card">
        <a-space size="large">
          <a-checkbox v-model="uploadDirectory" :default-checked="false">上传目录</a-checkbox>
        </a-space>
      </a-card>
      <a-upload multiple draggable :directory="uploadDirectory" :custom-request="customRequest" />

      <a-space style="padding-top: 22px" />

      <!-- 任务队列列表 -->
      <a-list :data="uploadTasks" :hoverable="true">
        <template #header>上传任务列表</template>
        <template #item="{ item }">
          <a-list-item>
            <div class="flex justify-between w-full">
              <div class="flex items-center space-x-4">
                <icon-file />
                <div>
                  <div>{{ item.title }}</div>
                  <div class="text-sm text-gray-500">{{ formatFileSize(item.size) }}</div>
                </div>
              </div>
              <div class="w-1/3">
                <a-progress :percent="item.progress" />
              </div>
            </div>
          </a-list-item>
        </template>
      </a-list>

      <a-space style="padding-top: 22px" />
      <a-row>
        <a-col>
          <a-list :data="hotDocs" :hoverable="true" :loading="loading">
            <template #header> 最新文件 </template>
            <template #item="{ item, index }">
              <a-list-item :key="index" class="ResultItem" @click="
                $router.push({
                  name: 'DocDetail',
                  params: { 
                    id: item.id,
                  },
                  query: {
                    appendix: item.title,
                  }
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
import { executeTask } from '@/api/task';

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

const progress = ref(0);

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

// 定义上传任务队列
interface UploadTask {
  id: string;
  uid: string;
  title: string;
  size: number;
  progress: number;
  eventSource: EventSource;
}

const uploadTasks = ref<UploadTask[]>([]);

// 文件大小格式化函数
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
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
  
  xhr.onload = async function onload() {
    if (xhr.status < 200 || xhr.status >= 300) {
      Message.error(t('导入失败'));
      return onError(xhr.responseText);
    }

    Message.success(t('导入成功'));
    const res = JSON.parse(xhr.response);
    const { data } = res;
    const { id } = data;
    
    
    // 创建新的任务项
    const taskItem: UploadTask = {
      id,
      uid: '',
      title: fileItem.file.name,
      size: fileItem.file.size,
      progress: 0,
      eventSource: new EventSource(''), // 初始化时不需要实际的 EventSource
    };
    
    // 添加到任务队列
    const taskIndex = uploadTasks.value.length;
    uploadTasks.value.push(taskItem);

    await fetchData();

    const uid = await executeTask("upload_handle_file", {
      "kwargs": {
        id,
      },
    });

    // 更新任务UID
    const task = uploadTasks.value[taskIndex];
    task.uid = uid;

    const BASE = import.meta.env.VITE_API_BASE_URL;
    let url = `/api/v1/tasks/${uid}/sse`;
    if (BASE) {
        url = `${BASE}/api/v1/tasks/${uid}/sse`;
    }

    const eventSource = new EventSource(url);

    eventSource.onmessage = (event: any) => {
        const esd = JSON.parse(event.data);
        task.progress = esd.progress;
    };

    task.eventSource = eventSource;

    eventSource.onerror = () => {
        console.error("SSE 连接错误");
        eventSource.close();
    };

    return onSuccess(xhr.response);
  };
  const formData = new FormData();
  formData.append('file', fileItem.file as Blob);
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