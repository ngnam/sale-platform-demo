<!-- src/App.vue -->

<template>
  <ConfigProvider :locale="enUS">
    <RouterView />
  </ConfigProvider>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ConfigProvider } from 'ant-design-vue';
import enUS from 'ant-design-vue/es/locale/en_US';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
dayjs.locale('en');

console.log('my config env: ', import.meta.env);
</script>

<style scoped></style>
