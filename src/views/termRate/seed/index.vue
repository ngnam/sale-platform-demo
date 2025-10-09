<template>
    <div class="term-rate-seed-page">
        <a-page-header title="Seed Term Rates" @back="goBack" />
        <a-card class="mb16">
            <a-form ref="formRef" :model="form" layout="vertical">
                <a-row :gutter="12">
                    <a-col :span="12">
                        <a-form-item label="Pricing Version">
                            <a-select v-model:value="form.pricingVersion" :options="pricingVersionOptions"
                                :loading="loadingPricing" show-search allowClear
                                @dropdownVisibleChange="loadPricingVersions" />
                        </a-form-item>
                    </a-col>
                    <a-col :span="12">
                        <a-form-item label="Plan">
                            <a-select v-model:value="form.planId" :options="planOptions" :loading="loadingPlans"
                                show-search allowClear @dropdownVisibleChange="loadPlans" />
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-row :gutter="12">
                    <a-col :span="16">
                        <a-form-item label="Age Range">
                            <a-slider range v-model:value="form.ageRange" :min="0" :max="100" />
                        </a-form-item>
                    </a-col>
                    <a-col :span="4">
                        <a-input-number v-model:value="form.ageRange[0]" :min="0" :max="form.ageRange[1]"
                            style="width:100%" />
                    </a-col>
                    <a-col :span="4">
                        <a-input-number v-model:value="form.ageRange[1]" :min="form.ageRange[0]" :max="100"
                            style="width:100%" />
                    </a-col>
                </a-row>

                <a-row :gutter="12">
                    <a-col :span="8">
                        <a-form-item label="Term Months CSV">
                            <a-input v-model:value="form.termMonthsCsv" placeholder="e.g. 12,24,36" />
                        </a-form-item>
                    </a-col>
                    <a-col :span="8">
                        <a-form-item label="Mode">
                            <a-select v-model:value="form.mode" allowClear
                                @change="val => { if(val==='ONE_TIME' && form.termMonthsCsv!==onetimeTermsMonths) form.termMonthsCsv=onetimeTermsMonths; else if(val==='MONTHLY' && form.termMonthsCsv!==periodicTermsMonths) form.termMonthsCsv=periodicTermsMonths; }">
                                <a-select-option value="">Both</a-select-option>
                                <a-select-option value="MONTHLY">MONTHLY</a-select-option>
                                <a-select-option value="ONE_TIME">ONE_TIME</a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                    <a-col :span="8">
                        <a-form-item label="Sex">
                            <a-select v-model:value="form.sex" allowClear>
                                <a-select-option value="">Both</a-select-option>
                                <a-select-option value="M">M</a-select-option>
                                <a-select-option value="F">F</a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-row :gutter="12">
                    <a-col :span="8">
                        <a-form-item label="Smoker">
                            <a-select v-model:value="form.smoker" allowClear>
                                <a-select-option :value="true">Smoker</a-select-option>
                                <a-select-option :value="false">Non-Smoker</a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>

                    <a-col :span="8">
                        <a-form-item label="Formula">
                            <a-select v-model:value="form.formula">
                                <a-select-option value="demo">Demo</a-select-option>
                                <a-select-option value="fixed">Fixed</a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>

                    <a-col :span="8" v-if="form.formula === 'fixed'">
                        <a-form-item label="Fixed Rate /1000">
                            <a-input-number v-model:value="form.fixedRate" style="width:100%" :step="0.01" />
                        </a-form-item>
                    </a-col>
                </a-row>

                <div style="display:flex; gap:12px; align-items:center; margin-top:12px;">
                    <a-button type="primary" @click="generatePreview">Generate Preview</a-button>
                    <a-button type="default" :loading="seeding" @click="submitSeed">Seed All</a-button>
                    <a-button @click="clearPreview">Clear</a-button>
                    <a-button @click="cancelSeed">Cancel Seed</a-button>
                </div>
            </a-form>
        </a-card>

        <a-card title="Preview (first 200 rows)" >
            <a-table :columns="previewColumns" :dataSource="previewRows.slice(0,200)" :rowKey="r=>rKey(r)" :scroll="{ x: 1400, y: 500 }"
                :pagination="false" />
        </a-card>

        <a-card title="Preview Grid (ages rows x term-month columns)" style="margin-top:16px;">
            <!-- chèn ngay dưới <a-table :columns="previewColumns" ... /> trong phần Preview card -->
            <div style="overflow:auto; border:1px solid #f0f0f0; padding:8px; border-radius:4px;">
                <a-table :columns="previewGridColumns" :dataSource="previewGridRows" :rowKey="r => `age-${r.age}`"
                    :pagination="false" :loading="false" bordered :scroll="{ x: previewGridScrollX, y: 500 }" size="small">
                    <template #bodyCell="{ column, record }: any">
                        <template v-if="column['key'] === 'age'">
                            <strong>{{ record.age }}</strong>
                        </template>
                        <template v-else>
                            <div style="display:flex; justify-content:flex-end; gap:8px; align-items:center;">
                                <span v-if="record.values[column.key] != null">{{
                                    record.values[column.key].ratePer1000 }}</span>
                                <span v-else class="text-muted">-</span>
                            </div>
                        </template>
                    </template>
                </a-table>
            </div>
        </a-card>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { FormInstance, message } from 'ant-design-vue';
import { PricingVersionApi } from '@/apis/pricingVersion';
import { ProductPlanApi } from '@/apis/productPlan';
import { TermRateSeedApi } from '@/apis/termRateSeed';
import type { SeedRow } from '@/apis/termRateSeed';

const router = useRouter();

function goBack() { router.back(); }

const pricingVersionOptions = ref<{ label: string; value: string }[]>([]);
const planOptions = ref<{ label: string; value: string }[]>([]);
const loadingPricing = ref(false);
const loadingPlans = ref(false);
const seeding = ref(false);

const periodicTermsMonths = '12, 24, 36, 48, 60, 72, 84, 96, 108, 120';
const onetimeTermsMonths = '3, 6, 9, 12, 18, 24, 36, 48, 60, 72, 84, 96, 108, 120';
const formRef = ref<FormInstance>();
const form = ref({
  pricingVersion: '',
  planId: '',
  ageRange: [20, 30] as [number, number],
  termMonthsCsv: periodicTermsMonths,
  mode: '' as '' | 'MONTHLY' | 'ONE_TIME',
  sex: '',
  smoker: '' as boolean | any,
  formula: 'demo' as 'demo' | 'fixed',
  fixedRate: 30.0,
});

// thêm vào <script setup lang="ts"> nơi seed preview tồn tại
const periodicTermsMonthsArr = [12, 24, 36, 48, 60, 72, 84, 96, 108, 120];
const onetimeTermsMonthsArr = [3, 6, 9, 12, 18, 24, 36, 48, 60, 72, 84, 96, 108, 120];
// ages from seed preview (use seedForm.ageRange or fallback 20..30)
const previewAgeFrom = computed(() => (form.value?.ageRange?.[0] ?? 20));
const previewAgeTo = computed(() => (form.value?.ageRange?.[1] ?? 30));
const previewAges = computed(() => {
  const from = Number(previewAgeFrom.value ?? 20);
  const to = Number(previewAgeTo.value ?? 30);
  const a0 = Math.max(0, Math.min(from, to));
  const a1 = Math.max(0, Math.max(from, to));
  return Array.from({ length: a1 - a0 + 1 }, (_, i) => a0 + i);
});

// build preview grid columns: Age, periodic cols (M_), one-time cols (O_)
const previewGridColumns = computed(() => {
  const cols: any[] = [{ title: 'Age', dataIndex: 'age', key: 'age', fixed: 'left', width: 80 }];
  periodicTermsMonthsArr.forEach((m) => cols.push({ title: `${m}m (M)`, dataIndex: `M_${m}`, key: `M_${m}`, width: 110 }));
  onetimeTermsMonthsArr.forEach((m) => cols.push({ title: `${m}m (O)`, dataIndex: `O_${m}`, key: `O_${m}`, width: 110 }));
  return cols;
});

// horizontal scroll width estimate
const previewGridScrollX = computed(() => {
  const colCount = 1 + periodicTermsMonths.length + onetimeTermsMonths.length;
  return Math.max(900, colCount * 110);
});

// build preview grid rows from existing previewRows (client-generated seed preview)
// previewRows is assumed existing (array of SeedRow)
const previewGridRows = computed(() => {
  // initialize empty rows
  const rows = previewAges.value.map((age) => {
    const values: Record<string, any> = {};
    periodicTermsMonthsArr.forEach((m) => (values[`M_${m}`] = null));
    onetimeTermsMonthsArr.forEach((m) => (values[`O_${m}`] = null));
    return { age, values };
  });

  // map previewRows into grid (previewRows defined earlier)
  (previewRows.value ?? []).forEach((r: any) => {
    const key = (r.mode === 'ONE_TIME' ? `O_${r.termMonths}` : `M_${r.termMonths}`);
    const row = rows.find((rw) => rw.age === r.age);
    if (row && key in row.values) row.values[key] = r;
  });

  return rows;
});

// endcc

async function loadPricingVersions(open = true) {
  if (!form.value.planId || form.value.planId === '') return;
  if (!open) return;
  loadingPricing.value = true;
  try {
    const resp = await PricingVersionApi.getAll(form.value.planId);
    const data = (resp as any).data ?? resp ?? [];
    const list = Array.isArray(data) ? data : (data.items ?? data.Items ?? []);
    pricingVersionOptions.value = (list ?? []).map((p: any) => ({ label: p.pricingVersionId ?? p.name ?? p.title ?? p.id, value: p.pricingVersionId ?? p.id }));
  } catch (err) {
    console.error(err); message.error('Load pricing versions failed');
  } finally { loadingPricing.value = false; }
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
    console.error(err); message.error('Load plans failed');
  } finally { loadingPlans.value = false; }
}

function parseTermMonths(csv = '') {
  return Array.from(new Set(csv.split(',').map(s => Number(s.trim())).filter(n => Number.isFinite(n) && n > 0))).sort((a,b)=>a-b);
}

function getAgeRange() {
  const a0 = Number(form.value.ageRange?.[0] ?? 0);
  const a1 = Number(form.value.ageRange?.[1] ?? 0);
  return { from: Math.max(0, Math.min(a0,a1)), to: Math.max(0, Math.max(a0,a1)) };
}

function buildRows(): SeedRow[] {
  const rows: SeedRow[] = [];
  const pv = form.value.pricingVersion;
  const plan = form.value.planId;
  if (!pv || !plan) return rows;
  const months = parseTermMonths(form.value.termMonthsCsv);
  if (!months.length) return rows;
  const { from, to } = getAgeRange();
  const sexes = form.value.sex === '' ? ['M','F'] : [form.value.sex];
  const smokers = form.value.smoker === '' ? [false, true] : [form.value.smoker === true || form.value.smoker === 'true'];
  const modes = form.value.mode === '' ? ['MONTHLY','ONE_TIME'] : [form.value.mode];

  for (let age = from; age <= to; age++) {
    for (const tm of months) {
      for (const sex of sexes) {
        for (const smoker of smokers) {
          for (const mode of modes) {
            const isOneTime = mode === 'ONE_TIME';
            // formula
            let ratePer1000 = 0;
            let termYearsFactor = 1.0;
            if (form.value.formula === 'fixed') {
              ratePer1000 = Number(form.value.fixedRate ?? 0);
              termYearsFactor = 1.0;
            } else {
              const years = tm / 12.0;
              if (sex === 'M') {
                const baseRate = 30.0 + (age - 20) * 0.5;
                const oneTimeFactor = isOneTime ? 1.20 : 1.0;
                const termAdj = 1.0 + Math.max(0, years - 1) * 0.02;
                ratePer1000 = Math.round((baseRate * termAdj * oneTimeFactor) * 100) / 100;
                termYearsFactor = Math.round((1.0 + Math.max(0, years - 1) * 0.02) * 100) / 100;
              } else {
                const baseRate = 28.0 + (age - 20) * 0.45;
                const oneTimeFactor = isOneTime ? 1.15 : 1.0;
                const termAdj = 1.0 + Math.max(0, years - 1) * 0.018;
                ratePer1000 = Math.round((baseRate * termAdj * oneTimeFactor) * 100) / 100;
                termYearsFactor = Math.round((1.0 + Math.max(0, years - 1) * 0.018) * 100) / 100;
              }
            }

            rows.push({
              pricingVersionId: pv,
              planId: plan,
              age,
              sex,
              smoker,
              termMonths: tm,
              mode,
              isOneTime,
              ratePer1000,
              termYearsFactor,
            });

            if (rows.length >= 2000) return rows; // safe cap
          }
        }
      }
    }
  }

  return rows;
}

const previewRows = ref<SeedRow[]>([]);
function generatePreview() {
  previewRows.value = buildRows();
  if (!previewRows.value.length) message.warn('No rows generated: choose PricingVersion and Plan and term months');
  else message.success(`Preview ${previewRows.value.length} rows generated`);
}
function clearPreview() { previewRows.value = []; }

function rKey(r: SeedRow) {
  return `${r.pricingVersionId}::${r.planId}::${r.age}::${r.sex}::${r.smoker}::${r.termMonths}::${r.mode}`;
}

const previewColumns = [
  { title: 'PV', dataIndex: 'pricingVersionId', key: 'pricingVersionId' },
  { title: 'Plan', dataIndex: 'planId', key: 'planId' },
  { title: 'Age', dataIndex: 'age', key: 'age' },
  { title: 'Sex', dataIndex: 'sex', key: 'sex' },
  { title: 'Smoker', dataIndex: 'smoker', key: 'smoker' },
  { title: 'TermMonths', dataIndex: 'termMonths', key: 'termMonths' },
  { title: 'Mode', dataIndex: 'mode', key: 'mode' },
  { title: 'Rate/1000', dataIndex: 'ratePer1000', key: 'ratePer1000', customRender: ({text}) => (Number(text) / 1000).toFixed(5) },
];

// async function submitSeed() {
//   const rows = buildRows();
//   if (!rows.length) { message.warn('No rows to seed'); return; }

//   seeding.value = true;
//   try {
//     // map to CreateTermRateReq shape
//     const payload = rows.map(r => ({
//       pricingVersionId: r.pricingVersionId,
//       planId: r.planId,
//       age: r.age,
//       sex: r.sex,
//       smoker: r.smoker,
//       termMonths: r.termMonths,
//       mode: r.mode,
//       isOneTime: r.isOneTime,
//       ratePer1000: r.ratePer1000,
//       termYearsFactor: r.termYearsFactor,
//     }));
//     await TermRateSeedApi.seed(payload as any);
//     message.success(`Seeded ${payload.length} rows`);
//     previewRows.value = [];
//   } catch (err) {
//     console.error(err);
//     message.error('Seeding failed');
//   } finally {
//     seeding.value = false;
//   }
// }

// add these reactive refs near seed state
const batchSize = ref(200);
const concurrency = ref(3);
const maxRetries = ref(3);
const baseDelayMs = ref(500);

const seedProgress = ref({
  attempted: 0,
  created: 0,
  skipped: 0,
  failed: 0,
  currentBatch: 0,
  totalBatches: 0,
});
const seedAbortController = ref<AbortController | null>(null);
const seedInProgress = ref(false);

// helper: chunk array
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// send a single batch with retries
async function sendBatchWithRetry(
  batch: any[],
  attemptIndex: number,
  opts: { maxRetries: number; baseDelayMs: number },
  signal?: AbortSignal
): Promise<{ attempted: number; created: number; skipped: number; failed: number }> {
  let attempt = 0;
  while (true) {
    if (signal?.aborted) throw new Error('aborted');
    attempt++;
    try {
      // TermRateSeedApi.seed should accept an array and return summary {attempted, created, skipped, failed} or ok
      const resp = await TermRateSeedApi.seed(batch);
      const data = (resp as any).data ?? resp ?? {};
      const created = typeof data.created === 'number' ? data.created : batch.length;
      const skipped = typeof data.skipped === 'number' ? data.skipped : 0;
      const failed = typeof data.failed === 'number' ? data.failed : 0;
      return { attempted: batch.length, created, skipped, failed };
    } catch (err) {
      if (attempt > opts.maxRetries) {
        // final failure for this batch
        return { attempted: batch.length, created: 0, skipped: 0, failed: batch.length };
      }
      // exponential backoff
      const delay = opts.baseDelayMs * Math.pow(2, attempt - 1);
      await new Promise((res) => setTimeout(res, delay));
      // continue retry
    }
  }
}

// orchestrator: process batches with limited concurrency
async function processBatches(
  allRows: any[],
  opts: { batchSize: number; concurrency: number; maxRetries: number; baseDelayMs: number },
  onProgress?: (s: typeof seedProgress.value) => void,
  signal?: AbortSignal
) {
  const batches = chunk(allRows, opts.batchSize);
  seedProgress.value.attempted = 0;
  seedProgress.value.created = 0;
  seedProgress.value.skipped = 0;
  seedProgress.value.failed = 0;
  seedProgress.value.totalBatches = batches.length;
  seedProgress.value.currentBatch = 0;

  const queue = batches.map((b, i) => ({ batch: b, idx: i }));
  let pointer = 0;

  const workers: Promise<void>[] = [];
  const workerCount = Math.min(opts.concurrency, queue.length);

  for (let w = 0; w < workerCount; w++) {
    const worker = (async () => {
      while (true) {
        if (signal?.aborted) throw new Error('aborted');
        const i = pointer++;
        if (i >= queue.length) break;
        const item: any = queue[i];
        seedProgress.value.currentBatch = i + 1;
        onProgress?.(seedProgress.value);
        const res = await sendBatchWithRetry(item?.batch, i, { maxRetries: opts.maxRetries, baseDelayMs: opts.baseDelayMs }, signal);
        seedProgress.value.attempted += res.attempted;
        seedProgress.value.created += res.created;
        seedProgress.value.skipped += res.skipped;
        seedProgress.value.failed += res.failed;
        onProgress?.(seedProgress.value);
      }
    })();
    workers.push(worker);
  }

  await Promise.all(workers);
  seedProgress.value.currentBatch = seedProgress.value.totalBatches;
  onProgress?.(seedProgress.value);
  return { ...seedProgress.value };
}

// updated submitSeed using batching
async function submitSeed() {
  const rows = buildRows();
  if (!rows.length) {
    message.warn('No rows to seed');
    return;
  }

  // prepare payload in CreateTermRateReq shape
  const payloadRows = rows.map((r) => ({
    pricingVersionId: r.pricingVersionId,
    planId: r.planId,
    age: r.age,
    sex: r.sex,
    smoker: r.smoker,
    termMonths: r.termMonths,
    mode: r.mode,
    isOneTime: r.isOneTime,
    ratePer1000: r.ratePer1000,
    termYearsFactor: r.termYearsFactor,
  }));

  // create abort controller to allow cancel
  seedAbortController.value = new AbortController();
  const signal = seedAbortController.value.signal;

  seedInProgress.value = true;
  seeding.value = true;
  // reset progress
  seedProgress.value = { attempted: 0, created: 0, skipped: 0, failed: 0, currentBatch: 0, totalBatches: 0 };

  try {
    const result = await processBatches(
      payloadRows,
      { batchSize: batchSize.value, concurrency: concurrency.value, maxRetries: maxRetries.value, baseDelayMs: baseDelayMs.value },
      (s) => {
        // update UI: you can bind seedProgress to template or show toast
        // example: simple message update every batch
        // message.info(`Seeding progress: ${s.created} created, ${s.skipped} skipped, ${s.failed} failed`, 1);
        // keep minimal logging here
        console.info('seed progress', s);
      },
      signal
    );

    message.success(`Seeding finished. Attempted ${result.attempted}, created ${result.created}, skipped ${result.skipped}, failed ${result.failed}`);
    previewRows.value = [];
  } catch (err: any) {
    if (String(err) === 'Error: aborted' || err?.name === 'AbortError') {
      message.warning('Seeding cancelled');
    } else {
      console.error(err);
      message.error('Seeding failed');
    }
  } finally {
    seedInProgress.value = false;
    seeding.value = false;
    seedAbortController.value = null;
  }
}

// allow user to cancel running seed
function cancelSeed() {
  if (seedAbortController.value) {
    seedAbortController.value.abort();
  }
}


onMounted(async () => {
    // prefetch options when entering page
    loadPricingVersions();
    loadPlans();
})
</script>

<style scoped>
.term-rate-seed-page { max-width: 1200px; margin: 12px auto; }
.mb16 { margin-bottom: 16px; }
</style>
