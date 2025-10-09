<template>
  <router-view v-slot="{ route }">
    <div class="pricing-version-page">
      <h2 class="title">Pricing Versions for {{ planId }}</h2>

      <a-card class="mb16" :body-style="{ padding: '12px' }">
        <div style="display:flex; gap:12px; align-items:center; margin-bottom:8px;">
          <a-input-search v-model:value="q" placeholder="Search by PricingVersionId" @search="onSearch"
            style="width:360px" allowClear />
          <a-button type="primary" @click="openCreate">Create Pricing Version</a-button>
          <a-button danger :disabled="!selectedKeys.length" @click="onDeleteSelected">Delete Selected</a-button>
          <a-button :loading="loading" @click="load">Refresh</a-button>
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

      <a-modal v-model:open="modalVisible" :title="isEdit ? 'Edit Pricing Version' : 'Create Pricing Version'"
        @ok="handleSubmit" @cancel="handleCancel" :confirmLoading="submitting" :width="640" centered>
        <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
          <a-form-item label="Pricing Version Id" name="pricingVersionId"
            :rules="isEdit ? [] : [{ required: true, message: 'PricingVersionId required' }]">
            <a-input v-model:value="form.pricingVersionId" :disabled="isEdit" placeholder="e.g. PRC_2025_09" />
          </a-form-item>

          <a-form-item label="Effective From" name="effectiveFrom"
            :rules="[{ required: true, message: 'EffectiveFrom required' }]">
            <a-date-picker v-model:value="form.effectiveFrom" style="width:100%" />
          </a-form-item>

          <a-form-item label="Effective To" name="effectiveTo">
            <a-date-picker v-model:value="form.effectiveTo" style="width:100%" />
          </a-form-item>

          <a-form-item label="Status" name="status">
            <a-select v-model:value="form.status" placeholder="Select status">
              <a-select-option value="DRAFT">DRAFT</a-select-option>
              <a-select-option value="REVIEW">REVIEW</a-select-option>
              <a-select-option value="APPROVED">APPROVED</a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </a-modal>

    </div>
  </router-view>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { columns as baseColumns } from './constants';
import { PricingVersionApi } from '@/apis/pricingVersion';
import type { PricingVersionDto, CreatePricingVersionReq, UpdatePricingVersionReq } from '@/apis/types/pricingVersion';
import { TableRowSelection } from 'ant-design-vue/es/table/interface';
import { FormInstance, Rule } from 'ant-design-vue/es/form';
import { toDayjsIfDateLike, toIsoIfDateLike, toIsoIfDayjsLike } from '@/utils/dateUtil';
import cloneDeep from 'lodash-es/cloneDeep'; 

const props = defineProps<{ planId: string }>();
const planId = props.planId ?? '';

const q = ref('');
const loading = ref(false);
const submitting = ref(false);
const modalVisible = ref(false);
const isEdit = ref(false);
const editKey = ref<string | null>(null);

const page = ref(1);
const pageSize = ref(20);
const total = ref(0);

const items = ref<PricingVersionDto[]>([]);
const selectedKeys = ref<string[]>([]);

type FormModel = {
  pricingVersionId?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  status?: string | any;
};
const defaultForm: FormModel = { pricingVersionId: '', effectiveFrom: undefined, effectiveTo: undefined, status: 'DRAFT' };
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

const rowKey = (record: PricingVersionDto) => record.pricingVersionId;

const dataSource = computed(() =>
  items.value.map((r, idx) => ({
    ...r,
    index: (page.value - 1) * pageSize.value + idx + 1,
    __onEdit: onRowEdit,
    __onDelete: onRowDelete,
    __onView: onRowView,
  }))
);

const rowSelection = computed<TableRowSelection<PricingVersionDto>>(() => ({
  selectedRowKeys: selectedKeys.value,
  onChange: (keys: (string | number)[]) => {
    selectedKeys.value = (keys as string[]).slice();
  },
}));

const rules: Record<string, Rule | Rule[]> = {
  pricingVersionId: [{ required: true, message: 'PricingVersionId required', trigger: 'blur' }],
  effectiveFrom: [{ type: "object", required: true, message: 'EffectiveFrom required', trigger: 'change' }],
  effectiveTo: [{ type: "object", required: false, message: 'EffectiveTo required', trigger: 'change' }],
};

const load = async () => {
  loading.value = true;
  try {
    const resp = await PricingVersionApi.getAll(planId);
    items.value = (resp as any).data ?? resp ?? [];
    total.value = items.value.length;
  } catch (e) {
    console.error(e);
    message.error('Load pricing versions failed');
  } finally {
    loading.value = false;
  }
};

const onSearch = () => {
  page.value = 1;
  load();
};

const handleTableChange = (paginationEvent: any) => {
  if (paginationEvent) {
    page.value = paginationEvent.current || page.value;
    pageSize.value = paginationEvent.pageSize || pageSize.value;
  }
  load();
};

const openCreate = async () => {
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

async function onRowEdit(record: PricingVersionDto) {
  isEdit.value = true;
  editKey.value = record.pricingVersionId;
  try {
    const resp = await PricingVersionApi.getDetail(planId, record.pricingVersionId);
    const dto: PricingVersionDto = (resp as any).data ?? resp;
    Object.assign(form.value, {
      pricingVersionId: dto.pricingVersionId,
      effectiveFrom: dto.effectiveFrom ? toDayjsIfDateLike(dto.effectiveFrom) : undefined,
      effectiveTo: dto.effectiveTo ? toDayjsIfDateLike(dto.effectiveTo) : undefined,
      status: dto.status ?? 'DRAFT',
    });
    modalVisible.value = true;
    await nextTick();
    formRef.value?.clearValidate();
  } catch (e) {
    console.error(e);
    message.error('Load pricing version detail failed');
  }
}

async function onRowDelete(record: PricingVersionDto) {
  Modal.confirm({
    title: 'Delete pricing version',
    content: `Delete version ${record.pricingVersionId}?`,
    onOk: async () => {
      try {
        await PricingVersionApi.remove(planId, record.pricingVersionId);
        message.success('Deleted');
        selectedKeys.value = selectedKeys.value.filter((k) => k !== record.pricingVersionId);
        load();
      } catch (e) {
        console.error(e);
        message.error('Delete failed');
      }
    },
  });
}

function onRowView(record: PricingVersionDto) {
  // navigate to detail route or show modal – left as placeholder
  // router.push({ name: 'PlanVersionDetail', params: { planId, pricingVersionId: record.pricingVersionId } });
  message.info(`View ${record.pricingVersionId}`);
}

const onDeleteSelected = async () => {
  if (!selectedKeys.value.length) return;
  Modal.confirm({
    title: `Delete ${selectedKeys.value.length} version(s)`,
    content: `Are you sure to delete selected versions?`,
    onOk: async () => {
      try {
        for (const id of [...selectedKeys.value]) {
          await PricingVersionApi.remove(planId, id);
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

  const createPayload: CreatePricingVersionReq = {
    pricingVersionId: (form.value.pricingVersionId ?? '').trim(),
    effectiveFrom: toIsoIfDayjsLike(form.value.effectiveFrom) as any,
    effectiveTo: form.value.effectiveTo ? toIsoIfDayjsLike(form.value.effectiveTo) as any : null,
    createdBy: undefined,
  };

  const updatePayload: UpdatePricingVersionReq = {
    effectiveFrom: toIsoIfDayjsLike(form.value.effectiveFrom) as any,
    effectiveTo: form.value.effectiveTo ? toIsoIfDayjsLike(form.value.effectiveTo) as any : null,
    status: (form.value.status ?? 'DRAFT') as any,
  };

  submitting.value = true;
  try {
    if (isEdit.value && editKey.value) {
      await PricingVersionApi.update(planId, editKey.value, updatePayload);
      message.success('Updated');
    } else {
      await PricingVersionApi.create(planId, createPayload);
      message.success('Created');
    }
    modalVisible.value = false;
    selectedKeys.value = [];
    load();
  } catch (e: any) {
    console.error(e);
    message.error(String(e?.response?.data?.message ?? 'Save failed'));
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => {
  modalVisible.value = false;
};

onMounted(async () => {
  await load();
});

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
    { key: 'view', label: 'View', type: 'default', permission: true, enable: true, onClick: onRowView },
  ];
}

function onMenuClickWithRecord(payload: { key: string; domEvent?: Event }, record: Record<string, any>) {
  try {
    payload.domEvent?.stopPropagation?.();
    const key = payload.key;
    if (key === 'edit') return safeCall(record, '__onEdit');
    if (key === 'delete') return safeCall(record, '__onDelete');
    if (key === 'view') return safeCall(record, '__onView');
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
.pricing-version-page {
  /* max-width: 1000px; */
  margin: 12px auto;
}

.title {
  font-size: 18px;
  margin-bottom: 12px;
}

.mb16 {
  margin-bottom: 16px;
}

.pricing-version-action-menu {
  min-width: 140px;
}
</style>
