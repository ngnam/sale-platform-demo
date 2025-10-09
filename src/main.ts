// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import '@/styles/index.less';
import { useUserStore } from '@/store/user';
import { setAuthToken } from './utils/http';
import { createRouter } from './router/index';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

const router = createRouter();
app.use(router);

// Khôi phục phiên trước khi mount
const userStore = useUserStore();
userStore.loadFromStorage();

// sync axios with restored token
setAuthToken(userStore.token || null);

// Mount app sau khi restore state
app.mount('#app');
