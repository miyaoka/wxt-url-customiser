<script lang="ts" setup>
import { Tabs } from "wxt/browser";
import UrlEditor from "./UrlEditor.vue";
const currentTab = ref<Tabs.Tab | undefined>(undefined);
// 現在のタブのURLを取得
browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
  currentTab.value = tabs[0];
});

// タブのURLが変更されたときに取得
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId !== currentTab.value?.id) return;
  const url = changeInfo.url;
  if (url) {
    console.log("updated", url);
    currentTab.value = tab;
  }
});

const url = computed(() => {
  const currentTabUrl = currentTab.value?.url;
  console.log("currentTabUrl", currentTabUrl);
  return currentTabUrl ? new URL(currentTabUrl) : undefined;
});

onMounted(() => {
  console.log("mounted");
});
</script>

<template>
  <main class="w-fit h-fit">
    <UrlEditor v-if="url" :url="url" />
  </main>
</template>
