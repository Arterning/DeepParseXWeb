<template>
  <SocialAccountDes v-if="type === 'socialAccount'"></SocialAccountDes>
  <SocialPostDes v-if="type === 'socialPost'"></SocialPostDes>
  <NewsDes v-if="type === 'news'"></NewsDes>
  <MailboxDes v-if="type === 'mailbox'"></MailboxDes>
  <MaimsgDes v-if="type === 'mailmsg'"></MaimsgDes>
  <ScandalDes v-if="type === 'scandal'"></ScandalDes>
  <SubjectDes v-if="type === 'subject'"></SubjectDes>
  <AssetsDes v-if="type === 'assets'"></AssetsDes>
</template>

<script setup>
  import { useRoute } from 'vue-router';
  import SocialAccountDes from './detail-component/socialAccount-description.vue';
  import SocialPostDes from './detail-component/socialPost-description.vue';
  import NewsDes from './detail-component/news-description.vue';
  import MailboxDes from './detail-component/mailbox-description.vue';
  import MaimsgDes from './detail-component/mailmsg-description.vue';
  // import TargetAnalysis from './detail-component/targetAnalysis.vue'; 目标分析
  import ScandalDes from './detail-component/scandal-description.vue';
  import SubjectDes from './detail-component/subject-description.vue';
  import AssetsDes from './detail-component/assets-description.vue';

  const route = useRoute();
  const { type } = route.query;
</script>

<style scoped></style>
