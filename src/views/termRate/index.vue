<template>
    <div class="term-rate-page">
        <h2 class="title">Term Rates (Term Months)</h2>

        <a-card class="mb16" :body-style="{ padding: '12px' }">
            <!-- <div style="display:flex; gap:12px; align-items:center; margin-bottom:8px;">
                <a-input-search v-model:value="q" placeholder="Search by planId or pricingVersion" @search="onSearch"
                    style="width:360px" allowClear />
                <a-button type="primary" @click="openCreate">Create Rate</a-button>
                <a-button danger :disabled="!selectedKeys.length" @click="onDeleteSelected">Delete Selected</a-button>
                <a-button :loading="loading" @click="load">Refresh</a-button>
            </div> -->
            <div style="display:flex; gap:12px; align-items:center; margin-bottom:8px;">
                <!-- <a-input-search v-model:value="q" placeholder="Search by planId or pricingVersion" @search="onSearch"
                    style="width:360px" allowClear /> -->

                <a-select v-model:value="selectedPricingVersion" placeholder="Pricing Version" style="width:260px"
                    show-search allowClear :options="pricingVersionOptionsQuery" :loading="loadingPricingVersionsQuery"
                    @dropdownVisibleChange="onPricingVersionDropdownVisibleChangeQuery" @change="onFilterChange" />

                <a-select v-model:value="selectedPlanId" placeholder="Plan" style="width:260px" show-search allowClear
                    :options="planOptionsQuery" :loading="loadingPlansQuery"
                    @dropdownVisibleChange="onPlanDropdownVisibleChangeQuery" @change="onFilterChange" />

                <a-select v-model:value="filterMode" placeholder="Mode" style="width:140px" allowClear>
                    <a-select-option value="MONTHLY">MONTHLY</a-select-option>
                    <a-select-option value="ONE_TIME">ONE_TIME</a-select-option>
                </a-select>

                <a-select v-model:value="filterSex" placeholder="Sex" style="width:100px" allowClear>
                    <a-select-option value="M">M</a-select-option>
                    <a-select-option value="F">F</a-select-option>
                </a-select>

                <a-select v-model:value="filterSmoker" placeholder="Smoker" style="width:120px" allowClear>
                    <a-select-option :value="''">All</a-select-option>
                    <a-select-option :value="true">Smoker</a-select-option>
                    <a-select-option :value="false">Non-Smoker</a-select-option>
                </a-select>

                <a-button type="primary" @click="openCreate">Create Rate</a-button>
                <a-button danger :disabled="!selectedKeys.length" @click="onDeleteSelected">Delete Selected</a-button>
                <a-button :loading="loading" @click="load">Refresh</a-button>
                <a-button type="primary" @click="() => router.push({ name: 'TermRateSeed' })">Create seeder</a-button>
                <a-button :loading="gridLoading" @click="loadGridPreview ">Load Grid Preview</a-button>

                <!-- inside the toolbar template block -->
                <a-popconfirm title="Xóa toàn bộ term rate cho Pricing Version / Plan đang chọn?" ok-text="Yes"
                    cancel-text="No" @confirm="confirmClear">
                    <a-button danger :disabled="!selectedPricingVersion && !selectedPlanId" :loading="clearing">Clear</a-button>
                </a-popconfirm>
            </div>


            <a-table :columns="tableColumns" :dataSource="dataSource" :loading="loading" :pagination="pagination"
                :rowKey="rowKey" :rowSelection="rowSelection" :scroll="{ x: 1400, y: 500 }" @change="handleTableChange">
                <template #bodyCell="{ column, record }: any">
                    <template v-if="column.key === 'action'">
                        <a-space style="justify-content:flex-end; width:100%;">
                            <a-button size="small" @click="() => onRowEdit(record)">Edit</a-button>
                            <a-popconfirm placement="bottom" title="Delete this rate?"
                                @confirm="() => onRowDelete(record)">
                                <a-button size="small" danger>Delete</a-button>
                            </a-popconfirm>
                        </a-space>
                    </template>
                    <template v-else>
                        <span v-if="column.dataIndex === 'ratePer1000'">
                            {{ formatRatePer1000(record[column.dataIndex]) }}
                        </span>
                        <span v-else>
                            {{ record[column.dataIndex] }}
                        </span>
                    </template>
                </template>
            </a-table>
        </a-card>

        <!-- Monthly grid -->
        <a-card :title="titleGridPreview" class="mb16" v-if="filterMode == 'MONTHLY'">
            <div style="overflow:auto; border:1px solid #f0f0f0; padding:8px; border-radius:4px;">
                <a-table :columns="monthlyGridColumns" :dataSource="monthlyGridRows" :rowKey="r => `age-${r.age}`"
                    :pagination="false" bordered size="small" :loading="gridLoading"
                    :scroll="{ x: monthlyGridScrollX, y: 500 }">
                    <template #bodyCell="{ column, record }: any">
                        <template v-if="column.key === 'age'">
                            <strong>{{ record.age }}</strong>
                        </template>
                        <template v-else>
                            <div style="display:flex; justify-content:flex-end; gap:8px; align-items:center;">
                                <span v-if="record.values[column.key] != null">{{
                                    formatRatePer1000(record.values[column.key].ratePer1000) }}</span>
                                <span v-else class="text-muted">-</span>
                                <a-button type="link" size="small"
                                    @click="openGridCellEditor(record.age, column.key, 'MONTHLY')">Edit</a-button>
                            </div>
                        </template>
                    </template>
                </a-table>
            </div>
        </a-card>

        <!-- One-time grid -->
        <a-card :title="titleGridPreview" class="mb16" v-if="filterMode == 'ONE_TIME'">
            <div style="overflow:auto; border:1px solid #f0f0f0; padding:8px; border-radius:4px;">
                <a-table :columns="oneTimeGridColumns" :dataSource="oneTimeGridRows" :rowKey="r => `age-${r.age}`"
                    :pagination="false" bordered size="small" :loading="gridLoading"
                    :scroll="{ x: oneTimeGridScrollX, y: 500 }">
                    <template #bodyCell="{ column, record }: any">
                        <template v-if="column.key === 'age'">
                            <strong>{{ record.age }}</strong>
                        </template>
                        <template v-else>
                            <div style="display:flex; justify-content:flex-end; gap:8px; align-items:center;">
                                <span v-if="record.values[column.key] != null">{{
                                    formatRatePer1000(record.values[column.key].ratePer1000) }}</span>
                                <span v-else class="text-muted">-</span>
                                <a-button type="link" size="small"
                                    @click="openGridCellEditor(record.age, column.key, 'ONE_TIME')">Edit</a-button>
                            </div>
                        </template>
                    </template>
                </a-table>
            </div>
        </a-card>

        <!-- Reuse the existing cell edit modal (or add one if not present) -->
        <a-modal v-model:open="gridCellModalVisible" :title="gridCellModalTitle" @ok="submitGridCellEdit"
            @cancel="gridCellModalVisible = false" :confirmLoading="gridCellSubmitting">
            <a-form layout="vertical">
                <a-form-item label="Rate per 1000">
                    <a-input-number v-model:value="gridCellForm.ratePer1000" style="width:100%" :step="0.01" />
                </a-form-item>
                <a-form-item label="TermYearsFactor">
                    <a-input-number v-model:value="gridCellForm.termYearsFactor" style="width:100%" :step="0.01" />
                </a-form-item>
            </a-form>
        </a-modal>


        <a-modal v-model:open="modalVisible" :title="isEdit ? 'Edit Term Rate' : 'Create Term Rate'" @ok="handleSubmit"
            @cancel="handleCancel" :confirmLoading="submitting" width="760" centered>
            <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
                <!-- <a-row :gutter="12">
                    <a-col :span="12">
                        <a-form-item label="Pricing Version Id" name="pricingVersionId"
                            :rules="isEdit ? [] : [{ required: true, message: 'PricingVersionId required' }]">
                            <a-input v-model:value="form.pricingVersionId" :disabled="isEdit"
                                placeholder="Pricing version id" />
                        </a-form-item>
                    </a-col>

                    <a-col :span="12">
                        <a-form-item label="Plan Id" name="planId"
                            :rules="isEdit ? [] : [{ required: true, message: 'PlanId required' }]">
                            <a-input v-model:value="form.planId" :disabled="isEdit" placeholder="Plan id" />
                        </a-form-item>
                    </a-col>
                </a-row> -->

                <a-row :gutter="12">

                    <a-col :span="12">
                        <a-form-item label="Plan Id" name="planId"
                            :rules="isEdit ? [] : [{ required: true, message: 'PlanId required' }]">
                            <a-select v-model:value="form.planId" placeholder="Select plan" :loading="loadingPlans"
                                :options="planOptions" show-search allowClear
                                @dropdownVisibleChange="onPlanDropdownVisibleChange" />
                        </a-form-item>
                    </a-col>

                    <a-col :span="12">
                        <a-form-item label="Pricing Version Id" name="pricingVersionId"
                            :rules="isEdit ? [] : [{ required: true, message: 'PricingVersionId required' }]">
                            <a-select v-model:value="form.pricingVersionId" placeholder="Select pricing version"
                                :loading="loadingPricingVersions" :options="pricingVersionOptions" show-search
                                allowClear @dropdownVisibleChange="onPricingVersionDropdownVisibleChange"
                                :disabled="!form.planId" />
                        </a-form-item>
                    </a-col>
                </a-row>


                <a-row :gutter="12">
                    <a-col :span="8">
                        <a-form-item label="Age" name="age" :rules="[{ required: true, message: 'Age required' }]">
                            <a-input-number v-model:value="form.age" style="width:100%" min="0" />
                        </a-form-item>
                    </a-col>

                    <a-col :span="8">
                        <a-form-item label="Sex" name="sex" :rules="[{ required: true, message: 'Sex required' }]">
                            <a-select v-model:value="form.sex" placeholder="Sex">
                                <a-select-option value="M">M</a-select-option>
                                <a-select-option value="F">F</a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>

                    <a-col :span="8">
                        <a-form-item label="Smoker" name="smoker">
                            <a-switch v-model:checked="form.smoker" />
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-row :gutter="12">
                    <a-col :span="8">
                        <a-form-item label="Term Months" name="termMonths"
                            :rules="[{ required: true, message: 'TermMonths required' }]">
                            <a-input-number v-model:value="form.termMonths" style="width:100%" min="1" />
                        </a-form-item>
                    </a-col>

                    <a-col :span="8">
                        <a-form-item label="Mode" name="mode">
                            <a-select v-model:value="form.mode" placeholder="Mode">
                                <a-select-option value="MONTHLY">MONTHLY</a-select-option>
                                <a-select-option value="ONE_TIME">ONE_TIME</a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>

                    <a-col :span="8">
                        <a-form-item label="Is One Time" name="isOneTime">
                            <a-switch v-model:checked="form.isOneTime" />
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-row :gutter="12">
                    <a-col :span="12">
                        <a-form-item label="Rate per 1000" name="ratePer1000"
                            :rules="[{ required: true, message: 'Rate required' }]">
                            <a-input-number v-model:value="form.ratePer1000" style="width:100%" :step="0.0001" />
                        </a-form-item>
                    </a-col>

                    <a-col :span="12">
                        <a-form-item label="Term Years Factor" name="termYearsFactor">
                            <a-input-number v-model:value="form.termYearsFactor" style="width:100%" :step="0.01" />
                        </a-form-item>
                    </a-col>
                </a-row>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import type { ColumnType } from 'ant-design-vue/es/table';
import { termRateColumns as baseColumns } from './constants';
import { TermRateApi } from '@/apis/termRate';
import { PricingVersionApi } from '@/apis/pricingVersion';
import { ProductPlanApi } from '@/apis/productPlan';
import type {
    TermRateListDto,
    CreateTermRateReq,
    UpdateTermRateReq,
    TermRateQuery,
} from '@/apis/types/termRate';
import { FormInstance, Rule } from 'ant-design-vue/es/form';
const clearing = ref(false);
const router = useRouter();
// reactive state for selects
const pricingVersionOptions = ref<{ label: string; value: string }[]>([]);
const planOptions = ref<{ label: string; value: string }[]>([]);

const loadingPricingVersions = ref(false);
const loadingPlans = ref(false);

// props (optional, if plan/pricing filter passed via route)
const props = defineProps<{ pricingVersionId?: string; planId?: string }>();
const pricingVersionFilter = props.pricingVersionId ?? '';
const planFilter = props.planId ?? '';

const q = ref('');
const loading = ref(false);
const submitting = ref(false);
const modalVisible = ref(false);
const isEdit = ref(false);
const editKey = ref<string | null>(null);

const page = ref(1);
const pageSize = ref(20);
const total = ref(0);

const items = ref<TermRateListDto[]>([]);
const selectedKeys = ref<string[]>([]);

function formatRatePer1000(val: unknown) {
    const n = Number(val ?? 0);
    if (!isFinite(n)) return '-';
    return (n / 1000).toFixed(5);
}

type FormModel = {
    pricingVersionId?: string;
    planId?: string;
    age?: number;
    sex?: string;
    smoker?: boolean;
    termMonths?: number;
    mode?: string;
    isOneTime?: boolean;
    ratePer1000?: number;
    termYearsFactor?: number;
    ageRange?: [number, number];
};
const defaultForm: FormModel = {
    pricingVersionId: '',
    planId: '',
    age: undefined,
    sex: 'M',
    smoker: false,
    termMonths: 12,
    mode: 'MONTHLY',
    isOneTime: false,
    ratePer1000: 0,
    termYearsFactor: 1.0,
    ageRange: [20, 30] as [number, number],
};
const form = ref<FormModel>({ ...defaultForm });
const formRef = ref<FormInstance>();

// mới: select state
const selectedPricingVersion = ref<string | undefined>(pricingVersionFilter || undefined);
const selectedPlanId = ref<string | undefined>(planFilter || undefined);

// reactive filter values (add near other refs)
const filterMode = ref<string | undefined>(undefined);
const filterSex = ref<string | undefined>(undefined);
const filterSmoker = ref<boolean | string | undefined | any>(undefined);

const titleGridPreview = computed(() => `Grid Preview - ${filterMode.value?.toUpperCase()} (ages rows x term-month columns) ${filterSex.value === '' || filterSex.value == undefined ? '' : `- Sex: ${filterSex.value}`} ${filterSmoker.value === undefined || filterSmoker.value === '' ? '' : filterSmoker.value == true ? ', Smocker' : ', NonSmocker'}`);

// options + loading flags (nếu chưa có)
const pricingVersionOptionsQuery = ref<{ label: string; value: string }[]>([]);
const planOptionsQuery = ref<{ label: string; value: string }[]>([]);
const loadingPricingVersionsQuery = ref(false);
const loadingPlansQuery = ref(false);

// load options (reuse existing functions or add these)
async function loadPricingVersionsQuery() {
if (!selectedPlanId.value) return;
  loadingPricingVersionsQuery.value = true;
  try {
    const resp = await PricingVersionApi.getAll(selectedPlanId.value ?? "");
    const data = (resp as any).data ?? resp ?? [];
    const list = Array.isArray(data) ? data : (data.items ?? data.Items ?? []);
    pricingVersionOptionsQuery.value = (list ?? []).map((p: any) => ({ label: p.pricingVersionId ?? p.name ?? p.title ?? p.id, value: p.pricingVersionId ?? p.id }));
  } catch (err) {
    console.error(err);
  } finally {
    loadingPricingVersionsQuery.value = false;
  }
}

async function loadPlansQuery() {
  loadingPlansQuery.value = true;
  try {
    const resp = await ProductPlanApi.getAll({ page: 1, pageSize: 500 });
    const data = (resp as any).data ?? resp ?? [];
    const list = Array.isArray(data) ? data : (data.items ?? data.Items ?? []);
    planOptionsQuery.value = (list ?? []).map((p: any) => ({ label: p.planId ?? p.planCode ?? p.name, value: p.planId ?? p.id }));
  } catch (err) {
    console.error(err);
  } finally {
    loadingPlansQuery.value = false;
  }
}

// gọi khi dropdown mở
function onPricingVersionDropdownVisibleChangeQuery(open: boolean) {
  if (open) loadPricingVersionsQuery();
}
function onPlanDropdownVisibleChangeQuery(open: boolean) {
  if (open) loadPlansQuery();
}

// table wiring
const tableColumns = baseColumns as ColumnType[];
const pagination = computed(() => ({ current: page.value, pageSize: pageSize.value, total: total.value, showSizeChanger: true, showQuickJumper: true }));
const rowKey = (r: TermRateListDto) =>
    `${r.pricingVersionId}::${r.planId}::${r.age}::${r.sex}::${r.smoker}::${r.termMonths}::${r.mode}`;

const dataSource = computed(() =>
    items.value.map((r, idx) => ({
        ...r,
        index: (page.value - 1) * pageSize.value + idx + 1,
    }))
);

const rowSelection = computed(() => ({ selectedRowKeys: selectedKeys.value, onChange: (keys: (string | number)[]) => { selectedKeys.value = (keys as string[]).slice(); } }));

const rules: Record<string, Rule | Rule[]> = {
    pricingVersionId: [{ required: true, message: 'PricingVersionId required', trigger: 'blur' }],
    planId: [{ required: true, message: 'PlanId required', trigger: 'blur' }],
    age: [{ required: true, message: 'Age required', trigger: 'change' }],
    termMonths: [{ required: true, message: 'TermMonths required', trigger: 'change' }],
    ratePer1000: [{ required: true, message: 'Rate required', trigger: 'change' }],
};

// load list (uses PagedResult wrapper)
async function load() {
    loading.value = true;
    try {
        // include filters when building query params in load()
        const qparams = {
            //@ts-ignore
            pricingVersionId: selectedPricingVersion.value || pricingVersionFilter || undefined,
            //@ts-ignore
            planId: selectedPlanId.value || planFilter || undefined,
            //q: undefined, // không dùng search string nữa
            mode: filterMode.value || undefined,
            sex: filterSex.value || undefined,
            smoker:
                filterSmoker.value === undefined || filterSmoker.value === ''
                    ? undefined
                    : filterSmoker.value === 'true' || filterSmoker.value === true
                        ? true
                        : false,
            page: page.value,
            pageSize: pageSize.value,
        };

        // const qparams = {
        //     pricingVersionId: pricingVersionFilter || undefined,
        //     planId: planFilter || undefined,
        //     q: q.value || undefined,
        //     page: page.value,
        //     pageSize: pageSize.value,
        // };
        const resp = await TermRateApi.query(qparams);
        const data = (resp as any).data ?? resp ?? null;
        if (data) {
            // assume data is PagedResult<TermRateListDto>
            items.value = Array.from((data.items ?? data.Items) ?? []);
            total.value = (data.totalItems ?? data.TotalItems) ?? items.value.length;
            page.value = (data.page ?? data.Page) ?? page.value;
            pageSize.value = (data.pageSize ?? data.PageSize) ?? pageSize.value;
        } else {
            items.value = [];
            total.value = 0;
        }
    } catch (e) {
        console.error(e);
        message.error('Load term rates failed');
    } finally {
        loading.value = false;
    }
}

const onSearch = () => { page.value = 1; load(); };

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
    Object.assign(form.value, JSON.parse(JSON.stringify(defaultForm)));
    // prefill optional filters
    if (pricingVersionFilter) form.value.pricingVersionId = pricingVersionFilter;
    if (planFilter) form.value.planId = planFilter;
    modalVisible.value = true;
    await nextTick();
    formRef.value?.resetFields?.(JSON.parse(JSON.stringify(defaultForm)));
    formRef.value?.clearValidate?.();
};

async function onRowEdit(record: TermRateListDto) {
    isEdit.value = true;
    editKey.value = rowKey(record);
    try {
        // fetch detail by composite key - TermRateApi.getDetail should accept the full key object
        const resp = await TermRateApi.getDetail({
            pricingVersionId: record.pricingVersionId,
            planId: record.planId,
            age: record.age,
            sex: record.sex,
            smoker: record.smoker,
            termMonths: record.termMonths,
            mode: record.mode,
        });
        const dto = (resp as any).data ?? resp;
        Object.assign(form.value, {
            pricingVersionId: dto.pricingVersionId,
            planId: dto.planId,
            age: dto.age,
            sex: dto.sex,
            smoker: dto.smoker,
            termMonths: dto.termMonths,
            mode: dto.mode,
            isOneTime: dto.isOneTime,
            ratePer1000: Number(dto.ratePer1000 ?? 0),
            termYearsFactor: Number(dto.termYearsFactor ?? 1.0),
        });
        modalVisible.value = true;
        await nextTick();
        // formRef.value?.resetFields?.();
        formRef.value?.clearValidate?.();
    } catch (e) {
        console.error(e);
        message.error('Load term rate detail failed');
    }
}

async function onRowDelete(record: TermRateListDto) {
    Modal.confirm({
        title: 'Delete term rate',
        content: `Delete rate for ${record.planId} age ${record.age} term ${record.termMonths} months?`,
        onOk: async () => {
            try {
                await TermRateApi.remove({
                    pricingVersionId: record.pricingVersionId,
                    planId: record.planId,
                    age: record.age,
                    sex: record.sex,
                    smoker: record.smoker,
                    termMonths: record.termMonths,
                    mode: record.mode,
                });
                message.success('Deleted');
                selectedKeys.value = selectedKeys.value.filter((k) => k !== rowKey(record));
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
        title: `Delete ${selectedKeys.value.length} term rate(s)`,
        content: `Are you sure to delete selected rates?`,
        onOk: async () => {
            try {
                // each selected key is composite string; parse back or maintain selected records instead
                for (const key of [...selectedKeys.value]) {
                    // find record by composite key
                    const rec = items.value.find(r => `${r.pricingVersionId}::${r.planId}::${r.age}::${r.sex}::${r.smoker}::${r.termMonths}::${r.mode}` === key);
                    if (!rec) continue;
                    await TermRateApi.remove({
                        pricingVersionId: rec.pricingVersionId,
                        planId: rec.planId,
                        age: rec.age,
                        sex: rec.sex,
                        smoker: rec.smoker,
                        termMonths: rec.termMonths,
                        mode: rec.mode,
                    });
                }
                message.success('Deleted selected');
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

    const createPayload: CreateTermRateReq = {
        pricingVersionId: (form.value.pricingVersionId ?? '').trim(),
        planId: (form.value.planId ?? '').trim(),
        age: Number(form.value.age ?? 0),
        sex: (form.value.sex ?? 'M'),
        smoker: Boolean(form.value.smoker ?? false),
        termMonths: Number(form.value.termMonths ?? 0),
        mode: form.value.mode ?? 'MONTHLY',
        isOneTime: Boolean(form.value.isOneTime ?? false),
        ratePer1000: Number(form.value.ratePer1000 ?? 0),
        termYearsFactor: Number(form.value.termYearsFactor ?? 1.0),
    };

    const updatePayload: UpdateTermRateReq = {
        ratePer1000: Number(form.value.ratePer1000 ?? 0),
        termYearsFactor: Number(form.value.termYearsFactor ?? 1.0),
        mode: form.value.mode ?? undefined,
        isOneTime: form.value.isOneTime ?? undefined,
    };

    submitting.value = true;
    try {
        if (isEdit.value && editKey.value) {
            await TermRateApi.update({
                pricingVersionId: form.value.pricingVersionId ?? '',
                planId: form.value.planId ?? '',
                age: Number(form.value.age ?? 0),
                sex: form.value.sex ?? 'M',
                smoker: Boolean(form.value.smoker ?? false),
                termMonths: Number(form.value.termMonths ?? 0),
                mode: form.value.mode ?? 'MONTHLY',
            }, updatePayload);
            message.success('Updated');
        } else {
            await TermRateApi.create(createPayload);
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

async function loadPricingVersions() {
    if (!form.value?.planId) return;
    loadingPricingVersions.value = true;
    try {
        // adjust params if your API expects filters (e.g., planId)
        const resp = await PricingVersionApi.getAll(form.value?.planId ?? "");
        const data = (resp as any).data ?? resp ?? [];
        // map to options { label, value }
        const list = Array.isArray(data) ? data : (data.items ?? data.Items ?? []);
        pricingVersionOptions.value = (list ?? []).map((p: any) => ({
            label: String(p.pricingVersionId ?? p.name ?? p.title ?? p.id ?? p.pricingVersionId),
            value: String(p.pricingVersionId ?? p.id ?? p.pricingVersionId),
        }));
    } catch (err) {
        console.error('loadPricingVersions', err);
        message.error('Failed to load pricing versions');
    } finally {
        loadingPricingVersions.value = false;
    }
}

async function loadPlans() {
    loadingPlans.value = true;
    try {
        const resp = await ProductPlanApi.getAll({ page: 1, pageSize: 200 });
        const data = (resp as any).data ?? resp ?? [];
        const list = Array.isArray(data) ? data : (data.items ?? data.Items ?? []);
        planOptions.value = (list ?? []).map((p: any) => ({
            label: String(p.planId ?? p.planCode ?? p.name ?? p.title ?? p.planId),
            value: String(p.planId ?? p.id ?? p.planId),
        }));
    } catch (err) {
        console.error('loadPlans', err);
        message.error('Failed to load plans');
    } finally {
        loadingPlans.value = false;
    }
}

function onPricingVersionDropdownVisibleChange(open: boolean) {
    if (open) {
        // mỗi lần mở dropdown sẽ gọi API
        loadPricingVersions();
    }
}

function onPlanDropdownVisibleChange(open: boolean) {
    if (open) {
        loadPlans();
    }
}


// reset page when a filter changes and reload
async function onFilterChange() {
    page.value = 1;
    await load();
}


// preview grid
// term sets (sử dụng các mảng bạn đã có)
const periodicTermsMonths = [12, 24, 36, 48, 60, 72, 84, 96, 108, 120];
const onetimeTermsMonths = [3, 6, 9, 12, 18, 24, 36, 48, 60, 72, 84, 96, 108, 120];

// grid ages (có thể lấy từ seedForm.ageRange hoặc mặc định 20..30)
const gridAgeFrom = computed(() => form?.value?.ageRange?.[0] ?? 20);
const gridAgeTo = computed(() => form?.value?.ageRange?.[1] ?? 30);
const gridAges = computed(() => {
  const from = Number(gridAgeFrom.value ?? 20);
  const to = Number(gridAgeTo.value ?? 30);
  const a0 = Math.max(0, Math.min(from, to));
  const a1 = Math.max(0, Math.max(from, to));
  return Array.from({ length: a1 - a0 + 1 }, (_, i) => a0 + i);
});

// loading state
const gridLoading = ref(false);

// build columns for monthly and one-time
const monthlyGridColumns = computed(() => {
  const cols: any[] = [{ title: 'Age', dataIndex: 'age', key: 'age', fixed: 'left', width: 80 }];
  periodicTermsMonths.forEach((m) => cols.push({ title: `${m}m`, dataIndex: `M_${m}`, key: `M_${m}`, width: 110 }));
  return cols;
});
const oneTimeGridColumns = computed(() => {
  const cols: any[] = [{ title: 'Age', dataIndex: 'age', key: 'age', fixed: 'left', width: 80 }];
  onetimeTermsMonths.forEach((m) => cols.push({ title: `${m}m`, dataIndex: `O_${m}`, key: `O_${m}`, width: 110 }));
  return cols;
});

const monthlyGridScrollX = computed(() => Math.max(800, 1 + periodicTermsMonths.length * 110));
const oneTimeGridScrollX = computed(() => Math.max(900, 1 + onetimeTermsMonths.length * 110));

// grid rows state
const monthlyGridRows = ref<Array<{ age: number; values: Record<string, any> }>>([]);
const oneTimeGridRows = ref<Array<{ age: number; values: Record<string, any> }>>([]);

function makeEmptyGridRows(agesList: number[], keys: string[]) {
  return agesList.map((a) => {
    const values: Record<string, any> = {};
    keys.forEach((k) => (values[k] = null));
    return { age: a, values };
  });
}

// Assumes existing reactive state from views/termRate/index.vue:
// - items.value  (array from load())
// - page, pageSize, loading, load() already implemented and fills items.value
// - periodicTermsMonths, onetimeTermsMonths, gridAges, monthlyGridRows, oneTimeGridRows, gridLoading

async function loadGridPreview() {
  // require pricingVersion and plan context (same checks as load)
  const pv = selectedPricingVersion.value || pricingVersionFilter || null;
  const plan = selectedPlanId.value || planFilter || null;
  if (!pv || !plan) {
    message.warn('Chọn Pricing Version và Plan để xem grid preview');
    return;
  }

  gridLoading.value = true;
  try {
    // Ensure the main list is loaded with current filters
    // load() will populate items.value; pass through current filters via selectedPricingVersion/selectedPlanId/filterMode/etc.
    // await load();

    // items.value should now contain the dataSource used by the main table (possibly paged)
    // If load() returns paged results and not all rows are present, request a larger page to fetch all relevant rows:
    // Optionally: if items.value length is low, do a full fetch
    let rows: any[] = Array.isArray(items.value) ? items.value : [];

    // If current load fetched a page, and you want the full set for grid, fetch with large pageSize
    if (rows.length > 0 && (rows.length <  (gridAges.value.length * (periodicTermsMonths.length + onetimeTermsMonths.length)) )) {
      // try to fetch all matching rows from server (pageSize big)
      try {
        const respAll = await TermRateApi.query({
          pricingVersionId: pv,
          planId: plan,
          mode: filterMode.value || undefined,
          sex: filterSex.value || undefined,
          smoker:
            filterSmoker.value === undefined || filterSmoker.value === ''
              ? undefined
              : filterSmoker.value === 'true' || filterSmoker.value === true
              ? true
              : false,
          page: 1,
          pageSize: 5000,
        });
        const dataAll = (respAll as any).data ?? respAll ?? {};
        rows = Array.isArray(dataAll.items ?? dataAll) ? (dataAll.items ?? dataAll) : [];
      } catch (e) {
        // fallback to previously loaded items
        console.warn('fallback to loaded items for grid preview', e);
      }
    }

    // prepare empty grids
    const monthlyKeys = periodicTermsMonths.map(m => `M_${m}`);
    const oneTimeKeys = onetimeTermsMonths.map(m => `O_${m}`);
    monthlyGridRows.value = makeEmptyGridRows(gridAges.value, monthlyKeys);
    oneTimeGridRows.value = makeEmptyGridRows(gridAges.value, oneTimeKeys);

    // map rows into grid structures (rows may include both MONTHLY and ONE_TIME)
    for (const it of rows) {
      const age = Number(it.age);
      const modePrefix = it.mode === 'ONE_TIME' ? 'O' : 'M';
      const key = `${modePrefix}_${it.termMonths}`;
      if (modePrefix === 'M') {
        const row = monthlyGridRows.value.find(r => r.age === age);
        if (row && key in row.values) row.values[key] = it;
      } else {
        const row = oneTimeGridRows.value.find(r => r.age === age);
        if (row && key in row.values) row.values[key] = it;
      }
    }
  } catch (err) {
    console.error(err);
    message.error('Load grid preview thất bại');
  } finally {
    gridLoading.value = false;
  }
}

// helper opener for cell editor; reuse submit logic similar to earlier cell editor
const gridCellModalVisible = ref(false);
const gridCellForm = ref({ ratePer1000: 0, termYearsFactor: 1.0 });
const gridCellAge = ref<number | null>(null);
const gridCellKey = ref<string | null>(null);
const gridCellMode = ref<'MONTHLY'|'ONE_TIME' | null>(null);
const gridCellSubmitting = ref(false);

const gridCellModalTitle = computed(() => {
  if (gridCellAge.value == null || !gridCellKey.value || !gridCellMode.value) return 'Edit cell';
  const [, m] = gridCellKey.value.split('_');
  return `Edit - Age ${gridCellAge.value} - ${m} months ${gridCellMode.value}`;
});

function openGridCellEditor(age: number, colKey: string, forcedMode: 'MONTHLY'|'ONE_TIME') {
  gridCellAge.value = age;
  gridCellKey.value = colKey;
  gridCellMode.value = forcedMode;
  // load existing value
  const row = (forcedMode === 'MONTHLY' ? monthlyGridRows.value : oneTimeGridRows.value).find(r => r.age === age);
  const existing = row?.values?.[colKey];
  gridCellForm.value.ratePer1000 = existing?.ratePer1000 ?? 0;
  gridCellForm.value.termYearsFactor = existing?.termYearsFactor ?? 1.0;
  gridCellModalVisible.value = true;
}

async function submitGridCellEdit() {
  if (gridCellAge.value == null || !gridCellKey.value || !gridCellMode.value) {
    message.warn('Missing context for cell');
    return;
  }
  gridCellSubmitting.value = true;
  try {
    const [, m] = gridCellKey.value.split('_');
    const termMonths = Number(m);
    const payload = {
      pricingVersionId: selectedPricingVersion.value|| pricingVersionFilter || '',
      planId: selectedPlanId.value || planFilter || '',
      age: gridCellAge.value,
      sex: filterSex.value ?? 'M',
      smoker: filterSmoker.value ?? false,
      termMonths,
      mode: gridCellMode.value,
      isOneTime: gridCellMode.value === 'ONE_TIME',
      ratePer1000: Number(gridCellForm.value.ratePer1000),
      termYearsFactor: Number(gridCellForm.value.termYearsFactor),
    };

    // check existing in grid to decide create or update
    const targetRow = (gridCellMode.value === 'MONTHLY' ? monthlyGridRows.value : oneTimeGridRows.value).find(r => r.age === gridCellAge.value);
    const existing = targetRow?.values?.[gridCellKey.value];

    if (existing) {
      await TermRateApi.update({
        pricingVersionId: payload.pricingVersionId,
        planId: payload.planId,
        age: payload.age,
        sex: payload.sex,
        smoker: payload.smoker,
        termMonths: payload.termMonths,
        mode: payload.mode,
      }, { ratePer1000: payload.ratePer1000, termYearsFactor: payload.termYearsFactor, isOneTime: payload.isOneTime });
      message.success('Updated');
    } else {
      await TermRateApi.create(payload);
      message.success('Created');
    }

    // reload grid cell (or whole grid)
    await loadGridPreview();
    gridCellModalVisible.value = false;
  } catch (err) {
    console.error(err);
    message.error('Save failed');
  } finally {
    gridCellSubmitting.value = false;
  }
}

// expose a small API to load grid when needed
// call loadGridPreview() from existing load or preview generation flows
async function confirmClear() {
  // require at least one filter to avoid accidental full clear
  if (!selectedPricingVersion.value && !selectedPlanId.value) {
    message.warn('Chọn Pricing Version hoặc Plan để xóa dữ liệu');
    return;
  }

  clearing.value = true;
  try {
    await TermRateApi.clear({ pricingVersionId: selectedPricingVersion.value, planId: selectedPlanId.value});
    message.success('Cleared term rate data');
    // reload table and grid previews
    await load(); // existing function to load table datasource
    await loadGridPreview(); // existing function to refresh grids if present
  } catch (err: any) {
    console.error(err);
    message.error(err?.message ?? 'Clear failed');
  } finally {
    clearing.value = false;
  }
}

// end

// call onFilterChange from template by binding @change on selects or watch filters
// Example: <a-select v-model:value="filterMode" @change="onFilterChange" ...>
// Or add watchers:
watch([filterMode, filterSex, filterSmoker], async () => await onFilterChange());

</script>

<style scoped>
.term-rate-page {
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

.ant-dropdown-link {
    cursor: pointer;
}
</style>
