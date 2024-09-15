<script lang="ts" setup>
const currentUrl = ref<string | undefined>(undefined);

browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
  currentUrl.value = tabs[0].url;
});
</script>

<template>
  <main class="p-4">
    <p>url: {{ currentUrl }}</p>
    <!-- <p>params: {{ params }}</p> -->
  </main>
</template>
