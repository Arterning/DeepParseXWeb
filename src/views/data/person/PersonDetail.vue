<template>
  <a-layout class="flex-layout">
    <Breadcrumb />
    <a-card :title="person.name + ' 详情'" class="general-card">
      <!-- 人物基本信息 -->
      <a-row>
        <a-col :span="12">
          <a-form 
          :auto-label-width="true"
          label-align="right"
          >
            <a-form-item label="姓名">{{ person.name }}</a-form-item>
            <a-form-item label="性别">{{ person.gender }}</a-form-item>
            <a-form-item label="年龄">{{ person.age }}</a-form-item>
            <a-form-item label="出生日期">{{ person.birthDate }}</a-form-item>
            <a-form-item label="国籍">{{ person.nationality }}</a-form-item>
            <a-form-item label="联系电话">{{ person.contactNumber }}</a-form-item>
          </a-form>
        </a-col>
      </a-row>
      <!-- 个人简历 -->
      <a-divider />
      <a-row>
        <a-col :span="24">
          <h3>个人简历</h3>
          <p>{{ person.resume }}</p>
        </a-col>
      </a-row>
      <!-- 相关新闻 -->
      <a-divider />
      <a-row>
        <a-col :span="24">
          <h3>相关新闻</h3>
          <ul>
            <li v-for="news in person.relatedNews" :key="news.id">{{ news.title }}</li>
          </ul>
        </a-col>
      </a-row>
    </a-card>
    <Footer />
  </a-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Footer from '@/components/footer/index.vue';
import { Form, FormItem } from '@arco-design/web-vue';
// import Breadcrumb from '@/components/Breadcrumb.vue';
// 局部导入 Arco Design 组件


// 这里假设从父组件传递人物数据，实际中可以根据需求调整
const props = defineProps({
  person: {
    type: Object,
    required: true
  }
});
</script>

<style scoped>
/* 可根据需要添加样式 */
</style>