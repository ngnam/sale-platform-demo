<template>
  <div class="dashboard-grid">
    <filter-dashboard @apply="onApply" />

    <a-row :gutter="16" style="margin-top:16px">
      <a-col :xs="24" :sm="8">
        <a-card class="stat-card">
          <div class="stat-inner">
            <div class="stat-icon lead">
              <UserAddOutlined />
            </div>
            <div class="stat-body">
              <div class="stat-title">Khách hàng</div>
              <div class="stat-value">{{ totals?.totalLeads ?? '-' }}</div>
            </div>
          </div>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="8">
        <a-card class="stat-card">
          <div class="stat-inner">
            <div class="stat-icon application">
              <FileTextOutlined />
            </div>
            <div class="stat-body">
              <div class="stat-title">Hồ sơ YCBH</div>
              <div class="stat-value">{{ totals?.totalApps ?? '-' }}</div>
            </div>
          </div>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="8">
        <a-card class="stat-card">
          <div class="stat-inner">
            <div class="stat-icon illustration">
              <PictureOutlined />
            </div>
            <div class="stat-body">
              <div class="stat-title">Bảng minh hoạ</div>
              <div class="stat-value">{{ totals?.totalIllustrations ?? '-' }}</div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-card style="margin-top:24px" class="chart-card">
      <div class="chart-header">
        <h3>Trends (daily) <a-spin v-if="loading"></a-spin></h3>
      </div>

      <div class="chart-wrapper">
        <div ref="chartRef" class="dashboard-chart" id="dashboardChart"></div>
        <div class="chart-overlay" v-if="isAllZero">no data visible</div>
      </div>
    </a-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, computed } from 'vue';
import { DashboardApi } from '@/apis/dashboard';
import type { DashboardSummaryDto, DashboardSummaryQuery } from '@/apis/types/dashboard';
import FilterDashboard from '@/components/FilterDashboard.vue';
import { UserAddOutlined, FileTextOutlined, PictureOutlined } from '@ant-design/icons-vue';
import * as echarts from 'echarts';


export default defineComponent({
  name: 'DashboardIndex',
  components: { FilterDashboard, UserAddOutlined, FileTextOutlined, PictureOutlined },
  setup() {
    const totals = ref<DashboardSummaryDto | null>(null);
    const breakdownData = ref({
      leadsByInterval: {},
      appsByInterval: {},
      illustrationsByInterval: {}
    });
    const chartRef = ref(null);
    const loading = ref(false);
    let myChart: any = undefined;

    async function load(q?: DashboardSummaryQuery) {
      loading.value = true;
      try {
        const effective = { breakdown: true, ...(q || { preset: undefined }) };
        const data = await DashboardApi.summary(effective);
        totals.value = {
          totalLeads: data.totalLeads ?? 0,
          totalApps: data.totalApps ?? 0,
          totalIllustrations: data.totalIllustrations ?? 0
        };
        breakdownData.value = {
          leadsByInterval: { ...(data.leadsByInterval ?? {}) },
          appsByInterval: { ...(data.appsByInterval ?? {}) },
          illustrationsByInterval: { ...(data.illustrationsByInterval ?? {}) }
        };

      } catch (e) {
        console.error('load dashboard', e);
      } finally {
        loading.value = false;
      }
    }

    onMounted(async () => {
      await load(); // load will update breakdownData which triggers watcher to render     
      myChart = echarts.init(chartRef.value);
      renderChart();
    });

    // render when data arrives
    // nếu breakdownData thay đổi sau khi fetch API, tự động re-render
    watch(breakdownData, () => {
      if (myChart) {
        console.log('render');
        renderChart();
      }
    }, { deep: true });

    async function onApply(q: DashboardSummaryQuery) {
      await load(q);
    }

    const isAllZero = computed(() => {
      const leads = breakdownData.value?.leadsByInterval ?? {};
      const apps = breakdownData.value?.appsByInterval ?? {};
      const ills = breakdownData.value?.illustrationsByInterval ?? {};
      const sum = [...Object.values(leads), ...Object.values(apps), ...Object.values(ills)].reduce(
        (s: number, v: any) => s + (typeof v === 'number' ? v : 0),
        0
      );
      return sum === 0;
    });

    // hàm dựng option từ breakdownData
    function renderChart() {
      const dates = Object.keys(breakdownData.value.leadsByInterval);
      const option = {
        title: { text: 'Stacked Line Chart' },
        tooltip: { trigger: 'axis' },
        legend: { data: ['Leads', 'Apps', 'Illustrations'] },
        xAxis: { type: 'category', boundaryGap: false, data: dates },
        yAxis: { type: 'value' },
        series: [
          {
            name: 'Leads',
            type: 'line',
            stack: 'Total',
            data: Object.values(breakdownData.value.leadsByInterval)
          },
          {
            name: 'Apps',
            type: 'line',
            stack: 'Total',
            data: Object.values(breakdownData.value.appsByInterval)
          },
          {
            name: 'Illustrations',
            type: 'line',
            stack: 'Total',
            data: Object.values(breakdownData.value.illustrationsByInterval)
          }
        ]
      };
      myChart.setOption(option, { notMerge: true });
    }

    return { totals, loading, onApply, chartRef, isAllZero };
  }
});
</script>

<style scoped>
.dashboard-grid {
  max-width: 1200px;
  margin: 0 auto;
}

.stat-card {
  padding: 12px;
}

.stat-inner {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #fff;
  font-size: 22px;
}

.stat-icon.lead {
  background: linear-gradient(135deg, #13c2c2, #1890ff);
}

.stat-icon.application {
  background: linear-gradient(135deg, #722ed1, #9254de);
}

.stat-icon.illustration {
  background: linear-gradient(135deg, #fa8c16, #ffbb96);
}

.stat-body {
  flex: 1;
  text-align: left;
}

.stat-title {
  color: #888;
  font-size: 14px;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
}

.chart-wrapper {
  position: relative;
  width: 100%;
  height: 360px;
  min-height: 200px;
}

.dashboard-chart {
  width: 100%;
  max-width: 100%;
  height: 360px;
  min-height: 200px;
}

.chart-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  background: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  pointer-events: none;
  font-size: 14px;
}
</style>
