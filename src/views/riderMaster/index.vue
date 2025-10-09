<template>
  <a-page-header title="Quản lý Phụ trợ bảo hiểm" />
  <a-card class="mb12">
    <div style="display:flex; gap:8px; align-items:center;">
      <a-input-search v-model:value="q" placeholder="Tìm theo mã hoặc tên" @search="onSearch" style="width:320px" allowClear />
      <a-button type="primary" @click="openMasterModal()">Tạo Rider</a-button>
      <a-button @click="loadMasters">Làm mới</a-button>
    </div>
  </a-card>

  <a-card title="Danh sách Rider" class="mb12">
    <a-table :columns="masterColumns" :dataSource="masters" :rowKey="r => r.riderCode" :pagination="false" :loading="loadingMasters" :scroll="{ x: 1400, y: 500 }">
      <template #bodyCell="{ column, record }: any">
        <template v-if="column.key === 'action'">
          <a-space style="justify-content:flex-end; width:100%">
            <a-button size="small" @click="openMasterModal(record)">Sửa</a-button>
            <a-popconfirm title="Xóa rider này?" @confirm="() => deleteMaster(record.riderCode)">
              <a-button size="small" danger>Xóa</a-button>
            </a-popconfirm>
          </a-space>
        </template>
        <template v-else>
          <span>{{ record[column.dataIndex] }}</span>
        </template>
      </template>
    </a-table>
  </a-card>

  <!-- Master modal -->
  <a-modal v-model:open="masterModalVisible" :title="masterModalTitle" @ok="submitMaster" @cancel="masterModalVisible=false" :confirmLoading="masterSubmitting">
    <a-form layout="vertical">
      <a-form-item label="Mã Rider">
        <a-input v-model:value="masterForm.riderCode" :disabled="isEditMaster" />
      </a-form-item>
      <a-form-item label="Tên">
        <a-input v-model:value="masterForm.name" />
      </a-form-item>
      <a-form-item label="Cơ sở tính">
        <a-select v-model:value="masterForm.basis" allowClear>
          <a-select-option value="per_1000">per_1000</a-select-option>
          <a-select-option value="per_unit">per_unit</a-select-option>
          <a-select-option value="percent_of_base">percent_of_base</a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { RiderApi } from '@/apis/rider';
import type { RiderMasterDto, CreateRiderMasterDto, UpdateRiderMasterDto } from '@/apis/types/rider';

const q = ref('');
const masters = ref<RiderMasterDto[]>([]);
const loadingMasters = ref(false);

const masterModalVisible = ref(false);
const masterSubmitting = ref(false);
const isEditMaster = ref(false);
const masterForm = reactive<CreateRiderMasterDto & { riderCode?: string; name?: string; basis?: string }>({
  riderCode: '',
  name: '',
  basis: undefined,
});

const masterColumns: any[] = [
  { title: 'Mã Rider', dataIndex: 'riderCode', key: 'riderCode' },
  { title: 'Tên', dataIndex: 'name', key: 'name' },
  { title: 'Cơ sở', dataIndex: 'basis', key: 'basis' },
  { title: 'Hành động', key: 'action', fixed: 'right', width: 160 },
];

const masterModalTitle = computed(() => {
  return isEditMaster.value ? `Sửa Rider ${masterForm.riderCode}` : 'Tạo Rider mới';
})

function onSearch(val?: string) {
  loadMasters();
}

async function loadMasters() {
  loadingMasters.value = true;
  try {
    const resp = await RiderApi.queryMasters(q.value || undefined);
    masters.value = (resp as any).data ?? resp ?? [];
  } catch (err) {
    console.error(err);
    message.error('Tải danh sách Rider thất bại');
  } finally {
    loadingMasters.value = false;
  }
}

function openMasterModal(record?: RiderMasterDto) {
  if (record) {
    isEditMaster.value = true;
    masterForm.riderCode = record.riderCode;
    masterForm.name = record.name;
    masterForm.basis = record.basis ?? undefined;
  } else {
    isEditMaster.value = false;
    masterForm.riderCode = '';
    masterForm.name = '';
    masterForm.basis = undefined;
  }
  masterModalVisible.value = true;
}

async function submitMaster() {
  masterSubmitting.value = true;
  try {
    if (!masterForm.riderCode || !masterForm.name) {
      message.warn('Mã và tên là bắt buộc');
      return;
    }
    if (isEditMaster.value) {
      const payload: UpdateRiderMasterDto = { name: masterForm.name!, basis: masterForm.basis ?? undefined };
      await RiderApi.updateMaster(masterForm.riderCode!, payload);
      message.success('Cập nhật Rider thành công');
    } else {
      const payload: CreateRiderMasterDto = { riderCode: masterForm.riderCode!, name: masterForm.name!, basis: masterForm.basis ?? undefined };
      await RiderApi.createMaster(payload);
      message.success('Tạo Rider thành công');
    }
    masterModalVisible.value = false;
    await loadMasters();
  } catch (err: any) {
    console.error(err);
    message.error(err?.message ?? 'Lưu thất bại');
  } finally {
    masterSubmitting.value = false;
  }
}

async function deleteMaster(riderCode: string) {
  try {
    await RiderApi.deleteMaster(riderCode);
    message.success('Xóa thành công');
    await loadMasters();
  } catch (err: any) {
    console.error(err);
    message.error(err?.message ?? 'Xóa thất bại');
  }
}

onMounted(() => loadMasters());
</script>

<style scoped>
.mb12 { margin-bottom: 12px; }
</style>
