<template>
  <a-page-header title="Cấu hình Tỷ lệ Rider" />
  <a-card class="mb12">
    <div style="display:flex; gap:8px; align-items:center;">
        <a-select v-model:value="filterPlan" placeholder="Plan" style="width:240px" show-search allowClear
        :options="planOptions" :loading="loadingPlans"
        @dropdownVisibleChange="loadPlans"/>
      <a-select v-model:value="filterPricingVersion" placeholder="Pricing Version" style="width: 240px" show-search @dropdownVisibleChange="loadPricingVersions" :options="pricingVersionOptions" @change="()=>loadRates()" />
      <a-select v-model:value="filterRiderCode" placeholder="Rider" style="width:240px" :options="masterOptions" allowClear @change="()=>loadRates()" />
      <a-button type="primary" @click="openRateModal()">Tạo Rate</a-button>
      <a-button @click="()=> loadRates()">Làm mới</a-button>
    </div>
  </a-card>

  <a-card title="Danh sách Rate">
    <a-table :columns="rateColumns" :dataSource="rates" 
    :rowKey="r => `${r.pricingVersionId}::${r.riderCode}::${r.ageMin}::${r.ageMax}`" :pagination="pagination" :loading="loadingRates" @change="handleTableChange" :scroll="{ x: 1200, y: 500 }">
      <template #bodyCell="{ column, record }: any">
        <template v-if="column.key === 'action'">
          <a-space style="justify-content:flex-end; width:100%">
            <a-button size="small" @click="openRateModal(record)">Sửa</a-button>
            <a-popconfirm title="Xóa rate này?" @confirm="() => deleteRate(record)"><a-button size="small" danger>Xóa</a-button></a-popconfirm>
          </a-space>
        </template>
        <template v-else>
          <span>{{ record[column.dataIndex] }}</span>
        </template>
      </template>
    </a-table>
  </a-card>

  <!-- Rate modal -->
  <a-modal v-model:visible="rateModalVisible" :title="rateModalTitle" @ok="submitRate" @cancel="rateModalVisible=false" :confirmLoading="rateSubmitting">
    <a-form layout="vertical">
      <a-row :gutter="8">
        <a-col :span="12">
          <a-form-item label="Plan Id">
            <a-select v-model:value="rateForm.planId" :options="planOptions" @dropdownVisibleChange="loadPlans" />
          </a-form-item>
        </a-col>

        <a-col :span="12">
          <a-form-item label="Pricing Version">
            <a-select v-model:value="rateForm.pricingVersionId" :options="pricingVersionOptions" @dropdownVisibleChange="loadPricingVersions" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="Rider Code">
            <a-select v-model:value="rateForm.riderCode" :options="masterOptions" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="8">
        <a-col :span="8"><a-form-item label="Age Min"><a-input-number v-model:value="rateForm.ageMin" style="width:100%" /></a-form-item></a-col>
        <a-col :span="8"><a-form-item label="Age Max"><a-input-number v-model:value="rateForm.ageMax" style="width:100%" /></a-form-item></a-col>
        <a-col :span="8"><a-form-item label="Rate /1000"><a-input-number v-model:value="rateForm.ratePer1000" style="width:100%" :step="0.0001" /></a-form-item></a-col>
      </a-row>

      <a-row :gutter="8">
        <a-col :span="8"><a-form-item label="Rate /Unit"><a-input-number v-model:value="rateForm.ratePerUnit" style="width:100%" :step="0.0001" /></a-form-item></a-col>
        <a-col :span="8"><a-form-item label="% Of Base"><a-input-number v-model:value="rateForm.percentOfBase" style="width:100%" :step="0.01" /></a-form-item></a-col>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { RiderApi } from '@/apis/rider';
import { PricingVersionApi } from '@/apis/pricingVersion';
import { ProductPlanApi } from '@/apis/productPlan';
import { UpdateRiderRateDto } from '@/apis/types/rider';

const filterPlan = ref<string | undefined>(undefined);
const filterPricingVersion = ref<string | undefined>(undefined);
const filterRiderCode = ref<string | undefined>(undefined);

const pricingVersionOptions = ref<any[]>([]);
const planOptions = ref<any[]>([]);
const mastersList = ref<any[]>([]);
const loadingPlans = ref(false);
const masterOptions = computed(() => mastersList.value.map((m: any) => ({ label: `${m.name} (${m.riderCode})`, value: m.riderCode })));

const rates = ref<any[]>([]);
const loadingRates = ref(false);


// pagination state
const page = ref(1);
const pageSize = ref(20);
const totalRates = ref(0);

const pagination = reactive({
  current: page.value,
  pageSize: pageSize.value,
  total: totalRates.value,
  showSizeChanger: true,
  pageSizeOptions: ['10','20','50','100']
})

async function loadPricingVersions(open = true) {
  if (!open) return;
  const planId = filterPlan.value || rateForm.planId;
  if (!planId) return;
  try {
    const resp = await PricingVersionApi.getAll(planId) ?? [];
    const list = (resp as any).data ?? resp ?? [];
    const items = Array.isArray(list) ? list : (list.items ?? list.Items ?? []);
    pricingVersionOptions.value = items.map((p: any) => ({ label: p.pricingVersionId ?? p.name, value: p.pricingVersionId }));
  } catch (e) { console.error(e); }
}


async function loadPlans(open = true) {
  if (!open) return;
  loadingPlans.value = true;
  try {
    const resp = await ProductPlanApi.getAll({ page: 1, pageSize: 500 });
    const data = (resp as any).data ?? resp ?? [];
    const list = Array.isArray(data) ? data : (data.items ?? data.Items ?? []);
    planOptions.value = (list ?? []).map((p: any) => ({ label: p.planId ?? p.planCode ?? p.name, value: p.planId ?? p.id }));
  } catch (err) {
    console.error(err);
  } finally {
    loadingPlans.value = false;
  }
}

async function loadMasters() {
  try {
    const resp = await RiderApi.queryMasters();
    mastersList.value = (resp as any).data ?? resp ?? [];
  } catch (e) { console.error(e); }
}

// loadRates now requests paged result
async function loadRates(p = page.value, ps = pageSize.value) {
  loadingRates.value = true;
  try {
    // RiderApi.queryRates returns paged result { items, totalItems, page, pageSize } now
    const resp = await RiderApi.queryRates({ pricingVersionId: filterPricingVersion.value, riderCode: filterRiderCode.value, page: p, pageSize: ps });
    const data = (resp as any).data ?? resp ?? {};
    const items = data.items ?? data.Items ?? data.Items ?? [];
    const total = data.totalItems ?? data.TotalItems ?? data.total ?? 0;

    rates.value = Array.isArray(items) ? items : [];
    totalRates.value = Number(total) || 0;

    // update reactive pagination
    page.value = data.page ?? p;
    pageSize.value = data.pageSize ?? ps;
    pagination.current = page.value;
    pagination.pageSize = pageSize.value;
    pagination.total = totalRates.value;
  } catch (e) {
    console.error(e);
    message.error('Tải rate thất bại');
  } finally {
    loadingRates.value = false;
  }
}

// table change handler (pagination, filters, sorter)
function handleTableChange(pag: any) {
  // pag.current and pag.pageSize from Antd table
  const newPage = pag.current ?? 1;
  const newPageSize = pag.pageSize ?? pageSize.value;
  page.value = newPage;
  pageSize.value = newPageSize;
  loadRates(newPage, newPageSize);
}

// rate modal
const rateModalVisible = ref(false);
const rateSubmitting = ref(false);
const rateForm = reactive({
  planId: '',
  pricingVersionId: '',
  riderCode: '',
  ageMin: 0,
  ageMax: 0,
  ratePer1000: null as number | null | any,
  ratePerUnit: null as number | null | any,
  percentOfBase: null as number | null | any,
});
const editingRateKey = ref<string | null>(null);

const rateColumns: any[] = [
  { title: 'Pricing Version', dataIndex: 'pricingVersionId', key: 'pricingVersionId' },
  { title: 'Rider', dataIndex: 'riderCode', key: 'riderCode' },
  { title: 'Age Min', dataIndex: 'ageMin', key: 'ageMin' },
  { title: 'Age Max', dataIndex: 'ageMax', key: 'ageMax' },
  { title: 'Rate/1000', dataIndex: 'ratePer1000', key: 'ratePer1000' },
  { title: 'Rate/Unit', dataIndex: 'ratePerUnit', key: 'ratePerUnit' },
  { title: '% Of Base', dataIndex: 'percentOfBase', key: 'percentOfBase' },
  { title: 'Action', key: 'action', fixed: 'right', width: 160 },
];

const rateModalTitle= computed(() => {
  return editingRateKey.value ? `Sửa rate ${editingRateKey.value}` : 'Tạo rate mới';
})

function openRateModal(record?: any) {
  if (record) {
    rateForm.pricingVersionId = record.pricingVersionId;
    rateForm.riderCode = record.riderCode;
    rateForm.ageMin = record.ageMin;
    rateForm.ageMax = record.ageMax;
    rateForm.ratePer1000 = record.ratePer1000 ?? null;
    rateForm.ratePerUnit = record.ratePerUnit ?? null;
    rateForm.percentOfBase = record.percentOfBase ?? null;
    editingRateKey.value = `${record.pricingVersionId}::${record.riderCode}::${record.ageMin}::${record.ageMax}`;
  } else {
    rateForm.pricingVersionId = filterPricingVersion.value ?? '';
    rateForm.riderCode = filterRiderCode.value ?? '';
    rateForm.ageMin = 0;
    rateForm.ageMax = 0;
    rateForm.ratePer1000 = null;
    rateForm.ratePerUnit = null;
    rateForm.percentOfBase = null;
    editingRateKey.value = null;
  }
  rateModalVisible.value = true;
}

async function submitRate() {
  rateSubmitting.value = true;
  try {
    if (!rateForm.pricingVersionId || !rateForm.riderCode) {
      message.warn('Chọn pricing version và rider');
      return;
    }
    if (rateForm.ageMin > rateForm.ageMax) {
      message.warn('AgeMin phải <= AgeMax');
      return;
    }

    const payload = {
      pricingVersionId: rateForm.pricingVersionId,
      riderCode: rateForm.riderCode,
      ageMin: rateForm.ageMin,
      ageMax: rateForm.ageMax,
      ratePer1000: rateForm.ratePer1000,
      ratePerUnit: rateForm.ratePerUnit,
      percentOfBase: rateForm.percentOfBase,
    };

    if (editingRateKey.value) {
      // parse existing key
      const [pv, code, minStr, maxStr] = editingRateKey.value.split('::');
      await RiderApi.updateRate(pv ?? "", code ?? "", Number(minStr), Number(maxStr), payload);
      message.success('Cập nhật rate thành công');
    } else {
      await RiderApi.createRate(payload);
      message.success('Tạo rate thành công');
    }
    rateModalVisible.value = false;
    await loadRates();
  } catch (err: any) {
    console.error(err);
    message.error(err?.message ?? 'Lưu thất bại');
  } finally {
    rateSubmitting.value = false;
  }
}

async function deleteRate(record: any) {
  try {
    await RiderApi.deleteRate(record.pricingVersionId, record.riderCode, record.ageMin, record.ageMax);
    message.success('Xóa thành công');
    await loadRates();
  } catch (err: any) {
    console.error(err);
    message.error(err?.message ?? 'Xóa thất bại');
  }
}

onMounted(() => { loadPricingVersions(); loadMasters(); loadRates(1, pageSize.value); });
</script>

<style scoped>
.mb12 { margin-bottom: 12px; }
</style>
