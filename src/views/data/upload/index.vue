<template>
  <a-layout class="flex-layout">
    <!-- <Breadcrumb /> -->
    <a-card :title="$t('')" class="general-card">

      <div class="flex gap-5 p-6">
        <span class="font-bold">上传模式</span>
        <a-switch v-model="uploadDirectory" :default-checked="false">
          <template #checked>
              目录
          </template>
          <template #unchecked>
              单个
          </template>
        </a-switch>
      </div>

      
      <!-- <a-card class="my-10 w-1/4 info-card">
        <template #title>
          <div class="flex justify-between items-center">
          </div>
        </template>
        <a-space size="large">
          <img
            alt="上传选项"
            src="@/assets/images/upload.png"
            style="width:2rem"
          />
          <a-select v-model="uploadLanguage" style="width: 200px" :placeholder="$t('选择语言')">
            <a-option
                v-for="(item, index) in ['中文简体', '中文繁体', '日语', '西班牙语', '阿拉伯语', '韩语']"
                :key="index"
                :value="item"
            >
              {{ item }}
            </a-option>
          </a-select>
          <a-switch v-model="uploadDirectory" :default-checked="false"></a-switch>
        </a-space>
      </a-card> -->
      
      <a-upload multiple draggable :directory="uploadDirectory" :custom-request="customRequest" />

      <a-space style="padding-top: 22px" />

      <!-- 任务队列列表 -->
      <a-list :bordered="false" :data="uploadTasks" :hoverable="true" v-if="uploadTasks.length > 0">
        <!-- <template #header>上传任务</template> -->
        <template #item="{ item }">
          <a-list-item>
            <div class="flex justify-between w-full">
              <div class="flex items-center space-x-4">
                 <component :is="getSvgByFileName(item.title)" class="w-6 h-6" />
                <div>
                  <div>{{ item.title }}</div>
                  <div class="text-sm text-gray-500">{{ formatFileSize(item.size) }}</div>
                </div>
              </div>
              <div class="w-1/3">
                <a-progress :percent="item.progress" >
                  <template v-slot:text="scope" >
                    <icon-check v-if="scope.percent == 1"/>
                    <icon-exclamation-circle v-if="item.stage == '处理失败'"/>
                    <icon-loading v-if="scope.percent > 0 && scope.percent < 1"/> 
                    {{scope.percent * 100 }}% {{ item.stage }}
                  </template>
                </a-progress>
              </div>
            </div>
          </a-list-item>
        </template>
      </a-list>

      <a-space style="padding-top: 22px" />
      <a-row>
        <a-col>
          <a-list :bordered="false" :data="hotDocs" :hoverable="true" :loading="loading">
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
                  <div class="flex items-center space-x-2">
                    <component :is="getSvgByType(item.type)" class="w-10 h-10" />
                    <div class="flex flex-col gap-1">
                      <div>{{ item.title }}</div>
                      <div>{{ formatFileSize(item.size) }}</div>
                    </div>
                  </div>
                  <a-tag>{{item.created_user}} 上传于 {{ tableDateFormat(item.created_time) }}</a-tag>
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
import {getSvgByType, getSvgByFileName} from '@/utils/doc';
import { queryRecentDocs, SysDocRes } from '@/api/doc';
import useLoading from '@/hooks/loading';
import { parseDoc } from '@/api/doc';
import { onActivated } from 'vue';
import { changeTheme } from '@/hooks/theme';
import { tableDateFormat } from '@/utils/date';


onActivated(() => {
  changeTheme();
})

const { t } = useI18n();

const uploadDirectory = ref(false);
const uploadLanguage = ref('中文简体');
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

// 定义上传任务队列
interface UploadTask {
  id: string;
  uid: string;
  title?: string;
  type?: string;
  size?: number;
  progress: number;
  stage: string;
  eventSource?: EventSource;
}

const uploadTasks = ref<UploadTask[]>([]);

// 文件大小格式化函数
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / (k ** i)).toFixed(2)} ${sizes[i]}`;
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
      stage: '解析文件..',
      type: 'PDF',
      title: fileItem?.file?.name,
      size: fileItem?.file?.size,
      progress: 0,
      eventSource: undefined, // 初始化时不需要实际的 EventSource
    };
    
    // 添加到任务队列
    const taskIndex = uploadTasks.value.length;
    uploadTasks.value.push(taskItem);

    

    await parseDoc(id);

    // console.log("触发任务", uid)

    // 更新任务UID
    const task = uploadTasks.value[taskIndex];

    const BASE = import.meta.env.VITE_API_BASE_URL;
    let url = `/api/v1/sys/upload/sse/${id}`;
    if (BASE) {
        url = `${BASE}/api/v1/sys/upload/sse/${id}`;
    }

    const eventSource = new EventSource(url);

    eventSource.onmessage = async (event: any) => {
        const esd = JSON.parse(event.data);
        task.progress = esd.progress;
        task.stage = esd.stage;

        if (task.progress === 1) {
          await fetchData();
        }
    };

    eventSource.onerror = () => {
        console.error("SSE 连接错误");
        eventSource.close();
    };

    task.eventSource = eventSource;

    return onSuccess(xhr.response);
  };
  const formData = new FormData();
  formData.append('file', fileItem.file as Blob);
  formData.append('last_modified', new Date(fileItem.file?.lastModified).toISOString());
  formData.append('size', fileItem.file?.size);
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