<template>
  <Breadcrumb />
  <div class="general-card">
    <a-card v-if="info" class="content-box">
      <ExcelDetail v-if="info.type === 'excel'" :title="info.title" :desc="info.desc" :doc_data="info.doc_data"
        :file="info.file" />
      <EmailDetail v-else-if="info.type === 'email'" :info="info" />
      <GeneralDetail v-else :info="info" />
    </a-card>
  </div>
  <Footer />
</template>

<script lang="ts" setup>
import { SysDocRes } from '@/api/doc';
import useLoading from '@/hooks/loading';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useDocStore, useTabBarStore } from '@/store';
import Footer from '@/components/footer/index.vue';
import GeneralDetail from './general-detail.vue';
import ExcelDetail from './excel-detail.vue';
import EmailDetail from './email-detail.vue';


const route = useRoute();
const docStore = useDocStore();
const { loading, setLoading } = useLoading(true);

const info = ref<SysDocRes>();

const { id } = route.params;

onMounted(() => {
  setLoading(true);
  const max = 30 * 1000; // 超时时间
  const slice = 200; // 每次检查间隔时间
  const maxNumber = max / slice;
  let count = 0
  if (id) {
    const inter = setInterval(() => {
      info.value = docStore.getDocMap.get(Number(id));
      count += 1;
      if (info.value || count >= maxNumber) {
        setLoading(false);
        clearInterval(inter);
      }
    }, slice)
  }
})

</script>

<style scoped lang="less">
.content-box {
  border: none;
  // width: 70vw;
}
</style>