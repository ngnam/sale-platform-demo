<template>
  <a-page-header title="Create Quote" @back="goBack" />
  <a-card class="mb16">
    <a-form layout="vertical">
      <a-row :gutter="12">
        <a-col :span="8">
          <a-form-item label="Application">
            <a-select v-model:value="form.appId" :options="appOptions" show-search allowClear placeholder="Select application" @dropdownVisibleChange="loadApps" :loading="loadingApps" :filterOption="filterOptionByLabel" />
          </a-form-item>
        </a-col>

        <a-col :span="8">
          <a-form-item label="Product (Plan)">
            <a-select v-model:value="form.planId" :options="planOptions" show-search allowClear placeholder="Select plan" @dropdownVisibleChange="loadPlans" :loading="loadingPlans" :filterOption="filterOptionByLabel" />
          </a-form-item>
        </a-col>

        <a-col :span="8">
          <a-form-item label="Pricing Version">
            <a-select v-model:value="form.pricingVersionId" :options="pricingVersionOptions" show-search allowClear placeholder="Select pricing version" @dropdownVisibleChange="loadPricingVersions" :loading="loadingPricing" :filterOption="filterOptionByLabel" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="12">
        <a-col :span="6">
          <a-form-item label="Mode">
            <a-select v-model:value="form.mode">
              <a-select-option value="MONTHLY">MONTHLY</a-select-option>
              <a-select-option value="ONE_TIME">ONE_TIME</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <a-col :span="6">
          <a-form-item label="Sum Assured">
            <a-input-number v-model:value="form.sumAssured" style="width:100%" :step="1000" />
          </a-form-item>
        </a-col>

        <a-col :span="6">
          <a-form-item label="Term Months">
            <a-input-number v-model:value="form.termMonths" style="width:100%" :min="0" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="12">
        <a-col :span="4">
          <a-form-item label="Insured Age">
            <a-input-number v-model:value="form.insuredAge" style="width:100%" />
          </a-form-item>
        </a-col>

        <a-col :span="4">
          <a-form-item label="Sex">
            <a-select v-model:value="form.insuredSex">
              <a-select-option value="M">M</a-select-option>
              <a-select-option value="F">F</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <a-col :span="4">
          <a-form-item label="Smoker">
            <a-select v-model:value="form.insuredSmoker">
              <a-select-option :value="false">No</a-select-option>
              <a-select-option :value="true">Yes</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <a-col :span="12">
          <a-form-item label="Reference / Note">
            <a-input v-model:value="form.note" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-divider>Riders (Optional)</a-divider>

      <div v-for="(r, idx) in form.riders" :key="idx" style="display:flex; gap:8px; margin-bottom:8px;">
        <a-select v-model:value="r.riderCode" :options="riderOptions" placeholder="Rider" style="width:260px" @dropdownVisibleChange="loadRiders" :loading="loadingRiders" :filterOption="filterOptionByLabel" />
        <a-input-number v-model:value="r.riderSaOrUnits" placeholder="SA / Units" style="width:180px" :step="1000" />
        <a-input-number v-model:value="r.units" placeholder="Units" style="width:120px" />
        <a-button danger @click="removeRider(idx)">Remove</a-button>
      </div>

      <a-button type="dashed" block @click="addRider">+ Add Rider</a-button>

      <div style="display:flex; gap:12px; margin-top:16px;">
        <a-button type="primary" :loading="submitting" @click="onCreateQuote">Create Quote</a-button>
        <a-button @click="resetForm">Reset</a-button>
      </div>
    </a-form>
  </a-card>

  <a-card v-if="quoteResult" title="Quote Result" class="mb16">
    <a-row :gutter="12">
      <a-col :span="8"><b>Total Premium</b><div>{{ quoteResult.totalPremium }}</div></a-col>
      <a-col :span="8"><b>Base</b><div>{{ quoteResult.breakdownBase }}</div></a-col>
      <a-col :span="8"><b>Riders</b><div>{{ quoteResult.breakdownRiders }}</div></a-col>
    </a-row>

    <a-table :columns="quoteRiderColumns" :dataSource="quoteResult.riders || []" :pagination="false" rowKey="riderCode" class="mt12" />
    <a-button type="link" v-if="quoteResult.pdfUri" @click="downloadIllustration" :loading="downloading">Download Illustration</a-button>
  </a-card>

  <a-card v-if="illuRows.length" title="Illustration (yearly)">
    <a-table :columns="illuColumns" :dataSource="illuRows" :pagination="false" rowKey="policyYear" />
  </a-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { QuoteApi } from '@/apis/quote';
import { ProductPlanApi } from '@/apis/productPlan';
import { PricingVersionApi } from '@/apis/pricingVersion';
import { RiderApi } from '@/apis/rider';
import { AppsApi } from '@/apis/apps';
import { IllustrationApi } from '@/apis/illustration';
const downloading = ref(false);
const router = useRouter();
const route = useRoute();
function goBack() { router.back(); }

const submitting = ref(false);
const loadingPlans = ref(false);
const loadingPricing = ref(false);
const loadingRiders = ref(false);
const loadingApps = ref(false);

const quoteResult = ref<any | null>(null);
const illuRows = ref<any[]>([]);

const appOptions = ref<any[]>([]);
const planOptions = ref<any[]>([]);
const pricingVersionOptions = ref<any[]>([]);
const riderOptions = ref<any[]>([]);

const form = reactive({
  appId: route.query.appId ? String(route.query.appId) : undefined,
  planId: '',
  pricingVersionId: '',
  mode: 'MONTHLY',
  sumAssured: 10000000,
  termYears: null as number | null | any,
  termMonths: null as number | null  | any,
  insuredAge: 30,
  insuredSex: 'M',
  insuredSmoker: false as any,
  riders: [] as Array<{ riderCode?: string; riderSaOrUnits?: number; units?: number }>,
  note: '',
});

const quoteRiderColumns = [
  { title: 'Rider', dataIndex: 'riderCode', key: 'riderCode' },
  { title: 'Units/SA', dataIndex: 'units', key: 'units' },
  { title: 'Premium', dataIndex: 'premium', key: 'premium' },
];

const illuColumns = [
  { title: 'Policy Year', dataIndex: 'policyYear', key: 'policyYear' },
  { title: 'Premium Annual', dataIndex: 'premiumAnnual', key: 'premiumAnnual' },
  { title: 'GCV', dataIndex: 'gcv', key: 'gcv' },
  { title: 'Surrender Value', dataIndex: 'surrenderValue', key: 'surrenderValue' },
  { title: 'Death Benefit', dataIndex: 'deathBenefit', key: 'deathBenefit' },
];

function filterOptionByLabel(input: string, option: any) {
  return (option?.label ?? '').toLowerCase().includes((input || '').toLowerCase());
}

async function loadPlans() {
  loadingPlans.value = true;
  try {
    const resp = await ProductPlanApi.getAll({ page: 1, pageSize: 500 }) ?? [];
    const list = (resp as any).data ?? resp ?? [];
    const items = Array.isArray(list) ? list : (list.items ?? list.Items ?? []);
    planOptions.value = items.map((p: any) => ({ label: p.planId ?? p.name, value: p.planId }));
  } catch (e) {
    console.error(e);
  } finally {
    loadingPlans.value = false;
  }
}

async function loadPricingVersions(open = true) {
  if (!open || !form.planId) return;
  loadingPricing.value = true;
  try {
    const resp = await PricingVersionApi.getAll(form.planId) ?? [];
    const list = (resp as any).data ?? resp ?? [];
    const items = Array.isArray(list) ? list : (list.items ?? list.Items ?? []);
    pricingVersionOptions.value = items.map((p: any) => ({ label: p.pricingVersionId ?? p.name, value: p.pricingVersionId }));
  } catch (e) {
    console.error(e);
  } finally {
    loadingPricing.value = false;
  }
}

async function loadRiders(open = true) {
  if (!open) return;
  loadingRiders.value = true;
  try {
    const resp = await RiderApi.queryMasters();
    const items = (resp as any).data ?? resp ?? [];
    const list = Array.isArray(items) ? items : [];
    riderOptions.value = list.map((r: any) => ({ label: `${r.name} (${r.riderCode})`, value: r.riderCode }));
  } catch (e) {
    console.error(e);
  } finally {
    loadingRiders.value = false;
  }
}

async function loadApps(open = true) {
  if (!open) return;
  loadingApps.value = true;
  try {
    const resp = await AppsApi.getAll({ page: 1, pageSize: 200 }) ?? [];
    const list = (resp as any).data ?? resp ?? [];
    const items = Array.isArray(list) ? list : (list.items ?? list.Items ?? []);
    appOptions.value = items.map((a: any) => ({ label: `${a?.lead?.fullName ?? a.appId}`, value: a.appId }));
  } catch (e) {
    console.error(e);
  } finally {
    loadingApps.value = false;
  }
}

function addRider() {
  form.riders.push({ riderCode: '', riderSaOrUnits: 0, units: 0 });
}
function removeRider(i: number) {
  form.riders.splice(i, 1);
}

function resetForm() {
  form.planId = '';
  form.pricingVersionId = '';
  form.mode = 'MONTHLY';
  form.sumAssured = 10000000;
  form.termYears = null;
  form.termMonths = null;
  form.insuredAge = 30;
  form.insuredSex = 'M';
  form.insuredSmoker = false;
  form.riders = [];
  form.note = '';
  quoteResult.value = null;
  illuRows.value = [];
}

async function onCreateQuote() {
  if (!form.planId || !form.pricingVersionId) {
    message.warn('Choose plan and pricing version');
    return;
  }

  submitting.value = true;
  try {
    const dto: any = {
      appId: form.appId ?? null,
      planId: form.planId,
      pricingVersionId: form.pricingVersionId,
      mode: form.mode,
      sumAssured: Number(form.sumAssured),
      termYears: form.termYears ?? undefined,
      termMonths: form.termMonths ?? undefined,
      insuredAge: Number(form.insuredAge),
      insuredSex: form.insuredSex,
      insuredSmoker: Boolean(form.insuredSmoker),
      riders: form.riders?.filter(r => r.riderCode).map(r => ({ riderCode: r.riderCode, riderSaOrUnits: Number(r.riderSaOrUnits || 0), units: Number(r.units || 0) })) ?? []
    };

    const res = await QuoteApi.create(dto);
    quoteResult.value = (res as any).data ?? res ?? null;
    message.success('Quote created');

    if (quoteResult.value?.illustrationId) {
      const illu = await IllustrationApi.getDetail(quoteResult.value.illustrationId);
      const data = (illu as any).data ?? illu ?? {};
      illuRows.value = data.illuYearlies ?? data.IlluYearlies ?? data.illuyearlies ?? [];
    }
  } catch (err) {
    console.error(err);
    message.error('Create quote failed');
  } finally {
    submitting.value = false;
  }
}

function parseFilenameFromContentDisposition(cd: string | null): string | null {
  if (!cd) return null;
  const m: any = /filename\*?=(?:UTF-8'')?["']?([^;"']+)["']?/i.exec(cd);
  if (!m) return null;
  try { return decodeURIComponent(m[1].replace(/['"]/g, '')); } catch { return m[1].replace(/['"]/g, ''); }
}

async function downloadIllustration() {
  if (!quoteResult.value?.illustrationId) { message.warn('No PDF'); return; }
  downloading.value = true;

  try {
    const resp = await IllustrationApi.getPdf(quoteResult.value.illustrationId);

    let blob: Blob;
    let filename = `illustration-${quoteResult.value.illustrationId}.pdf`;

    // axios-style response (has data and headers)
    if (resp && typeof resp === 'object' && 'data' in resp) {
      blob = resp.data instanceof Blob ? resp.data : new Blob([resp.data], { type: 'application/pdf' });
      const cd = (resp.headers && (resp.headers['content-disposition'] || resp.headers['Content-Disposition'])) ?? null;
      filename = parseFilenameFromContentDisposition(cd) ?? filename;
    } else {
      // assume fetch Response-like
      // if your IllustrationApi used fetch and returned Response, resp.blob exists
      if (resp && typeof (resp as any).blob === 'function') {
        blob = await (resp as Response).blob();
        const cd = (resp as Response).headers?.get?.('content-disposition') ?? null;
        filename = parseFilenameFromContentDisposition(cd) ?? filename;
      } else {
        // last resort: try to coerce resp to Blob
        blob = resp instanceof Blob ? resp : new Blob([JSON.stringify(resp)], { type: 'application/pdf' });
      }
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    message.success('Download started');
  } catch (err: any) {
    console.error(err);
    message.error(err?.message ?? 'Download failed');
  } finally {
    downloading.value = false;
  }
}

onMounted(() => {
  loadPlans();
  loadPricingVersions();
  loadRiders();
});
</script>

<style scoped>
.mb16 { margin-bottom: 16px; }
.mt12 { margin-top: 12px; }
</style>
