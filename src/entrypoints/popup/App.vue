<script lang="ts" setup>
const currentUrl = ref<string | undefined>(undefined);

browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
  currentUrl.value = tabs[0].url;
});
</script>

<template>
  <main>
    <p>url: {{ currentUrl }}</p>
    <!-- <p>params: {{ params }}</p> -->
  </main>
</template>

<style scoped>
main {
  padding: 20px;
  font-size: 16px;
}
</style>
