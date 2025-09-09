import { createApp } from 'vue';
import ArcoVue from '@arco-design/web-vue';
import ArcoVueIcon from '@arco-design/web-vue/es/icon';
import { InstallCodeMirror } from 'codemirror-editor-vue3';
import globalComponents from '@/components';
import { MdPreview  } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';
import vue3TreeOrg from 'vue3-tree-org';
import router from './router';
import store from './store';
import i18n from './locale';
import directive from './directive';
import App from './App.vue';
import '@/assets/style/global.less';
import '@/api/interceptor';
import 'vue3-tree-org/lib/vue3-tree-org.css';


const app = createApp(App);
app.config.warnHandler = () => null;


app.use(vue3TreeOrg);

app.use(ArcoVue, {});
app.use(ArcoVueIcon);

app.use(router);
app.use(store);
app.use(i18n);
app.use(globalComponents);
app.use(directive);
app.use(InstallCodeMirror);
app.component('MdPreview', MdPreview);

// 动态设置页面标题
document.title = import.meta.env.VITE_APP_TITLE || 'DeepParseX';

// 动态设置 favicon
const setFavicon = (faviconPath: string) => {
  const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || 
              document.createElement('link');
  link.type = 'image/x-icon';
  link.rel = 'shortcut icon';
  link.href = faviconPath;
  if (!document.querySelector("link[rel*='icon']")) {
    document.getElementsByTagName('head')[0].appendChild(link);
  }
};

setFavicon(import.meta.env.VITE_FAVICON_PATH || '/src/assets/images/logo.png');

app.mount('#app');

