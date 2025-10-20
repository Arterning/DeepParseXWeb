
<template>
  <div class="content">        
    <a-row>
        <a-col :span="7">
        <a-scrollbar class="h-[calc(100vh-300px)]" style="width:100%; overflow-y: auto; padding-right: 2rem;">
          <a-upload multiple draggable :directory="uploadDirectory" accept=".zip,.rar,.eml" :custom-request="customRequest" :limit="MAX_UPLOAD_COUNT" :before-upload="beforeUpload" @exceed-limit="onExceedLimit" @change="handleUploadChange" :file-list="uploadFileList">
            <template #upload-button>
              <div class="rounded-lg border w-full p-4 flex flex-col justify-center space-y-4 items-center text-center" :class="{ 'border-blue-500 bg-blue-50': isDragOver }" @dragenter.prevent="handleDragEnter" @dragover.prevent="handleDragOver" @dragleave.prevent="handleDragLeave" @drop.prevent="handleDrop">
                <div>
                  <span class="text-gray-500 text-sm mr-2 font-bold">文件夹上传</span>
                  <a-switch @click.stop v-model="uploadDirectory" size="small">
                    <!-- <template #checked>
                      目录
                    </template>
                    <template #unchecked>
                      单个
                    </template> -->
                  </a-switch>
                </div>
                <icon-upload :size="24" />
                <div>将邮件文件或文件夹拖放至此处</div>
                <div class="text-gray-500 text-sm">支持 .eml格式邮件，以及 .zip、.rar压缩包</div>
                <div class="text-gray-500 text-sm">最大文件数量：{{ selectedCount }}/{{ MAX_UPLOAD_COUNT }}</div>
              </div>
            </template>
          </a-upload>                      
        </a-scrollbar>
        </a-col>
        <a-col :span="17">
        <a-scrollbar class="h-[calc(100vh-300px)]" style="width:100%; padding-left: 1rem; padding-right: 2rem; overflow: auto;">
            <a-form ref="formRef" :model="form">
            <div>基本设置</div>
            <a-form-item :feedback="true" label="任务名称" :rules="[
                { required: true, message: `该项为必填项` },
                ]" field="name">
                <a-input v-model="form.name"></a-input>
            </a-form-item>
            <a-form-item :feedback="true" label="归属目录" :rules="[
                { required: true, message: `该项为必填项` },
                { 
                    validator: async (_: any, value: any) => {
                        if (typeof value === 'number' && value > 0) {
                        return true; // 校验通过
                        }
                        return '该项为必填项'; // 校验失败，直接显示消息
                    } 
                }
                ]" field="doc_dir_id">
                <a-tree-select
                  v-model="form.doc_dir_id"
                  :data="dirTreeOptions"
                  placeholder="请选择归属目录"
                  allow-search
                  allow-clear
                  @change="onDirChange"
                />
            </a-form-item>
            <div>高级选项</div>
            <a-form-item field="option.skipRepeat">
                <a-checkbox v-model="form.option.skipRepeat">自动检测并跳过重复邮件</a-checkbox>
            </a-form-item>
            <a-form-item field="option.analyzeContent">
                <a-checkbox v-model="form.option.analyzeContent">解析附件内容</a-checkbox>
            </a-form-item>
            <a-form-item field="option.ocr">
                <a-checkbox v-model="form.option.ocr">对图片内容进行OCR识别</a-checkbox>
            </a-form-item>
            <div>内容提取选项</div>
            <a-form-item field="option.abstract">
                <a-checkbox v-model="form.option.abstract">内容摘要与关键字</a-checkbox>
            </a-form-item>
            <a-form-item field="option.personInfo">
                <a-checkbox v-model="form.option.personInfo">人物信息</a-checkbox>
            </a-form-item>
            <a-form-item field="option.codeAddr">
                <a-checkbox v-model="form.option.codeAddr">码址信息（邮箱、网址等）</a-checkbox>
            </a-form-item>
            <a-form-item field="option.translate" label="是否启用翻译">
                <a-switch type="round" v-model="form.option.translte">
                <template #checked>
                    开启
                </template>
                <template #unchecked>
                    关闭
                </template>
                </a-switch>
            </a-form-item>
            </a-form>
            <a-space class="mt-8 flex justify-center">
                <a-button @click="cancelReq">重置</a-button>
                <a-button type="primary" @click="onSubmit" :disabled="loading||!selectedCount">
                    <template #icon v-if="loading">
                    <icon-loading />
                    </template>
                    {{ okText }}
                </a-button>
            </a-space>
        </a-scrollbar>
        </a-col>
    </a-row>
  </div>
</template>

<script setup lang='ts'>
  import { computed, onMounted, reactive, ref, toRef } from 'vue';
  import { useI18n } from 'vue-i18n';
  import useLoading from '@/hooks/loading';
  import {
    Message,
    RequestOption,
    UploadRequest,
    Modal
  } from '@arco-design/web-vue';
  import { deleteSysDoc, parseDoc } from '@/api/doc';
  import { getToken } from '@/utils/auth';
  import { createDirectory, queryDirectoryList, type DirectoryRes } from '@/api/dir';
  import router from '@/router';
  import { useUserStore } from '@/store';

  defineProps({
    open: Boolean
  })

//   const emit = defineEmits([
//     'update:open',
//     'open-task-drawer',
//     'refresh-task-drawer'
//   ])
  const userStore = useUserStore();
  const { t } = useI18n();
  const { loading, setLoading } = useLoading(false);
  const okText = computed(()=>{
    if(loading.value) return "等待上传";
    if(selectedCount.value===0) return "请先上传"; 
    return "提交任务"
  })

  const todayStr = computed(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}${month}${day}`
  })

  // 取消前清理动作
  const doCancelCleanup = async () => {
    try {
      if (uploadedIds.value.length > 0) {
        await deleteSysDoc({ pk: uploadedIds.value as unknown as number[] });
        Message.success('已清理已上传文件');
      }
    } catch (e) {
      Message.warning('部分已上传文件未能清理');
    } finally {
      // 中止仍在进行的上传
      try {
        activeXhrs.value.forEach((xhr) => {
          try { xhr.abort(); } catch {}
        });
      } catch {}
      activeXhrs.value = [];
      // 清空 Upload 文件列表与计数
      Object.assign(form, { ...formDefaultValues, status: 'pending' });
      uploadFileList.value = [];
      selectedCount.value = 0;
      uploadedIds.value = [];
    //   emit('update:open', false);
    }
  };

  // 对话框
  const cancelReq = async () => {
    if(selectedCount.value > 0){
      Modal.confirm({
        title: '确认重置',
        content: '会放弃已上传和已选择的文件，是否继续？',
        okText: '确认',
        cancelText: '取消',
        async onOk() {
          await doCancelCleanup();
        },
      });
    }
    else {
      await doCancelCleanup();
    }
  };
  const formDefaultValues: any = {
    name: '',
    doc_dir_id: null,
    option: {
      directory: todayStr.value, // 所属二级目录
      skipRepeat: true, // 跳过重复
      analyzeContent: true, // 分析内容
      ocr: false, // ocr识别
      abstract: true, // 内容摘要与关键字
      personInfo: true, // 人物信息
      codeAddr: true, // 码址信息
      translate: false, //是否翻译        
    }
  };

  const form = reactive<any>({ ...formDefaultValues, status: 'pending' });
  const formRef = ref();

  // 目录树选项
  const dirTreeOptions = ref<any[]>([]);

  const buildTreeOptions = (data: DirectoryRes[]): any[] => {
    if (!Array.isArray(data)) return [];
    return data.map((item) => ({
      key: item.id.toString(),
      title: item.name,
      value: item.id,
      children: item.children ? buildTreeOptions(item.children) : undefined,
    }));
  };

  let deptDirId = undefined as number | undefined;
  const loadDirTree = async (name?: string) => {
    try {
      const params: any = {};
      if (name) params.name = name;
      let res = await queryDirectoryList(params); // 现有目录
      const { dept } = userStore.$state; // 获取用户所属部门
      const existDept = res.find(item => !item.parent_id && item.name === dept); // 查找目标部门是否存在于一级目录
      
      if (!existDept) { // 不存在则新建
        await createDirectory({ name: dept });
        res = await queryDirectoryList(params); // TODO： 重新获取现有目录（因为createDirectory没返回任何新目录信息）
      }
      dirTreeOptions.value = buildTreeOptions(res as unknown as DirectoryRes[]);
      // 此时必然存在一个部门同名目录
      const deptDir = dirTreeOptions.value.find(item => item.title === dept);
      deptDirId = deptDir.key;
      // console.log(deptDir);
      if(deptDir.children){
        const child = deptDir.children.find(item => item.title === todayStr.value); // 查找【今日】目录
        if (child) {
          form.doc_dir_id = child.key; // 存在时将其设置为默认选项
          return;
        } 
      }
      
      // 不存在时添加一个临时目录（如果没有上传文件，无需创建）
      deptDir.children = deptDir.children || [];
      deptDir.children.push({key: '-1', value: '-1', title: todayStr.value, children: undefined });
      form.doc_dir_id = '-1';
      // console.log(form.doc_dir_id);

    } catch (e) {}
  };

  onMounted(()=>{
    loadDirTree();
  })

  // 选择目录时，回填名称到 option.directory
  const onDirChange = (_val: any, node: any) => {
    try {
      const title = node?.title ?? '';
      form.option.directory = title;
    } catch {}
  };

  const uploadDirectory = ref(false);
  const isDragOver = ref(false);

  const handleDragEnter = () => {
    isDragOver.value = true;
  };
  const handleDragOver = () => {
    isDragOver.value = true;
  };
  const handleDragLeave = () => {
    isDragOver.value = false;
  };
  const handleDrop = () => {
    isDragOver.value = false;
  };

  // 提交成功后仅重置前端状态（不删除已提交文件）
  const resetModalState = () => {
    try { formRef.value?.resetFields?.(); } catch {}
    Object.assign(form, { ...formDefaultValues, status: 'pending' });
    uploadFileList.value = [];
    selectedCount.value = 0;
    uploadedIds.value = [];
    activeXhrs.value = [];
    isDragOver.value = false;
    uploadDirectory.value = false;
  };
  
  // 表单校验
//   const beforeSubmit = async (done: any) => {
//     const res = await formRef.value?.validate();
//     if (!res) {
//       // 关闭对话框
//       done(true);
//     }
//     done(false);
//   };

  // 提交按钮
  const onSubmit = async () => {

    const res = await formRef.value?.validate();
    if (res) {
      // 有校验错误，阻止提交
      return;
    }
    
    // 显示开始提示
    Message.info('正在提交任务，请稍候...');
    
    setLoading(true);
    try {
      if (form.doc_dir_id === '-1') { // 用户选择了临时创建的【今日】目录，需实际创建该目录
        await createDirectory({ name: todayStr.value, parent_id: deptDirId});
        const res = await queryDirectoryList({}); // TODO： 重新获取现有目录（因为createDirectory没返回任何新目录信息）
        const parent = res.find( item => item.id === deptDirId);
        form.doc_dir_id = parent?.children.find(item => item.name === todayStr.value)?.id;
      }

      for(let id of uploadedIds.value) {
        await parseDoc(id, {name: form.name, doc_dir_id: form.doc_dir_id, option: form.option});
      }
    
      Message.success('任务已提交');
      // 成功后重置本弹窗内容
      // resetModalState();
      // 关闭弹窗并刷新外部任务视图
      // emit('update:open', false);
      // emit('open-task-drawer');
      // emit('refresh-task-drawer');
      router.push({ name: 'UploadTask' }) 
    } catch (error) {
      Message.error('任务提交失败，请重试');
      // console.log(error);      
    } finally {
      setLoading(false);
    }
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
  // const formatFileSize = (bytes: number) => {
  //   if (bytes === 0) return '0 B';
  //   const k = 1024;
  //   const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  //   const i = Math.floor(Math.log(bytes) / Math.log(k));
  //   return `${(bytes / (k ** i)).toFixed(2)} ${sizes[i]}`;
  // };

  const uploadedIds = ref<number[]>([]);
  const uploadFileList = ref<any[]>([]);
  const activeXhrs = ref<XMLHttpRequest[]>([]);

  // 最大上传数量（常量）与当前已添加文件数量（ref）
  const MAX_UPLOAD_COUNT = 30;
  const selectedCount = ref(0);

  // 开始前拦截：
  // - 如果已达上限，直接阻止本次选择
  // - 使用 ref 变量便于后续扩展（例如动态调整上限、基于角色等）
  const beforeUpload = async () => {
    if (selectedCount.value >= MAX_UPLOAD_COUNT) {
      Message.warning(`已达到最大可上传数量（${MAX_UPLOAD_COUNT}）`);
      return false;
    }
    return true;
  };

  const onExceedLimit = () => {
    Message.warning(`一次最多选择 ${MAX_UPLOAD_COUNT} 个文件`);
  };

  // 同步已添加文件数量与受控文件列表
  const handleUploadChange = (fileList: any, _file?: any) => {
    const list = Array.isArray(fileList) ? fileList : (fileList?.fileList || []);
    uploadFileList.value = list;
    selectedCount.value = list.length;
  };

  const customRequest = (option: RequestOption): UploadRequest => {
    const { onProgress, onError, onSuccess, fileItem } = option;
    const xhr = new XMLHttpRequest();
    activeXhrs.value.push(xhr);

    // 上传开始：开启 loading
    setLoading(true);

    if (selectedCount.value >= MAX_UPLOAD_COUNT) {
      setLoading(false);
      Message.warning(`已达到最大可上传数量（${MAX_UPLOAD_COUNT}）`);
      return {
        abort() {
          xhr.abort();
        },
      };
    }

    if (xhr.upload) {
      xhr.upload.onprogress = function (event) {
        let percent = 0;
        if (event.total > 0) {
          percent = event.loaded / event.total;
        }
        onProgress(percent, event);
      };
    }

    xhr.onerror = function (e) {
      setLoading(false);
      onError(e);
      activeXhrs.value = activeXhrs.value.filter((x) => x !== xhr);
    };

    xhr.onload = function () {
      setLoading(false); 
      if (xhr.status < 200 || xhr.status >= 300) {
        Message.error(t('上传失败'));
        onError(xhr.responseText);
        activeXhrs.value = activeXhrs.value.filter((x) => x !== xhr);
        return;
      }

      Message.success(t('上传成功'));

      // 解析返回结果
      const res = JSON.parse(xhr.response);
      const { data } = res;
      const { id } = data;

      // 更新队列，只存 id
      uploadedIds.value.push(id);

      onSuccess(xhr.response);
      activeXhrs.value = activeXhrs.value.filter((x) => x !== xhr);
      return;
    };

    // 构建 formData
    const formData = new FormData();
    formData.append('file', fileItem.file as Blob);
    formData.append('last_modified', new Date(fileItem.file?.lastModified).toISOString());
    formData.append('size', fileItem.file?.size);

    // 请求
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
        setLoading(false); 
        try { xhr.abort(); } catch {}
        activeXhrs.value = activeXhrs.value.filter((x) => x !== xhr);
      },
    };
  };

</script>