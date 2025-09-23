<template> 
  <a-drawer
    title="文件目录" 
    :visible="open"
    :footer="false"
    :closable="true"
    @cancel="onClose"
    placement="left"
    unmountOnClose
  >        

  </a-drawer>
</template>

<script setup lang='ts'>
  import useLoading from '@/hooks/loading';

  const props = defineProps({
    open: Boolean,
    refreshTrigger: {
      type: Number,
      default: 0
    }
  })

  const emit = defineEmits([
    'update:open'
  ])

  const { loading, setLoading } = useLoading(true);

  const onClose = () => {
    emit('update:open', false)
  };

</script>