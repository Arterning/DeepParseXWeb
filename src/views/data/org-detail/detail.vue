<template>
  <a-space direction = "vertical">
    <a-descriptions :column="1">
        <a-descriptions-item label="组织名">
            {{ info.org_name }}
        </a-descriptions-item>
        <a-descriptions-item label="组织文件数量">
            {{ info.org_file_nums }}
        </a-descriptions-item>
        <a-descriptions-item label="组织资产数量">
            {{ info.org_assets_nums }}
        </a-descriptions-item>
        <a-descriptions-item label="描述">
            {{ info.org_desc }}
        </a-descriptions-item>
       
    </a-descriptions>
  </a-space>        
</template>

<script lang="ts" setup>

  const props = defineProps(['info']);


</script>

<style scoped lang="less">
// .content-box{
//   border:none;    
//   width: 100%;
// }
.content-box{
    // display: flex;
    width: 70vw;
    max-height: 65vh;
    overflow: auto;
}

.flex{
    display:flex;
}

</style>
