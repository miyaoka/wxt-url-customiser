<script setup lang="ts">
const props = defineProps<{
  url: URL;
}>();

interface Param {
  id: string;
  key: string;
  value: string;
}

interface PathItem {
  id: string;
  value: string;
}
const editParams = ref<Param[]>([]);
const editPaths = ref<PathItem[]>([]);
const lockedKeyMap = ref<Record<string, boolean>>({});
const isEncoded = ref(true);

// 編集したparamsとpathsを結合して新しいURLを作成
const editedUrl = computed(() => {
  const newUrl = new URL(props.url.href);
  // paramsからsearchを作成
  const searchParams = new URLSearchParams();
  editParams.value.forEach((param) => {
    // keyが空の場合は何もしない
    if (!param.key) {
      return;
    }
    searchParams.append(param.key, param.value);
  });
  newUrl.search = searchParams.toString();
  newUrl.pathname = editPaths.value
    .flatMap((path) => {
      if (path.value == "") return [];
      return encodeURIComponent(path.value);
    })
    .join("/");

  return newUrl;
});

const href = computed(() => {
  return isEncoded.value
    ? editedUrl.value.href
    : decodeURI(editedUrl.value.href);
});

function init(url: URL) {
  const searchParams = url.searchParams;
  const entries = searchParams.entries();
  const params: Param[] = [];
  for (const [key, value] of entries) {
    const id = crypto.randomUUID();
    params.push({ id, key, value });
  }
  // 新規エントリを追加するための入力欄
  params.push(createNewParam());

  editParams.value = params;

  const paths = url.pathname.split("/").flatMap((path) => {
    if (path == "") return [];
    return { id: crypto.randomUUID(), value: decodeURIComponent(path) };
  });

  paths.push(createNewPath());

  editPaths.value = paths;

  // lockMapの初期化
  lockedKeyMap.value = {};
}

function toggleLock(key: string) {
  lockedKeyMap.value[key] = !lockedKeyMap.value[key];
}

function removeParam(id: string) {
  editParams.value = editParams.value.filter((param) => param.id !== id);
}
function removePath(id: string) {
  editPaths.value = editPaths.value.filter((path) => path.id !== id);
}
function createNewParam() {
  return { id: crypto.randomUUID(), key: "", value: "" };
}
function createNewPath() {
  return { id: crypto.randomUUID(), value: "" };
}
function onUpdateParam() {
  const lastParam = editParams.value.at(-1);
  if (!lastParam) return;

  // 最後のエントリが空でない場合は新しいエントリを追加
  if (lastParam.key || lastParam.value) {
    editParams.value.push(createNewParam());
  }
}
function onUpdatePath() {
  const lastPath = editPaths.value.at(-1);
  if (!lastPath) return;

  // 最後のエントリが空でない場合は新しいエントリを追加
  if (lastPath.value) {
    editPaths.value.push(createNewPath());
  }
}

function reset() {
  init(props.url);
}
function removeAllParams() {
  // ロックされているエントリを残す
  const filteredParams = editParams.value.filter((param) => {
    return lockedKeyMap.value[param.id];
  });
  // 最後の要素を追加して更新
  editParams.value = [...filteredParams, createNewParam()];
}

function copyUrl() {
  navigator.clipboard.writeText(href.value);
}

function toggleEncode() {
  isEncoded.value = !isEncoded.value;
}

watch(
  () => props.url,
  (url) => {
    init(url);
  },
  {
    immediate: true,
  }
);
</script>

<template>
  <div class="flex flex-col p-4 text-sm gap-4 mb-16 min-w-[500px]">
    <section>
      <div class="flex flex-row justify-between items-center">
        <h1 class="text-lg font-bold">URL</h1>

        <div class="flex flex-row items-center">
          <button
            class="py-2 px-2 rounded-md flex items-center gap-2 active:bg-slate-300"
            @click="toggleEncode"
          >
            <i class="i-mdi-exchange w-5 h-5"></i>
            {{ isEncoded ? "encoded" : "decoded" }}
          </button>
          <button
            class="bg-blue-500 text-white py-2 px-2 rounded-md flex items-center gap-2 font-bold active:bg-blue-600"
            @click="copyUrl"
          >
            <i class="i-mdi-content-copy w-5 h-5"></i>
            copy
          </button>
        </div>
      </div>
      <textarea :value="href" class="border p-2 w-full" rows="3" readonly />
    </section>
    <section>
      <details>
        <summary class="text-lg font-bold">Paths</summary>
        <table>
          <tbody>
            <tr v-for="({ id }, i) in editPaths" :key="id">
              <td class="min-w-8">
                <button
                  v-if="i !== editPaths.length - 1"
                  class="flex bg-white p-1"
                  @click="removePath(id)"
                >
                  <i class="i-mdi-trash-can-outline bg-red-500 w-5 h-5"></i>
                </button>
              </td>

              <td class="p-2 w-full">
                <input
                  v-model="editPaths[i].value"
                  class="border p-1 w-full"
                  :disabled="lockedKeyMap[id]"
                  placeholder="path"
                  @input="onUpdatePath"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </details>
    </section>

    <section>
      <details open>
        <summary class="text-lg font-bold">Params</summary>

        <table>
          <tbody>
            <tr v-for="({ id }, i) in editParams" :key="id">
              <td class="min-w-8">
                <button
                  v-if="i !== editParams.length - 1"
                  class="flex bg-white p-1"
                  @click="removeParam(id)"
                >
                  <i class="i-mdi-trash-can-outline bg-red-500 w-5 h-5"></i>
                </button>
              </td>

              <td class="min-w-8">
                <button
                  v-if="i !== editParams.length - 1"
                  class="flex bg-white p-1"
                  @click="toggleLock(id)"
                >
                  <i
                    :class="`${
                      lockedKeyMap[id]
                        ? 'i-mdi-lock bg-black'
                        : 'i-mdi-lock-open bg-slate-300'
                    }  w-5 h-5`"
                  ></i>
                </button>
              </td>

              <td class="p-2">
                <input
                  v-model="editParams[i].key"
                  class="border p-1"
                  :disabled="lockedKeyMap[id]"
                  placeholder="key"
                  @input="onUpdateParam"
                />
              </td>
              <td class="p-2 w-full">
                <input
                  v-model="editParams[i].value"
                  class="border p-1 w-full"
                  :disabled="lockedKeyMap[id]"
                  placeholder="value"
                  @input="onUpdateParam"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </details>
    </section>

    <footer
      class="fixed inset-0 top-auto flex justify-center gap-2 p-2 bg-slate-800"
    >
      <!-- remove all button -->
      <button
        class="bg-red-500 text-white py-2 px-2 rounded-md flex items-center gap-2 font-bold active:bg-red-600"
        @click="removeAllParams"
      >
        <i class="i-mdi-trash-can-outline w-5 h-5"></i>
        remove all params
      </button>
      <!-- reset button -->
      <button
        class="bg-blue-500 text-white py-2 px-2 rounded-md flex items-center gap-2 font-bold active:bg-blue-600"
        @click="reset"
      >
        <i class="i-mdi-reload w-5 h-5"></i>
        reset
      </button>
    </footer>
  </div>
</template>
