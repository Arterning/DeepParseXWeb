<template>
  <div class="tab-bar-container">
    <a-affix ref="affixRef" :offset-top="offsetTop">
      <div class="tab-bar-box">
        <div class="tab-bar-scroll">
          <div class="tags-wrap">
            <tab-item
              v-for="(tag, index) in tagList"
              :key="tag.fullPath"
              :index="index"
              :item-data="tag"
            />
          </div>
        </div>
        <div class="tag-bar-operation"></div>
      </div>
    </a-affix>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onUnmounted, ref, watch } from 'vue';
  import type { RouteLocationNormalized } from 'vue-router';
  import {
    listenerRouteChange,
    removeRouteListener,
  } from '@/utils/route-listener';
  import { useAppStore, useDocStore, useTabBarStore } from '@/store';
  import { querySysDocDetail } from '@/api/doc';
  import { Doc } from '@/store/modules/doc/types';
  import { querySysOrgDetail } from '@/api/org';
  import { querySysAssetsDetail } from '@/api/assets';
  import tabItem from './tab-item.vue';

  const appStore = useAppStore();
  const tabBarStore = useTabBarStore();
  const docStore = useDocStore();

  const affixRef = ref();
  const tagList = computed(() => {
    return tabBarStore.getTabList;
  });
  const offsetTop = computed(() => {
    return appStore.navbar ? 60 : 0;
  });

  watch(
    () => appStore.navbar,
    () => {
      affixRef.value.updatePosition();
    }
  );
  
  listenerRouteChange( async (route: RouteLocationNormalized) => {
    if (
      !route.meta.noAffix &&
      !tagList.value.some((tag) => tag.fullPath === route.fullPath)
    ) {
      let res;
      if(route.params.id){
        if(route.query.type === 'doc'){
          res = await querySysDocDetail(Number(route.params.id));   
          docStore.add(res as Doc);
          tabBarStore.updateTabList(route, res?.name);
        }
        else if(route.query.type === 'org'){
          res = await querySysOrgDetail(Number(route.params.id));
          tabBarStore.updateTabList(route, res?.org_name);
        }
        else if(route.query.type === 'assets'){
          res = await querySysAssetsDetail(Number(route.params.id));
          tabBarStore.updateTabList(route, res?.assets_name);
        }
      }
      else{
        tabBarStore.updateTabList(route);
      }
    }
  }, true);

  onUnmounted(() => {
    removeRouteListener();
  });
</script>

<style lang="less" scoped>
  .tab-bar-container {
    position: relative;
    background-color: var(--color-bg-2);

    .tab-bar-box {
      display: flex;
      padding: 0 0 0 1rem;
      background-color: var(--color-bg-2);
      border-bottom: 1px solid var(--color-border);

      .tab-bar-scroll {
        height: 32px;
        flex: 1;
        overflow: hidden;

        .tags-wrap {
          padding: 4px 0;
          height: 48px;
          white-space: nowrap;
          overflow-x: auto;

          :deep(.arco-tag) {
            display: inline-flex;
            align-items: center;
            margin-right: 6px;
            cursor: pointer;

            &:first-child {
              .arco-tag-close-btn {
                display: none;
              }
            }
          }
        }
      }
    }

    .tag-bar-operation {
      width: 100px;
      height: 32px;
    }
  }
</style>
