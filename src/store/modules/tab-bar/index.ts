import type { RouteLocationNormalized } from 'vue-router';
import { defineStore } from 'pinia';
import {
  DEFAULT_ROUTE,
  DEFAULT_ROUTE_NAME,
  REDIRECT_ROUTE_NAME,
} from '@/router/constants';
import { isString } from '@/utils/is'
import { TabBarState, TagProps } from './types';

// 持久化存储的键名
const TAB_BAR_STORAGE_KEY = 'tab-bar-storage';


const formatTag = async (route: RouteLocationNormalized, appendix?:string, category?: string): Promise<TagProps> => {
  const { name, meta, fullPath, query, params } = route;
  return {
    title: meta.locale || '',
    name: String(name),
    fullPath,
    query,
    params,
    ignoreCache: meta.ignoreCache,
    appendix,
    category
  };
};

const BAN_LIST = [REDIRECT_ROUTE_NAME];

// 从localStorage加载持久化的标签页数据
const loadPersistedTabs = (): TabBarState => {
  try {
    const stored = localStorage.getItem(TAB_BAR_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        cacheTabList: new Set(parsed.cacheTabList || [DEFAULT_ROUTE_NAME]),
        tagList: parsed.tagList || [DEFAULT_ROUTE],
      };
    }
  } catch (error) {
    console.warn('Failed to load persisted tabs:', error);
  }
  return {
    cacheTabList: new Set([DEFAULT_ROUTE_NAME]),
    tagList: [DEFAULT_ROUTE],
  };
};

// 保存标签页数据到localStorage
const savePersistedTabs = (state: TabBarState) => {
  try {
    const dataToSave = {
      cacheTabList: Array.from(state.cacheTabList),
      tagList: state.tagList,
    };
    localStorage.setItem(TAB_BAR_STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (error) {
    console.warn('Failed to save persisted tabs:', error);
  }
};

const useAppStore = defineStore('tabBar', {
  state: (): TabBarState => loadPersistedTabs(),

  getters: {
    getTabList(): TagProps[] {
      return this.tagList;
    },
    getCacheList(): string[] {
      return Array.from(this.cacheTabList);
    },
  },

  actions: {
    async updateTabList(route: RouteLocationNormalized, appendix?: string, category?: string) {
      if (BAN_LIST.includes(route.name as string)) return;
      const tag = await formatTag(route, appendix, category);
      
      this.tagList.push(tag);
      if (!route.meta.ignoreCache) {
        this.cacheTabList.add(route.name as string);
      }
      // 保存到localStorage
      savePersistedTabs(this.$state);
    },
    deleteTag(idx: number, tag: TagProps) {
      this.tagList.splice(idx, 1);
      this.cacheTabList.delete(tag.name);
      // 保存到localStorage
      savePersistedTabs(this.$state);
    },
    addCache(name: string) {
      if (isString(name) && name !== '') this.cacheTabList.add(name);
      // 保存到localStorage
      savePersistedTabs(this.$state);
    },
    deleteCache(tag: TagProps) {
      this.cacheTabList.delete(tag.name);
      // 保存到localStorage
      savePersistedTabs(this.$state);
    },
    freshTabList(tags: TagProps[]) {
      this.tagList = tags;
      this.cacheTabList.clear();
      // 要先判断ignoreCache
      this.tagList
        .filter((el) => !el.ignoreCache)
        .map((el) => el.name)
        .forEach((x) => this.cacheTabList.add(x));
      // 保存到localStorage
      savePersistedTabs(this.$state);
    },
    resetTabList() {
      this.tagList = [DEFAULT_ROUTE];
      this.cacheTabList.clear();
      this.cacheTabList.add(DEFAULT_ROUTE_NAME);
      // 保存到localStorage
      savePersistedTabs(this.$state);
    },
  },
});

export default useAppStore;
