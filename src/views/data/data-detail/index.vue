<template>
  <socialAccountDes v-if="type === 'socialAccount'"></socialAccountDes>
  <socialPostDes v-if="type === 'socialPost'"></socialPostDes>
  <newsDes v-if="type === 'news'"></newsDes>
  <mailboxDes v-if="type === 'mailbox'"></mailboxDes>
  <targetAnalysis v-if="type === 'mailmsg'"></targetAnalysis>
  <scandalDes v-if="type === 'scandal'"></scandalDes>
  <subjectDes v-if="type === 'subject'"></subjectDes>
  <assetsDes v-if="type === 'assets'"></assetsDes>
</template>

<script setup>
  import { useRoute } from 'vue-router';
  import socialAccountDes from './detail-component/socialAccount-description.vue';
  import socialPostDes from './detail-component/socialPost-description.vue';
  import newsDes from './detail-component/news-description.vue';
  import mailboxDes from './detail-component/mailbox-description.vue';
  import maimsgDes from './detail-component/mailmsg-description.vue';
  import targetAnalysis from './detail-component/targetAnalysis.vue';
  import scandalDes from './detail-component/scandal-description.vue';
  import subjectDes from './detail-component/subject-description.vue';
  import assetsDes from './detail-component/assets-description.vue';

  const route = useRoute();
  const { type } = route.query;
</script>

<style scoped></style>
