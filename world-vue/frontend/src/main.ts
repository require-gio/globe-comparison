import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';
import App from './App.vue';
import './style.css';

/**
 * Vue application entry point
 * Sets up Pinia, TanStack Query, and mounts the app
 */

// Create Pinia store
const pinia = createPinia();

// Create Vue app
const app = createApp(App);

// Install plugins
app.use(pinia);
app.use(VueQueryPlugin, {
  enableDevtoolsV6Plugin: true,
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
        refetchOnWindowFocus: false,
        retry: 2,
      },
    },
  },
});

// Mount app
app.mount('#app');
