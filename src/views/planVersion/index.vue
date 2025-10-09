<template>
  <router-view v-slot="{ route }">
    <div class="plan-version-page">
      <h2 class="title">Plan Versions for {{ planId }}</h2>

      <a-card class="mb16" :body-style="{ padding: '12px' }">
        <div style="display:flex; gap:12px; align-items:center; margin-bottom:8px;">
          <a-input-search v-model:value="q" placeholder="Search by PricingVersionId" @search="onSearch"
            style="width:360px" allowClear />
          <a-button type="primary" @click="openCreate">Create Version</a-button>
          <a-button danger :disabled="!selectedKeys.length" @click="onDeleteSelected">Delete Selected</a-button>
          <a-button :loading="loading" @click="load">Refresh</a-button>
          <!-- productPlan/index.vue template: chỗ toolbar -->
          <a-button type="default" @click="() => router.push({ name: 'PricingVersions', params: { planId } })">
            Pricing Versions
          </a-button>
        </div>

        <a-table :columns="tableColumns" :dataSource="dataSource" :loading="loading" :pagination="pagination"
          :rowKey="rowKey" :rowSelection="rowSelection" :scroll="{ x: 1000 }" @change="handleTableChange">
          <template #bodyCell="{ column, record }: any">
            <template v-if="column.key === 'action'">
              <a-dropdown placement="topLeft" trigger="click">
                <template #overlay>
                  <a-menu class="menu-box" @click="() => onMenuClickWithRecord">
                    <a-menu-item v-for="(action, index) in getActions(record)" :key="`${index}-${action.label}`"
                      :style="{ color: action.type === 'delete' ? 'red' : 'inherit' }">
                      <template #icon>
                        <Icon align="2px" size="15px" style="margin-right: 12px;" :type="getActionIcon(action)" />
                      </template>

                      <span v-if="action.permission === false">——</span>

                      <a v-else @click="() => action.onClick?.(record)" :type="action.type">{{
                        getActionLabel(action, record) }}</a>
                    </a-menu-item>
                  </a-menu>
                </template>

                <template #default>
                  <span class="ant-dropdown-link" role="button" tabindex="0" @click.prevent>
                    <Icon align="2px" size="20px" style="margin-left: 5px" type="EllipsisOutlined" />
                  </span>
                </template>
              </a-dropdown>
            </template>

            <template v-else>
              <!-- default cell renderer -->
              <span>{{ record[column.dataIndex] }}</span>
            </template>
          </template>
        </a-table>
      </a-card>

      <a-modal v-model:open="modalVisible" :title="isEdit ? 'Edit Plan Version' : 'Create Plan Version'"
        @ok="handleSubmit" @cancel="handleCancel" :confirmLoading="submitting" :width="640" centered>
        <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
          <a-form-item label="Pricing Version Id" name="pricingVersionId"
            :rules="isEdit ? [] : [{ required: true, message: 'PricingVersionId required' }]">
            <a-select v-model:value="form.pricingVersionId" placeholder="Select pricing version" :disabled="isEdit"
              :loading="pvLoading" showSearch optionFilterProp="label" allowClear
              @dropdown-visible-change="handleOpenDropdown">
              <a-select-option v-for="pv in pricingVersionOptions" :key="pv.pricingVersionId"
                :value="pv.pricingVersionId">
                {{ pv.pricingVersionId }} - {{ formatToDate(pv.effectiveFrom) }}
              </a-select-option>
            </a-select>
          </a-form-item>


          <a-form-item label="Rounding Premium" name="roundingPremium">
            <a-select v-model:value="form.roundingPremium" placeholder="Select rounding rule for premium" allowClear>
              <a-select-option v-for="opt in roundingOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="Rounding Cash Val" name="roundingCashVal">
            <a-select v-model:value="form.roundingCashVal" placeholder="Select rounding rule for cash value" allowClear>
              <a-select-option v-for="opt in roundingOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </a-modal>
    </div>
  </router-view>

</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { TableRowSelection } from 'ant-design-vue/es/table/interface';
import { columns as baseColumns } from './constants';
import { PlanVersionApi } from '@/apis/planVersion';
import type {
  PlanVersionDto,
  CreatePlanVersionReq,
  UpdatePlanVersionReq,
} from '@/apis/types/planVersion';
import { FormInstance, Rule } from 'ant-design-vue/es/form';
import { PricingVersionDto } from '@/apis/types/pricingVersion';
import { PricingVersionApi } from '@/apis/pricingVersion';
import { dateUtil, formatToDate } from '@/utils/dateUtil';
import { useRouter } from 'vue-router';
import cloneDeep from 'lodash-es/cloneDeep'; 

// trong setup()
const router = useRouter();

const props = defineProps<{ planId: string; pricingVersionId?: string }>();
const planId = props.planId ?? useRoute().params.planId as string;

type RoundingOption = { value: string; label: string };

const pricingVersionOptions = ref<PricingVersionDto[]>([]);
const pvLoading = ref(false);

async function loadPricingVersions() {
  pvLoading.value = true;
  try {
    const resp = await PricingVersionApi.getAll(planId);
    pricingVersionOptions.value = (resp as any).data ?? resp ?? [];
  } catch (e) {
    console.error(e);
  } finally {
    pvLoading.value = false;
  }
}

const handleOpenDropdown = async (open: boolean) => {
  if (open) {
    await loadPricingVersions();
  }
}

onMounted(async () => {
  await load();
  await loadPricingVersions();
})

// Shared list of rounding options
const roundingOptions = ref<RoundingOption[]>([
  { value: 'NONE', label: 'None (no rounding)' },
  { value: 'NEAREST_1', label: 'Nearest 1' },
  { value: 'NEAREST_10', label: 'Nearest 10' },
  { value: 'NEAREST_100', label: 'Nearest 100' },
  { value: 'NEAREST_1000', label: 'Nearest 1,000' },
  { value: 'CEILING_10', label: 'Ceiling 10 (round up)' },
  { value: 'CEILING_100', label: 'Ceiling 100 (round up)' },
  { value: 'FLOOR_10', label: 'Floor 10 (round down)' },
  { value: 'FLOOR_100', label: 'Floor 100 (round down)' },
]);

const q = ref('');
const loading = ref(false);
const submitting = ref(false);
const modalVisible = ref(false);
const isEdit = ref(false);
const editKey = ref<string | null>(null);

const page = ref(1);
const pageSize = ref(20);
const total = ref(0);

const items = ref<PlanVersionDto[]>([]);
const selectedKeys = ref<string[]>([]);

type FormModel = {
  pricingVersionId?: string;
  roundingPremium?: string;
  roundingCashVal?: string
};
const defaultForm: FormModel = { pricingVersionId: '', roundingPremium: undefined, roundingCashVal: undefined };
const form = ref<FormModel>({ ...defaultForm });
const formRef = ref<FormInstance>();

const tableColumns = baseColumns;

const pagination = computed(() => ({
  current: page.value,
  pageSize: pageSize.value,
  total: total.value,
  showSizeChanger: true,
  showQuickJumper: true,
}));

const rowKey = (record: PlanVersionDto) => record.pricingVersionId;

// data source injects handlers
const dataSource = computed(() =>
  items.value.map((r, idx) => ({
    ...r,
    index: (page.value - 1) * pageSize.value + idx + 1,
    __onEdit: onRowEdit,
    __onDelete: onRowDelete,
  }))
);

// selection typed properly
const rowSelection = computed<TableRowSelection<PlanVersionDto>>(() => ({
  selectedRowKeys: selectedKeys.value,
  onChange: (keys: (string | number)[], rows: PlanVersionDto[]) => {
    selectedKeys.value = (keys as string[]).slice();
  },
}));

const rules: Record<string, Rule | Rule[]> = {
  pricingVersionId: [{ required: true, message: 'PricingVersionId required', trigger: 'blur' }],
};

// load list
const load = async () => {
  loading.value = true;
  try {
    const resp = await PlanVersionApi.getAll(planId);
    const data = (resp as any).data ?? resp;
    items.value = Array.from(data ?? []);
    // Plan versions endpoint returns array; set pagination total from array length
    total.value = items.value.length;
  } catch (e) {
    console.error(e);
    message.error('Load plan versions failed');
  } finally {
    loading.value = false;
  }
};

const onSearch = async () => {
  page.value = 1;
  await load();
};

const handleTableChange = async (paginationEvent: any) => {
  if (paginationEvent) {
    page.value = paginationEvent.current || page.value;
    pageSize.value = paginationEvent.pageSize || pageSize.value;
  }
  await load();
};

const openCreate = async () => {
  console.log(form.value)
  isEdit.value = false;
  editKey.value = null;
  Object.assign(form.value, cloneDeep(defaultForm));

  // show modal first so formRef is mounted
  modalVisible.value = true;
  
  // wait for DOM and form instance
  await nextTick();

  // reset internal ant form state and validation
  formRef.value?.resetFields?.(cloneDeep(defaultForm));        // set form model -> default values
  formRef.value?.clearValidate?.();     // clear any validations
  await nextTick();
};

async function onRowEdit(record: PlanVersionDto) {
  isEdit.value = true;
  editKey.value = record.pricingVersionId;
  try {
    const resp = await PlanVersionApi.getDetail(planId, record.pricingVersionId);
    const dto: PlanVersionDto = (resp as any).data ?? resp;
    Object.assign(form.value, {
      pricingVersionId: dto.pricingVersionId,
      roundingPremium: dto.roundingPremium ?? null,
      roundingCashVal: dto.roundingCashVal ?? null,
    });
    await nextTick();
    modalVisible.value = true;
    formRef.value?.clearValidate();
  } catch (e) {
    console.error(e);
    message.error('Load version detail failed');
  }
}

async function onRowDelete(record: PlanVersionDto) {
  Modal.confirm({
    title: 'Delete plan version',
    content: `Delete version ${record.pricingVersionId}?`,
    onOk: async () => {
      try {
        await PlanVersionApi.remove(planId, record.pricingVersionId);
        message.success('Deleted');
        selectedKeys.value = selectedKeys.value.filter(k => k !== record.pricingVersionId);
        load();
      } catch (e) {
        console.error(e);
        message.error('Delete failed');
      }
    },
  });
}

const onDeleteSelected = async () => {
  if (!selectedKeys.value.length) return;
  Modal.confirm({
    title: `Delete ${selectedKeys.value.length} version(s)`,
    content: `Are you sure to delete selected versions?`,
    onOk: async () => {
      try {
        for (const id of [...selectedKeys.value]) {
          await PlanVersionApi.remove(planId, id);
        }
        message.success('Deleted selected versions');
        selectedKeys.value = [];
        page.value = 1;
        load();
      } catch (e) {
        console.error(e);
        message.error('Delete failed');
      }
    },
  });
};

const handleSubmit = async () => {
  try {
    await formRef.value?.validate?.();
  } catch {
    return;
  }

  const createPayload: CreatePlanVersionReq = {
    pricingVersionId: (form.value.pricingVersionId ?? '').trim(),
    roundingPremium: form.value.roundingPremium ?? null,
    roundingCashVal: form.value.roundingCashVal ?? null,
  };

  const updatePayload: UpdatePlanVersionReq = {
    roundingPremium: form.value.roundingPremium ?? null,
    roundingCashVal: form.value.roundingCashVal ?? null,
  };

  submitting.value = true;
  try {
    if (isEdit.value && editKey.value) {
      await PlanVersionApi.update(planId, editKey.value, updatePayload);
      message.success('Updated');
    } else {
      await PlanVersionApi.create(planId, createPayload);
      message.success('Created');
    }
    modalVisible.value = false;
    selectedKeys.value = [];
    load();
  } catch (e: any) {
    console.error(e);
    const msg = e?.response?.data?.message ?? e?.response?.data ?? 'Save failed';
    message.error(String(msg));
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => {
  modalVisible.value = false;
};

// Helper to map action -> icon type
function getActionIcon(action: any) {
  if (action.key === 'edit') return 'EditOutlined';
  if (action.key === 'delete') return 'DeleteOutlined';
  if (action.key === 'planVersion') return 'ProfileOutlined';
  if (action.key === 'pricingVersion') return 'DatabaseOutlined';
  return 'AppstoreOutlined';
}

function getActionLabel(action: any, record: any) {
  if (typeof action.label === 'function') return action.label(record);
  return action.label;
}

// Build actions per row (record)
function getActions(record: Record<string, any>) {
  return [
    { key: 'edit', label: 'Edit', type: 'default', permission: true, enable: true, onClick: onRowEdit },
    { key: 'delete', label: 'Delete', type: 'danger', permission: true, enable: true, onClick: onRowDelete },
  ];
}

function onMenuClickWithRecord(payload: { key: string; domEvent?: Event }, record: Record<string, any>) {
  try {
    payload.domEvent?.stopPropagation?.();
    const key = payload.key;
    if (key === 'edit') return safeCall(record, '__onEdit');
    if (key === 'delete') return safeCall(record, '__onDelete');
  } catch (err) {
    console.error('onMenuClickWithRecord error', err);
    message.error('Action failed');
  }
}

function safeCall(record: Record<string, any>, fnName: string) {
  try {
    const fn = record?.[fnName];
    if (typeof fn === 'function') return fn(record);
    console.warn(`${fnName} is not a function on record`, record);
  } catch (e) {
    console.error('safeCall error', e);
  }
}

</script>

<style scoped>
.plan-version-page {
  /* max-width: 1200px; */
  margin: 12px auto;
}

.title {
  font-size: 18px;
  margin-bottom: 12px;
}

.mb16 {
  margin-bottom: 16px;
}
</style>
