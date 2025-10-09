<template>
    <router-view v-slot="{ route }">
        <div class="product-benefit-page">
            <h2 class="title">Product Benefits for {{ planId }}</h2>

            <a-card class="mb16" :body-style="{ padding: '12px' }">
                <div style="display:flex; gap:12px; align-items:center; margin-bottom:8px;">
                    <a-input-search v-model:value="q" placeholder="Search by code or name" @search="onSearch"
                        style="width:360px" allowClear />
                    <a-button type="primary" @click="openCreate">Create Benefit</a-button>
                    <a-button danger :disabled="!selectedKeys.length" @click="onDeleteSelected">Delete
                        Selected</a-button>
                    <a-button :loading="loading" @click="load">Refresh</a-button>
                </div>

                <a-table :columns="tableColumns" :dataSource="dataSource" :loading="loading" :pagination="pagination"
                    :rowKey="rowKey" :rowSelection="rowSelection" :scroll="{ x: 1200 }" @change="handleTableChange">
                    <template #bodyCell="{ column, record }: any">
                        <template v-if="column.key === 'action'">
                            <a-space style="justify-content:flex-end; width:100%;">
                                <a-button size="small" @click="() => onRowView(record)">View</a-button>
                                <a-button size="small" type="primary" @click="() => onRowEdit(record)">Edit</a-button>
                                <a-popconfirm placement="bottom" title="Delete this benefit?"
                                    @confirm="() => onRowDelete(record)">
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

            <a-modal v-model:open="modalVisible" :title="isEdit ? 'Edit Benefit' : 'Create Benefit'"
                @ok="handleSubmit" @cancel="handleCancel" :confirmLoading="submitting" :width="760" centered>
                <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
                    <a-form-item label="Benefit Id" name="benefitId"
                        :rules="isEdit ? [] : [{ required: true, message: 'BenefitId required' }]">
                        <a-input v-model:value="form.benefitId" :disabled="isEdit" placeholder="Unique id" />
                    </a-form-item>

                    <a-form-item label="Benefit Code" name="benefitCode"
                        :rules="[{ required: true, message: 'Benefit code required' }]">
                        <a-input v-model:value="form.benefitCode" placeholder="e.g. BFT001" />
                    </a-form-item>

                    <a-form-item label="Benefit Name" name="benefitName"
                        :rules="[{ required: true, message: 'Benefit name required' }]">
                        <a-input v-model:value="form.benefitName" placeholder="Benefit display name" />
                    </a-form-item>

                    <a-form-item label="Benefit Type" name="benefitType">
                        <a-select v-model:value="form.benefitType" placeholder="Select type">
                            <a-select-option value="MAIN">MAIN</a-select-option>
                            <a-select-option value="LIFE">LIFE</a-select-option>
                            <a-select-option value="HEALTH">HEALTH</a-select-option>
                            <a-select-option value="RIDER">RIDER</a-select-option>
                        </a-select>
                    </a-form-item>

                    <a-form-item label="Payable Event" name="payableEvent">
                        <a-select v-model:value="form.payableEvent" placeholder="Select event">
                            <a-select-option value="DEATH">DEATH</a-select-option>
                            <a-select-option value="MATURITY">MATURITY</a-select-option>
                            <a-select-option value="CRITICAL_ILLNESS">CRITICAL_ILLNESS</a-select-option>
                        </a-select>
                    </a-form-item>

                    <a-form-item label="Limit Amount" name="limitAmount">
                        <a-input-number v-model:value="form.limitAmount" style="width:100%" />
                    </a-form-item>

                    <a-form-item label="Calculation Basis" name="calculationBasis">
                        <a-input v-model:value="form.calculationBasis" placeholder="formula or basis" />
                    </a-form-item>

                    <a-form-item label="Notes" name="notes">
                        <a-textarea v-model:value="form.notes" :rows="3" />
                    </a-form-item>
                </a-form>
            </a-modal>
        </div>
    </router-view>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import type { ColumnType } from 'ant-design-vue/es/table';
import { productBenefitColumns as baseColumns } from './constants';
import { ProductBenefitApi } from '@/apis/productBenefit';
import type { ProductBenefitDto, ProductBenefitListDto, CreateProductBenefitReq, UpdateProductBenefitReq } from '@/apis/types/productBenefit';
import { FormInstance, Rule } from 'ant-design-vue/es/form';

const router = useRouter();

// props from route or parent
const props = defineProps<{ planId: string }>();
const planId = props.planId ?? '';

// UI state
const q = ref('');
const loading = ref(false);
const submitting = ref(false);
const modalVisible = ref(false);
const isEdit = ref(false);
const editKey = ref<string | null>(null);

const page = ref(1);
const pageSize = ref(20);
const total = ref(0);

const items = ref<ProductBenefitListDto[]>([]);
const selectedKeys = ref<string[]>([]);

type FormModel = {
    benefitId?: string;
    benefitCode?: string;
    benefitName?: string;
    benefitType?: string;
    payableEvent?: string;
    limitAmount?: number | undefined;
    calculationBasis?: string | undefined;
    notes?: string | undefined;
};
const defaultForm: FormModel = { benefitId: '', benefitCode: '', benefitName: '', benefitType: 'LIFE', payableEvent: 'DEATH', limitAmount: undefined, calculationBasis: '', notes: '' };
const form = ref<FormModel>({ ...defaultForm });
const formRef = ref<FormInstance>();

// table wiring
const tableColumns = baseColumns as ColumnType[];
const pagination = computed(() => ({ current: page.value, pageSize: pageSize.value, total: total.value, showSizeChanger: true, showQuickJumper: true }));
const rowKey = (record: ProductBenefitListDto) => record.benefitId;
const dataSource = computed(() =>
    items.value.map((r, idx) => ({
        ...r,
        index: (page.value - 1) * pageSize.value + idx + 1,
    }))
);
const rowSelection = computed(() => ({ selectedRowKeys: selectedKeys.value, onChange: (keys: (string | number)[]) => { selectedKeys.value = (keys as string[]).slice(); } }));

const rules: Record<string, Rule | Rule[]> = {
    benefitId: [{ required: true, message: 'BenefitId required', trigger: 'blur' }],
    benefitCode: [{ required: true, message: 'Benefit code required', trigger: 'blur' }],
    benefitName: [{ required: true, message: 'Benefit name required', trigger: 'blur' }],
};

// API interactions
async function load() {
    loading.value = true;
    try {
        const resp = await ProductBenefitApi.getAll(planId);
        const data = (resp as any).data ?? resp ?? [];
        items.value = Array.from(data);
        total.value = items.value.length;
    } catch (e) {
        console.error(e);
        message.error('Load product benefits failed');
    } finally {
        loading.value = false;
    }
}

const onSearch = async () => { page.value = 1; await load(); };

const handleTableChange = async (paginationEvent: any) => {
    if (paginationEvent) {
        page.value = paginationEvent.current || page.value;
        pageSize.value = paginationEvent.pageSize || pageSize.value;
    }
    await load();
};

const openCreate = async () => {
    isEdit.value = false;
    editKey.value = null;
    Object.assign(form.value, JSON.parse(JSON.stringify(defaultForm)));
    modalVisible.value = true;
    await nextTick();
    formRef.value?.resetFields?.(JSON.parse(JSON.stringify(defaultForm)));
    formRef.value?.clearValidate?.();
};

async function onRowEdit(record: ProductBenefitListDto) {
    isEdit.value = true;
    editKey.value = record.benefitId;
    try {
        const resp = await ProductBenefitApi.getDetail(planId, record.benefitId);
        const dto: ProductBenefitDto = (resp as any).data ?? resp;
        Object.assign(form.value, {
            benefitId: dto.benefitId,
            benefitCode: dto.benefitCode,
            benefitName: dto.benefitName,
            benefitType: dto.benefitType,
            payableEvent: dto.payableEvent,
            limitAmount: dto.limitAmount ?? undefined,
            calculationBasis: dto.calculationBasis ?? '',
            notes: dto.notes ?? '',
        });
        modalVisible.value = true;
        await nextTick();
        // formRef.value?.resetFields?.();
        formRef.value?.clearValidate?.();
    } catch (e) {
        console.error(e);
        message.error('Load benefit detail failed');
    }
}

async function onRowDelete(record: ProductBenefitListDto) {
    Modal.confirm({
        title: 'Delete benefit',
        content: `Delete benefit ${record.benefitId}?`,
        onOk: async () => {
            try {
                await ProductBenefitApi.remove(planId, record.benefitId);
                message.success('Deleted');
                selectedKeys.value = selectedKeys.value.filter((k) => k !== record.benefitId);
                load();
            } catch (e) {
                console.error(e);
                message.error('Delete failed');
            }
        },
    });
}

function onRowView(record: ProductBenefitListDto) {
    router.push({ name: 'ProductBenefitDetail', params: { planId, benefitId: record.benefitId } }).catch(() => { });
}

const onDeleteSelected = async () => {
    if (!selectedKeys.value.length) return;
    Modal.confirm({
        title: `Delete ${selectedKeys.value.length} benefit(s)`,
        content: `Are you sure to delete selected benefits?`,
        onOk: async () => {
            try {
                for (const id of [...selectedKeys.value]) {
                    await ProductBenefitApi.remove(planId, id);
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

    const createPayload: CreateProductBenefitReq = {
        benefitId: (form.value.benefitId ?? '').trim(),
        benefitCode: (form.value.benefitCode ?? '').trim(),
        benefitName: (form.value.benefitName ?? '').trim(),
        benefitType: form.value.benefitType ?? '',
        payableEvent: form.value.payableEvent ?? '',
        limitAmount: form.value.limitAmount ?? null,
        calculationBasis: form.value.calculationBasis ?? null,
        notes: form.value.notes ?? null,
    };

    const updatePayload: UpdateProductBenefitReq = {
        benefitCode: (form.value.benefitCode ?? '').trim(),
        benefitName: (form.value.benefitName ?? '').trim(),
        benefitType: form.value.benefitType ?? null,
        payableEvent: form.value.payableEvent ?? null,
        limitAmount: form.value.limitAmount ?? null,
        calculationBasis: form.value.calculationBasis ?? null,
        notes: form.value.notes ?? null,
    };

    submitting.value = true;
    try {
        if (isEdit.value && editKey.value) {
            await ProductBenefitApi.update(planId, editKey.value, updatePayload);
            message.success('Updated');
        } else {
            await ProductBenefitApi.create(planId, createPayload);
            message.success('Created');
        }
        modalVisible.value = false;
        selectedKeys.value = [];
        await load();
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
</script>

<style scoped>
.product-benefit-page {
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

.ant-dropdown-link {
    cursor: pointer;
}
</style>
