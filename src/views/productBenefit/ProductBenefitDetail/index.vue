<template>
    <router-view v-slot="{ route }">
        <div class="product-benefit-detail-page">
            <a-page-header :title="`Benefit ${benefitId}`" @back="goBack" style="margin-bottom:16px" />
            <a-card class="mb16">
                <a-descriptions bordered :column="2" size="small">
                    <a-descriptions-item label="Benefit Id">{{ detail?.benefitId ?? '-' }}</a-descriptions-item>
                    <a-descriptions-item label="Plan Id">{{ detail?.planId ?? '-' }}</a-descriptions-item>
                    <a-descriptions-item label="Benefit Code">{{ detail?.benefitCode ?? '-' }}</a-descriptions-item>
                    <a-descriptions-item label="Benefit Name">{{ detail?.benefitName ?? '-' }}</a-descriptions-item>
                    <a-descriptions-item label="Benefit Type">{{ detail?.benefitType ?? '-' }}</a-descriptions-item>
                    <a-descriptions-item label="Payable Event">{{ detail?.payableEvent ?? '-' }}</a-descriptions-item>
                    <a-descriptions-item label="Limit Amount">{{ detail?.limitAmount ?? '-' }}</a-descriptions-item>
                    <a-descriptions-item label="Calculation Basis">{{ detail?.calculationBasis ?? '-'
                        }}</a-descriptions-item>
                    <a-descriptions-item label="Notes" :span="2">{{ detail?.notes ?? '-' }}</a-descriptions-item>
                    <a-descriptions-item label="Created At" :span="2">{{ formatDate(detail?.createdAt)
                        }}</a-descriptions-item>
                </a-descriptions>
            </a-card>

            <a-card title="Scale Entries" class="mb16">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <div></div>
                    <div style="display:flex; gap:8px;">
                        <a-button type="primary" @click="openScaleEntryCreate">Create Entry</a-button>
                        <a-button :disabled="!selectedKeys.length" danger @click="onDeleteSelectedEntries">Delete
                            Selected</a-button>
                        <a-button :loading="loading" @click="loadDetail">Refresh</a-button>
                    </div>
                </div>

                <a-table :columns="scaleColumns" :dataSource="scaleDataSource" :rowKey="rowKey" :loading="loading"
                    :rowSelection="rowSelection" :pagination="false" :scroll="{ x: 1000 }">
                    <template #bodyCell="{ column, record }: any">
                        <template v-if="column.key === 'action'">
                            <a-space>
                                <a-button size="small" @click="() => onEditEntry(record)">Edit</a-button>
                                <a-popconfirm placement="bottom" title="Delete this entry?"
                                    @confirm="() => onDeleteEntry(record)">
                                    <a-button size="small" danger>Delete</a-button>
                                </a-popconfirm>
                            </a-space>
                        </template>

                        <template v-else>
                            <span>{{ record[column.dataIndex] }}</span>
                        </template>
                    </template>
                </a-table>
            </a-card>

            <a-modal v-model:open="entryModalVisible" :title="isEntryEdit ? 'Edit Scale Entry' : 'Create Scale Entry'"
                @ok="handleEntrySubmit" @cancel="closeEntryModal" :confirmLoading="entrySubmitting" :width="640"
                centered>
                <a-form ref="entryFormRef" :model="entryForm" :rules="entryRules" layout="vertical">
                    <a-form-item label="Scale Id" name="scaleId"
                        :rules="isEntryEdit ? [] : [{ required: true, message: 'ScaleId required' }]">
                        <a-input v-model:value="entryForm.scaleId" :disabled="isEntryEdit"
                            placeholder="Unique scale id" />
                    </a-form-item>

                    <a-form-item label="Seq No" name="seqNo" :rules="[{ required: true, message: 'SeqNo required' }]">
                        <a-input-number v-model:value="entryForm.seqNo" style="width:100%" />
                    </a-form-item>

                    <a-form-item label="Injury Code" name="injuryCode"
                        :rules="[{ required: true, message: 'Injury code required' }]">
                        <a-input v-model:value="entryForm.injuryCode" placeholder="Injury code" />
                    </a-form-item>

                    <a-form-item label="Injury Desc" name="injuryDesc">
                        <a-input v-model:value="entryForm.injuryDesc" placeholder="Description" />
                    </a-form-item>

                    <a-form-item label="Pay Pct" name="payPct">
                        <a-input-number v-model:value="entryForm.payPct" style="width:100%" min="0" max="100" />
                    </a-form-item>

                    <a-form-item label="Pay Amount" name="payAmount">
                        <a-input-number v-model:value="entryForm.payAmount" style="width:100%" />
                    </a-form-item>

                    <a-form-item label="Side" name="side" :rules="[{ required: true, message: 'Side required' }]">
                        <a-select v-model:value="entryForm.side" placeholder="Select side">
                            <a-select-option value="INSURED">INSURED</a-select-option>
                            <a-select-option value="COMPANY">COMPANY</a-select-option>
                        </a-select>
                    </a-form-item>

                    <a-form-item label="Effective From" name="effectiveFrom"
                        :rules="[{ required: true, message: 'EffectiveFrom required' }]">
                        <a-date-picker v-model:value="entryForm.effectiveFrom" style="width:100%" />
                    </a-form-item>

                    <a-form-item label="Effective To" name="effectiveTo">
                        <a-date-picker v-model:value="entryForm.effectiveTo" style="width:100%" />
                    </a-form-item>

                    <a-form-item label="Notes" name="notes">
                        <a-textarea v-model:value="entryForm.notes" :rows="3" />
                    </a-form-item>
                </a-form>
            </a-modal>
        </div>
    </router-view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';
import type { ColumnType } from 'ant-design-vue/es/table';
import { ProductBenefitApi } from '@/apis/productBenefit';
import { BenefitScaleEntryApi } from '@/apis/benefitScaleEntry';
import type { ProductBenefitDto } from '@/apis/types/productBenefit';
import type {
  BenefitScaleEntryDto,
  CreateBenefitScaleEntryReq,
  UpdateBenefitScaleEntryReq,
} from '@/apis/types/benefitScaleEntry';
import { FormInstance, Rule } from 'ant-design-vue/es/form';

// route params
const route = useRoute();
const router = useRouter();
const planId = String(route.params.planId ?? '');
const benefitId = String(route.params.benefitId ?? '');

// state
const loading = ref(false);
const detail = ref<ProductBenefitDto | null>(null);

const selectedKeys = ref<string[]>([]);

// scale entries modal state
const entryModalVisible = ref(false);
const isEntryEdit = ref(false);
const editingScaleId = ref<string | null>(null);
const entryFormRef = ref<FormInstance>();
const entrySubmitting = ref(false);

type EntryFormModel = {
  scaleId?: string;
  seqNo?: number;
  injuryCode?: string;
  injuryDesc?: string;
  payPct?: number;
  payAmount?: number;
  side?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  notes?: string;
};
const defaultEntryForm: EntryFormModel = {
  scaleId: '',
  seqNo: undefined,
  injuryCode: '',
  injuryDesc: '',
  payPct: undefined,
  payAmount: undefined,
  side: 'INSURED',
  effectiveFrom: undefined,
  effectiveTo: undefined,
  notes: '',
};
const entryForm = ref<EntryFormModel>({ ...defaultEntryForm });

const entryRules: Record<string, Rule | Rule[]> = {
  scaleId: [{ required: true, message: 'ScaleId required', trigger: 'blur' }],
  seqNo: [{ required: true, message: 'SeqNo required', trigger: 'change' }],
  injuryCode: [{ required: true, message: 'Injury code required', trigger: 'blur' }],
  side: [{ required: true, message: 'Side required', trigger: 'change' }],
  effectiveFrom: [{ type:'object', required: true, message: 'EffectiveFrom required', trigger: 'change' }],
  effectiveTo: [{ type:'object', required: false, message: 'EffectiveTo required', trigger: 'change' }],
};

// table columns
const scaleColumns = [
  { title: 'No', dataIndex: 'index', key: 'index', width: 80 },
  { title: 'Scale Id', dataIndex: 'scaleId', key: 'scaleId', width: 200 },
  { title: 'Seq No', dataIndex: 'seqNo', key: 'seqNo', width: 100 },
  { title: 'Injury Code', dataIndex: 'injuryCode', key: 'injuryCode', width: 200 },
  { title: 'Injury Desc', dataIndex: 'injuryDesc', key: 'injuryDesc', width: 200 },
  { title: 'Pay Pct', dataIndex: 'payPct', key: 'payPct', width: 100 },
  { title: 'Pay Amount', dataIndex: 'payAmount', key: 'payAmount', width: 150 },
  { title: 'Side', dataIndex: 'side', key: 'side', width: 120 },
  { title: 'Effective From', dataIndex: 'effectiveFrom', key: 'effectiveFrom', width: 160 },
  { title: 'Effective To', dataIndex: 'effectiveTo', key: 'effectiveTo', width: 160 },
  { title: 'Action', key: 'action', width: 160, fixed: 'right' },
] as ColumnType<BenefitScaleEntryDto & Record<string, any>>[];

const scaleDataSource = computed(() =>
  (detail.value?.benefitScaleEntries ?? []).map((e, i) => ({
    ...e,
    index: i + 1,
    effectiveFrom: e.effectiveFrom ? formatDate(e.effectiveFrom) : '-',
    effectiveTo: e.effectiveTo ? formatDate(e.effectiveTo) : '-',
  }))
);

const rowKey = (r: any) => r.scaleId ?? `${r.seqNo}-${r.injuryCode}-${r.payPct}`;
const rowSelection = computed(() => ({ selectedRowKeys: selectedKeys.value, onChange: (keys: any[]) => (selectedKeys.value = keys.slice()) }));

// helpers
function formatDate(v?: string | null) {
  if (!v) return '-';
  const d = dayjs(v);
  return d.isValid() ? d.format('YYYY-MM-DD') : String(v);
}

function toDayjsIfDateLike(v: string | Date | any) {
    if (v == null || v === '') return undefined;
    // if already dayjs-like
    if (v && typeof v === 'object' && typeof v.format === 'function') {
        return dayjs(v).isValid() ? v : undefined;
    }
    // Date instance
    if (v instanceof Date) {
        const d = dayjs(v);
        return d.isValid() ? d : undefined;
    }
    // numeric timestamp
    if (!Number.isNaN(Number(v))) {
        const d = dayjs(Number(v));
        return d.isValid() ? d : undefined;
    }
    // string parse
    const d = dayjs(String(v));
    return d.isValid() ? d : undefined;
}

function toIsoIfDayjsLike(v: any) {
  if (!v) return null;
  if (v && typeof v.toISOString === 'function') return v.toISOString();
  if (v && typeof v.format === 'function') return v.toISOString ? v.toISOString() : v.format();
  return String(v);
}

// load detail
async function loadDetail() {
  loading.value = true;
  try {
    const resp = await ProductBenefitApi.getDetail(planId, benefitId);
    detail.value = (resp as any).data ?? resp ?? null;
  } catch (err) {
    console.error(err);
    message.error('Failed to load benefit detail');
  } finally {
    loading.value = false;
  }
}

// navigation
function goBack() {
  router.back();
}

// scale entry actions
function openScaleEntryCreate() {
  isEntryEdit.value = false;
  editingScaleId.value = null;
  Object.assign(entryForm.value, JSON.parse(JSON.stringify(defaultEntryForm)));
  entryModalVisible.value = true;
  nextTick(() => {
    entryFormRef.value?.resetFields?.(JSON.parse(JSON.stringify(defaultEntryForm)));
    entryFormRef.value?.clearValidate?.();
  });
}

async function onEditEntry(entry: BenefitScaleEntryDto) {
  isEntryEdit.value = true;
  editingScaleId.value = entry.scaleId ?? null;
  Object.assign(entryForm.value, {
    scaleId: entry.scaleId ?? '',
    seqNo: entry.seqNo ?? null,
    injuryCode: entry.injuryCode ?? '',
    injuryDesc: entry.injuryDesc ?? '',
    payPct: entry.payPct ?? null,
    payAmount: entry.payAmount ?? null,
    side: entry.side ?? 'INSURED',
    effectiveFrom: entry.effectiveFrom ? toDayjsIfDateLike(entry.effectiveFrom) : undefined,
    effectiveTo: entry.effectiveTo ? toDayjsIfDateLike(entry.effectiveTo) : undefined,
    notes: entry.notes ?? '',
  });
  entryModalVisible.value = true;
  await nextTick();
//   entryFormRef.value?.resetFields?.();
  entryFormRef.value?.clearValidate?.();
}

async function onDeleteEntry(entry: BenefitScaleEntryDto) {
  Modal.confirm({
    title: 'Delete scale entry',
    content: `Delete scale entry ${entry.scaleId}?`,
    onOk: async () => {
      try {
        await BenefitScaleEntryApi.remove(planId, benefitId, String(entry.scaleId));
        message.success('Deleted entry');
        await loadDetail();
      } catch (err) {
        console.error(err);
        message.error('Delete entry failed');
      }
    },
  });
}

async function onDeleteSelectedEntries() {
  if (!selectedKeys.value.length) return;
  Modal.confirm({
    title: `Delete ${selectedKeys.value.length} entry(ies)`,
    content: 'Confirm delete selected entries?',
    onOk: async () => {
      try {
        for (const id of [...selectedKeys.value]) {
          await BenefitScaleEntryApi.remove(planId, benefitId, String(id));
        }
        message.success('Deleted selected entries');
        selectedKeys.value = [];
        await loadDetail();
      } catch (err) {
        console.error(err);
        message.error('Delete selected failed');
      }
    },
  });
}

async function handleEntrySubmit() {
  try {
    await entryFormRef.value?.validate?.();
  } catch {
    return;
  }

  entrySubmitting.value = true;
  try {
    const payloadCreate: CreateBenefitScaleEntryReq = {
      scaleId: (entryForm.value.scaleId ?? '').trim(),
      seqNo: Number(entryForm.value.seqNo ?? 0),
      injuryCode: (entryForm.value.injuryCode ?? '').trim(),
      injuryDesc: (entryForm.value.injuryDesc ?? '').trim(),
      payPct: entryForm.value.payPct ?? undefined,
      payAmount: entryForm.value.payAmount ?? undefined,
      side: entryForm.value.side ?? 'INSURED',
      effectiveFrom: toIsoIfDayjsLike(entryForm.value.effectiveFrom) as any,
      effectiveTo: entryForm.value.effectiveTo ? (toIsoIfDayjsLike(entryForm.value.effectiveTo) as any) : null,
      notes: entryForm.value.notes ?? undefined,
    };

    const payloadUpdate: UpdateBenefitScaleEntryReq = {
      seqNo: entryForm.value.seqNo ?? undefined,
      injuryCode: entryForm.value.injuryCode ?? undefined,
      injuryDesc: entryForm.value.injuryDesc ?? undefined,
      payPct: entryForm.value.payPct ?? undefined,
      payAmount: entryForm.value.payAmount ?? undefined,
      side: entryForm.value.side ?? undefined,
      effectiveFrom: entryForm.value.effectiveFrom ? (toIsoIfDayjsLike(entryForm.value.effectiveFrom) as any) : undefined,
      effectiveTo: entryForm.value.effectiveTo ? (toIsoIfDayjsLike(entryForm.value.effectiveTo) as any) : undefined,
      notes: entryForm.value.notes ?? undefined,
    };

    if (isEntryEdit.value && editingScaleId.value) {
      await BenefitScaleEntryApi.update(planId, benefitId, String(editingScaleId.value), payloadUpdate);
      message.success('Updated entry');
    } else {
      await BenefitScaleEntryApi.create(planId, benefitId, payloadCreate);
      message.success('Created entry');
    }

    entryModalVisible.value = false;
    await loadDetail();
  } catch (err) {
    console.error(err);
    message.error('Save entry failed');
  } finally {
    entrySubmitting.value = false;
  }
}

function closeEntryModal() {
  entryModalVisible.value = false;
}

onMounted(() => {
  loadDetail();
});
</script>

<style scoped>
.product-benefit-detail-page {
    /* max-width: 1100px; */
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
