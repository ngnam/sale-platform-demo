<template>
    <router-view v-slot="{ Component }">
        <component :is="Component" v-if="Component" />
        <template v-else>
            <div class="product-plan-page">
                <h2 class="title">Sản phẩm bảo hiểm</h2>

                <a-card class="mb16" :body-style="{ padding: '12px' }">
                    <div style="display:flex; gap:12px; align-items:center; margin-bottom:8px;">
                        <a-input-search v-model:value="q" placeholder="Search by PlanId or Name" @search="onSearch"
                            style="width:360px" allowClear />
                        <a-button type="primary" @click="openCreate">Create Plan</a-button>
                        <a-button danger :disabled="!selectedKeys.length" @click="onDeleteSelected">Delete
                            Selected</a-button>
                        <a-button :loading="loading" @click="load">Refresh</a-button>                        
                    </div>

                    <a-table :columns="tableColumns" :dataSource="dataSource" :loading="loading"
                        :pagination="pagination" :rowKey="rowKey" :rowSelection="rowSelection" :scroll="{ x: 1000 }"
                        @change="handleTableChange">
                        <template #bodyCell="{ column, record }: any">
                            <template v-if="column.key === 'action'">
                                <a-dropdown placement="topLeft" trigger="click">
                                    <template #overlay>
                                        <a-menu class="menu-box" @click="() => onMenuClickWithRecord">
                                            <a-menu-item v-for="(action, index) in getActions(record)"
                                                :key="`${index}-${action.label}`"
                                                :style="{ color: action.type === 'delete' ? 'red' : 'inherit' }">
                                                <template #icon>
                                                    <Icon align="2px" size="15px" style="margin-right: 12px;"
                                                        :type="getActionIcon(action)" />
                                                </template>

                                                <span v-if="action.permission === false">——</span>

                                                <a v-else @click="() => action.onClick?.(record)" :type="action.type">{{
                                                    getActionLabel(action, record) }}</a>
                                            </a-menu-item>
                                        </a-menu>
                                    </template>

                                    <template #default>
                                        <span class="ant-dropdown-link" role="button" tabindex="0" @click.prevent>
                                            <Icon align="2px" size="20px" style="margin-left: 5px"
                                                type="EllipsisOutlined" />
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

                <a-modal v-model:open="modalVisible" :title="isEdit ? 'Edit Product Plan' : 'Create Product Plan'"
                    @ok="handleSubmit" @cancel="handleCancel" :confirmLoading="submitting" :width="680" centered>
                    <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
                        <a-form-item label="Plan Id" name="planId"
                            :rules="isEdit ? [] : [{ required: true, message: 'PlanId is required' }]">
                            <a-input v-model:value="form.planId" :disabled="isEdit"
                                placeholder="e.g. MAPLIFE_TERM_20" />
                        </a-form-item>

                        <a-form-item label="Product Type" name="productType"
                            :rules="[{ required: true, message: 'ProductType required' }]">
                            <a-select v-model:value="form.productType" style="width:100%">
                                <a-select-option value="TERM">TERM LIFE</a-select-option>
                                <a-select-option value="WHOLE_LIFE">WHOLE_LIFE</a-select-option>
                                <a-select-option value="UNIVER_LIFE">UNIVER_LIFE</a-select-option>
                            </a-select>
                        </a-form-item>

                        <a-form-item label="Name" name="name" :rules="[{ required: true, message: 'Name required' }]">
                            <a-input v-model:value="form.name" placeholder="Product name" />
                        </a-form-item>

                        <a-form-item label="Currency" name="currency">
                            <a-select v-model:value="form.currency" style="width:100%">
                                <a-select-option value="VND">VND</a-select-option>
                                <a-select-option value="USD">USD</a-select-option>
                                <a-select-option value="EUR">EUR</a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-form>
                </a-modal>
            </div>
        </template>
    </router-view>

</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { columns as baseColumns } from './constants';
import { ProductPlanApi } from '@/apis/productPlan';
import type { ProductPlanListDto, ProductPlanDetailDto, CreateProductPlanReq, UpdateProductPlanReq } from '@/apis/types/productPlan';
import type { PagedResult } from '@/apis/types/common';
import { FormInstance, Rule } from 'ant-design-vue/es/form';
import { useRouter } from 'vue-router';
import cloneDeep from 'lodash-es/cloneDeep'; 

// trong setup()
const router = useRouter();
const q = ref('');
const loading = ref(false);
const submitting = ref(false);
const modalVisible = ref(false);
const isEdit = ref(false);
const editKey = ref<string | null>(null);

const page = ref(1);
const pageSize = ref(20);
const total = ref(0);

// table data
const items = ref<ProductPlanListDto[]>([]);

// selection
const selectedKeys = ref<string[]>([]);

// form (not using useForm)
type FormModel = {
    planId?: string;
    productType?: string;
    name?: string;
    currency?: string;
};
const defaultForm: FormModel = { planId: '', productType: '', name: '', currency: 'VND' };
const form = ref<FormModel>({ ...defaultForm });
const formRef = ref<FormInstance>();

// table columns: attach action handlers into row via dataSource transform
const tableColumns = baseColumns;

// pagination object for a-table
const pagination = computed(() => ({
    current: page.value,
    pageSize: pageSize.value,
    total: total.value,
    showSizeChanger: true,
    showQuickJumper: true,
}));

const rowKey = (record: ProductPlanListDto) => record.planId;

function onManageProductBenefits(record: ProductPlanListDto) {
    router.push({ name: 'ProductBenefits', params: { planId: record.planId } });
}

// hàm điều hướng đến list pricing versions của plan version
function onManagePricingVersions(record: ProductPlanListDto) {
    router.push({ name: 'PricingVersions', params: { planId: record.planId } });
}

// hàm điều hướng sang trang quản lý phiên bản định phí
async function onManagerPlanVersion(record: ProductPlanListDto) {
    // điều hướng đến route: /product-plans/:planId/versions
    // điều chỉnh đường dẫn tuỳ router của bạn
    await router.push({ name: 'PlanVersions', params: { planId: record.planId } });
}

// dataSource adapter injects handlers to each record
const dataSource = computed(() =>
    items.value.map((r, idx) => ({
        ...r,
        index: (page.value - 1) * pageSize.value + idx + 1,
        __onEdit: onRowEdit,
        __onDelete: onRowDelete,
        __onManagerPlanVersion: onManagerPlanVersion,
        __onManagePricingVersions: onManagePricingVersions,
        __onManageProductBenefits: onManageProductBenefits
    }))
);

// rules for a-form validation
const rules: Record<string, Rule | Rule[]> = {
    productType: [{ required: true, message: 'ProductType required', trigger: 'blur' }],
    name: [{ required: true, message: 'Name required', trigger: 'blur' }],
};

// proper typed rowSelection for a-table
const rowSelection = computed<any>(() => ({
    selectedRowKeys: selectedKeys.value,
    // called when user selects / unselects rows
    onChange: (selectedRowKeys: string[] /* or (string | number)[] */, selectedRows: ProductPlanListDto[]) => {
        // keep selectedKeys in sync
        selectedKeys.value = (selectedRowKeys as string[]).slice();
    },
    // optional: select all handler UI behaviour
    // onSelectAll: (selected, selectedRows, changeRows) => { ... }
}));

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
    { key: 'planVersion', label: 'Plan Version', type: 'default', permission: true, enable: true, onClick: onManagerPlanVersion },
    { key: 'pricingVersion', label: 'Pricing Version', type: 'default', permission: true, enable: true, onClick: onManagePricingVersions },
    { key: 'productBenefit', label: 'Product Benefit', type: 'default', permission: true, enable: true, onClick: onManageProductBenefits },
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

// load list
const load = async () => {
    loading.value = true;
    try {
        const params = { page: page.value, pageSize: pageSize.value, q: q.value || undefined };
        const resp = await ProductPlanApi.getAll(params);
        // handle different http util return shapes: resp.data or resp
        const paged: PagedResult<ProductPlanListDto> = (resp as any).data ?? resp;
        items.value = Array.from((paged.items ?? (paged.items as any) ?? []));
        total.value = (paged.totalItems ?? paged.totalItems ?? 0) as number;
    } catch (e: any) {
        console.error(e);
        message.error('Load product plans failed');
    } finally {
        loading.value = false;
    }
};

// search handler
const onSearch = async () => {
    page.value = 1;
    await load();
};

// table change (pagination / sorter)
const handleTableChange = async (paginationEvent: any) => {
    if (paginationEvent) {
        page.value = paginationEvent.current || page.value;
        pageSize.value = paginationEvent.pageSize || pageSize.value;
    }
    await load();
};

// open create modal
const openCreate = async () => {
  isEdit.value = false;
  editKey.value = null;

  // ensure we don't share refs
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

// edit row
async function onRowEdit(record: ProductPlanListDto) {
    isEdit.value = true;
    editKey.value = record.planId;
    try {
        const resp = await ProductPlanApi.getDetail(record.planId);
        const dto: ProductPlanDetailDto = (resp as any).data ?? resp;
        Object.assign(form.value, {
            planId: dto.planId,
            productType: dto.productType,
            name: dto.name,
            currency: dto.currency ?? 'VND',
        });
        // show modal and wait for form to mount
        modalVisible.value = true;
        await nextTick();
        // ensure validation state is cleared for edit as well
        //formRef.value?.resetFields?.();    // optional: keeps model but resets internal touched/dirty
        formRef.value?.clearValidate?.();
    } catch (e) {
        console.error(e);
        message.error('Load plan detail failed');
    }
}

// delete single row
async function onRowDelete(record: ProductPlanListDto) {
    Modal.confirm({
        title: 'Delete product plan',
        content: `Delete plan ${record.planId}?`,
        onOk: async () => {
            try {
                await ProductPlanApi.remove(record.planId);
                message.success('Deleted');
                // clear selection if contained
                selectedKeys.value = selectedKeys.value.filter(k => k !== record.planId);
                load();
            } catch (e) {
                console.error(e);
                message.error('Delete failed');
            }
        },
    });
}

// delete selected (bulk)
const onDeleteSelected = async () => {
    if (!selectedKeys.value.length) return;
    Modal.confirm({
        title: `Delete ${selectedKeys.value.length} product plan(s)`,
        content: `Are you sure to delete selected plans?`,
        onOk: async () => {
            try {
                // if API supports bulk delete prefer single endpoint; otherwise delete sequentially
                // sequential to be safer on server constraints
                for (const id of [...selectedKeys.value]) {
                    await ProductPlanApi.remove(id);
                }
                message.success('Deleted selected plans');
            } catch (e) {
                console.error(e);
                message.error('Delete failed');
            }
            finally {
                selectedKeys.value = [];
                // reset to first page if current page may be empty
                page.value = 1;
                load();
            }
        },
    });
};

// submit (create or update)
const handleSubmit = async () => {
    try {
        await formRef.value?.validate?.();
    } catch {
        return;
    }

    const payloadCreate: CreateProductPlanReq = {
        planId: (form.value.planId ?? '').trim(),
        productType: (form.value.productType ?? '').trim(),
        name: (form.value.name ?? '').trim(),
        currency: form.value.currency ?? 'VND',
    };

    const payloadUpdate: UpdateProductPlanReq = {
        productType: (form.value.productType ?? '').trim(),
        name: (form.value.name ?? '').trim(),
        currency: form.value.currency ?? 'VND',
    };

    submitting.value = true;
    try {
        if (isEdit.value && editKey.value) {
            await ProductPlanApi.update(editKey.value, payloadUpdate);
            message.success('Updated');
        } else {
            await ProductPlanApi.create(payloadCreate);
            message.success('Created');
        }
        modalVisible.value = false;
        // reload and keep selection cleared
        selectedKeys.value = [];
        load();
    } catch (e: any) {
        console.error(e);
        const msg = e?.response?.data?.error ?? e?.response?.data ?? 'Save failed';
        message.error(String(msg));
    } finally {
        submitting.value = false;
    }
};

const handleCancel = () => {
    modalVisible.value = false;
};

// initial load
load();
</script>

<style scoped>
.product-plan-page {
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
