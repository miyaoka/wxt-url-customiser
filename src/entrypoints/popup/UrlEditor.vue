<script setup lang="ts">
const props = defineProps<{
  href: string;
}>();

interface Param {
  id: string;
  key: string;
  value: string;
}

const editParams = ref<Param[]>([]);
const lockedKeyMap = ref<Record<string, boolean>>({});
const newParam = ref<Param>(createNewParam());
const new2Param = ref<Param>(createNewParam());

const url = computed(() => {
  return new URL(props.href);
});

const editedUrl = computed(() => {
  const newUrl = new URL(props.href);
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
  const result: Param[] = [];
  for (const [key, value] of entries) {
    const id = crypto.randomUUID();
    result.push({ id, key, value });
  }
  editParams.value = result;

  // lockMapの初期化
  lockedKeyMap.value = {};
}

function toggleLock(key: string) {
  lockedKeyMap.value[key] = !lockedKeyMap.value[key];
}

function removeKey(key: string) {
  editParams.value = editParams.value.filter((param) => param.key !== key);
}
function createNewParam() {
  return { id: crypto.randomUUID(), key: "", value: "" };
}
function updateNewEntry() {
  // keyとvalueが入力されていない場合は何もしない
  if (!newParam.value.key || !newParam.value.value) {
    return;
  }

  // paramsに新しいエントリを追加
  editParams.value.push({
    ...newParam.value,
    id: crypto.randomUUID(),
  });
  // 入力欄をクリア
  newParam.value = {
    id: new2Param.value.id,
    key: "",
    value: "",
  };
  new2Param.value = createNewParam();
}

function reset() {
  init(url.value);
}
function removeAll() {
  editParams.value = editParams.value.filter((param) => {
    return lockedKeyMap.value[param.id];
  });
}

watch(
  url,
  (url) => {
    init(url);
  },
  {
    immediate: true,
  }
);
</script>

<template>
  <div class="p-10 text-sm min-w-[600px]">
    <textarea :value="editedUrl.href" class="border p-2 w-full" rows="3" />
    {{ lockedKeyMap }}
    <div>
      {{ editParams }}
    </div>

    <table class="table table-fixed border-separate border-spacing-1">
      <tbody>
        <tr v-for="({ id, key, value }, i) in editParams" :key="id">
          <td>
            <button class="flex bg-white p-2" @click="toggleLock(id)">
              <i
                :class="`${
                  lockedKeyMap[id]
                    ? 'i-mdi-lock bg-black'
                    : 'i-mdi-lock-open bg-slate-300'
                }  w-4 h-4`"
              ></i>
            </button>
          </td>
          <td>
            {{ id }}
          </td>
          <td class="p-2">
            <input
              v-model="editParams[i].key"
              class="border p-1"
              :disabled="lockedKeyMap[key]"
            />
          </td>
          <td class="p-2">
            <input
              v-model="editParams[i].value"
              class="border p-1"
              :disabled="lockedKeyMap[key]"
            />
          </td>
          <td>
            <button class="flex bg-white p-2" @click="removeKey(key)">
              <i class="i-mdi-trash-can-outline bg-red-500 w-6 h-6"></i>
            </button>
          </td>
        </tr>
        <tr>
          <td></td>
          <td>{{ newParam.id }}</td>
          <td class="p-2">
            <input
              v-model="newParam.key"
              class="border p-1"
              placeholder="new key"
              @change="updateNewEntry"
            />
          </td>
          <td class="p-2">
            <input
              v-model="newParam.value"
              class="border p-1"
              placeholder="new value"
              @change="updateNewEntry"
            />
          </td>
        </tr>
        <tr v-if="newParam.key && newParam.value" :key="new2Param.id">
          <td></td>
          <td>{{ new2Param.id }}</td>
          <td class="p-2">
            <input class="border p-1" placeholder="new key" />
          </td>
          <td class="p-2">
            <input class="border p-1" placeholder="new value" />
          </td>
        </tr>
      </tbody>
    </table>

    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      @click="removeAll"
    >
      remove All
    </button>
    <!-- reset -->
    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      @click="reset"
    >
      reset
    </button>
  </div>
</template>
