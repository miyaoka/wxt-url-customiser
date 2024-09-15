<script setup lang="ts">
const props = defineProps<{
  url: URL;
}>();

interface Param {
  id: string;
  key: string;
  value: string;
}

const editParams = ref<Param[]>([]);
const lockedKeyMap = ref<Record<string, boolean>>({});

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

  return newUrl;
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

  // lockMapの初期化
  lockedKeyMap.value = {};
}

function toggleLock(key: string) {
  lockedKeyMap.value[key] = !lockedKeyMap.value[key];
}

function removeKey(id: string) {
  editParams.value = editParams.value.filter((param) => param.id !== id);
}
function createNewParam() {
  return { id: crypto.randomUUID(), key: "", value: "" };
}
function onUpdate() {
  console.log("onUpdate");
  const lastParam = editParams.value.at(-1);
  if (!lastParam) return;

  console.log("lastParam", lastParam);
  // 最後のエントリが空でない場合は新しいエントリを追加
  if (lastParam.key || lastParam.value) {
    editParams.value.push(createNewParam());
  }
}

function reset() {
  init(props.url);
}
function removeAll() {
  // ロックされているエントリを残す
  const filteredParams = editParams.value.filter((param) => {
    return lockedKeyMap.value[param.id];
  });
  // 最後の要素を追加して更新
  editParams.value = [...filteredParams, createNewParam()];
}

function copyUrl() {
  navigator.clipboard.writeText(editedUrl.value.href);
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
  <div class="flex flex-col p-4 text-sm gap-4">
    <section>
      <div class="flex flex-row justify-between items-center">
        <h1 class="text-lg font-bold">URL</h1>
        <!-- copy button -->
        <button
          class="bg-blue-500 text-white py-2 px-2 rounded-md flex items-center gap-2 font-bold"
          @click="copyUrl"
        >
          <i class="i-mdi-content-copy w-5 h-5"></i>
          copy
        </button>
      </div>
      <textarea
        :value="editedUrl.href"
        class="border p-2 w-full"
        rows="3"
        readonly
      />
    </section>
    <section>
      <h2 class="text-lg font-bold">Pathes</h2>
    </section>

    <section>
      <h2 class="text-lg font-bold">Params</h2>

      <table class="mb-16">
        <tbody>
          <tr v-for="({ id, key, value }, i) in editParams" :key="id">
            <td class="min-w-8">
              <button
                v-if="i !== editParams.length - 1"
                class="flex bg-white p-1"
                @click="removeKey(id)"
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
                :disabled="lockedKeyMap[key]"
                placeholder="key"
                @input="onUpdate"
              />
            </td>
            <td class="p-2">
              <input
                v-model="editParams[i].value"
                class="border p-1"
                :disabled="lockedKeyMap[key]"
                placeholder="value"
                @input="onUpdate"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <footer
      class="fixed inset-0 top-auto flex justify-center gap-2 p-2 bg-slate-200"
    >
      <!-- remove all button -->
      <button
        class="bg-red-500 text-white py-2 px-2 rounded-md flex items-center gap-2 font-bold"
        @click="removeAll"
      >
        <i class="i-mdi-trash-can-outline w-5 h-5"></i>
        remove all params
      </button>
      <!-- reset button -->
      <button
        class="bg-blue-500 text-white py-2 px-2 rounded-md flex items-center gap-2 font-bold"
        @click="reset"
      >
        <i class="i-mdi-reload w-5 h-5"></i>
        reset
      </button>
    </footer>
  </div>
</template>
