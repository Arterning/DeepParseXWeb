<template>
  <a-breadcrumb class="container-breadcrumb">
    <a-breadcrumb-item>
      <icon-apps />
    </a-breadcrumb-item>
    <!-- <a-breadcrumb-item v-for="item in items" :key="item">
      {{ $t(item) }}
    </a-breadcrumb-item> -->
    <a-breadcrumb-item v-for="item in breadCrumb" :key="item.label">
        {{ $t(item.label) }}
    </a-breadcrumb-item>
  </a-breadcrumb>
</template>

<script lang="ts" setup>
  // import { PropType } from 'vue';
  import { useRoute } from 'vue-router';
  import { BreadcrumbRoute } from '@arco-design/web-vue';
  import { computed } from 'vue';

  const route = useRoute();

  // defineProps({
  //   items: {
  //     type: Array as PropType<BreadcrumbRoute[]>,
  //     default() {
  //       return [];
  //     },
  //   },
  // });

  const breadCrumb = computed(() => {
      const routeStack = [] as BreadcrumbRoute[];
      route.matched.map((r) => {
          return routeStack.push({
              path: r.path,
              label: r.meta.locale as string
          })
      });
      return routeStack;
  })
</script>

<style lang="less" scoped>
  .container-breadcrumb {
    margin: 16px 0;
    margin-left: 1rem;

    :deep(.arco-breadcrumb-item) {
      color: rgb(var(--gray-6));

      &:last-child {
        color: rgb(var(--gray-8));
      }
    }
  }
</style>
