<template>
  <a-select
    v-model:value="internalValue"
    :placeholder="placeholder"
    show-search
    :filter-option="false"
    :options="mappedOptions"
    :loading="loading"
    @search="onSearch"
    @popupScroll="onScroll"
    @change="updateValue"
    :mode="mode"
    :virtual="false"
    @dropdownVisibleChange="onDropdownVisibleChange"
  />
</template>
<!-- @dropdownVisibleChange="onDropdownVisibleChange" -->

<script setup>
import { ref, watch } from 'vue'

import { debounce } from 'lodash-es'

const props = defineProps({
  modelValue: [String, Number, Object],
  placeholder: { type: String, default: 'Select user' },
  pageSize: { type: Number, default: 10 },
  fetchApiUsers: { type: Function, required: true },
  labelKey: { type: String, default: 'name' },
  valueKey: { type: String, default: 'id' },
  mode: { type: String, default: undefined }
})

const emit = defineEmits(['update:modelValue'])

const internalValue = ref(props.modelValue)
const users = ref([])
const loading = ref(false)
const query = ref('')
const page = ref(1)
const hasMore = ref(true)

watch(() => props.modelValue, (val) => {
  internalValue.value = val;
})

onMounted(async () => {
  console.log('onMounted')
  await refresh()
})

const onDropdownVisibleChange = async (visible) => {
  if (visible) {
    await refresh()
  }
}

const mappedOptions = computed(() =>
  users.value.map(user => ({
    label: user[props.labelKey],
    value: user[props.valueKey]
  }))
)

const refresh = async (q) => {
  query.value = q || null
  page.value = 1
  hasMore.value = true
  users.value = []
  await fetchApiManumal()
}

// expose hàm refresh ra ngoài
defineExpose({
  refresh
})

const onSearch = debounce(refresh, 1000*1)

const onScroll = async (e) => {
  const { scrollTop, scrollHeight, clientHeight } = e.target
  if (scrollTop + clientHeight >= scrollHeight - 10 && hasMore.value && !loading.value) {
    await fetchApiManumal()
  }
}

// const onDropdownVisibleChange = async (visible) => {
//   if (visible) {
//     await nextTick()
//     const dropdown = document.querySelector('.ant-select-dropdown .ant-select-item-option-content')?.parentElement?.parentElement
//     console.log('onDropdownVisibleChange', dropdown)
//     if (dropdown) {
//       dropdown.addEventListener('scroll', onScroll)
//     }
//   }
// }


const fetchApiManumal = async () => {
  loading.value = true
  try {
    const result = await props.fetchApiUsers(query.value, page.value, props.pageSize)
    if (Array.isArray(result) && result.length > 0) {
      users.value.push(...result)
      hasMore.value = result.length === props.pageSize
      page.value += 1
    } else {
      hasMore.value = false
    }
  } catch (err) {
    console.error('Error fetching users:', err)
    hasMore.value = false
  } finally {
    loading.value = false
  }
}

const updateValue = (val) => {
  emit('update:modelValue', val)
}
</script>

<!-- <template>
  <LazyUserSelect
    v-model="selectedUser"
    :fetchApiUsers="fetchUsers"
    labelKey="fullName"
    valueKey="userId"
    placeholder="Search users..."
    :pageSize="5"
  />
</template>

<script setup>
import LazyUserSelect from './components/LazyUserSelect.vue'
import { ref } from 'vue'

const selectedUser = ref(null)

const fetchUsers = async (query, page, pageSize) => {
  const res = await fetch(`/api/users?search=${query}&page=${page}&limit=${pageSize}`)
  const data = await res.json()
  return data.users
}
</script> -->

