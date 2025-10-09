<!-- src/components/FilterDashboard.vue -->
<template>
  <div class="filter-dashboard" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
    <a-select v-model:value="preset" style="width:160px" @change="onPresetChange">
      <a-select-option value="Today">Today</a-select-option>
      <a-select-option value="ThisWeek">This Week</a-select-option>
      <a-select-option value="ThisMonth">This Month</a-select-option>
      <a-select-option value="All">All</a-select-option>
    </a-select>

    <a-range-picker
      v-model:value="range"
      show-time
      :disabled-date="disabledFuture"
      style="min-width:360px"
      @change="onRangeChange"
    />

    <a-switch v-model:checked="breakdown" @change="onBreakdownChange" />
    <span>Breakdown</span>

    <a-button type="primary" :disabled="!canApply" @click="apply" :loading="loading">Apply</a-button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import dayjs, { Dayjs, type ConfigType } from 'dayjs';
import type { DashboardRangePreset } from '@/apis';

function toDayjs(value: ConfigType | null | undefined): Dayjs | null {
  if (value == null) return null;
  const d = dayjs(value);
  return d.isValid() ? d : null;
}

function toIsoRangeSafe(r: [Dayjs, Dayjs] | undefined) {
  if (!r) return { startUtc: undefined, endUtc: undefined };
  const s = toDayjs(r[0]);
  const e = toDayjs(r[1]);
  return {
    startUtc: s ? s.toISOString() : undefined,
    endUtc: e ? e.toISOString() : undefined
  };
}

export default defineComponent({
  name: 'FilterDashboard',
  emits: ['apply'],
  setup(_, { emit }) {
    const preset = ref<DashboardRangePreset>('ThisMonth');
    // Accept either Dayjs tuple, string tuple, or undefined (empty)
    const range = ref<[Dayjs, Dayjs] | [string, string] | undefined>(undefined);
    const breakdown = ref(true);
    const loading = ref(false);

    const canApply = computed(() => {
      if (!range.value) return true;
      // only validate when we have Dayjs tuple
      if (Array.isArray(range.value) && typeof range.value[0] !== 'string') {
        const s = toDayjs(range.value[0]);
        const e = toDayjs(range.value[1]);
        return !!s && !!e && s.isBefore(e);
      }
      // if it's a string tuple, we can't validate precisely here — allow apply
      return true;
    });

    function onPresetChange() {
      if (preset.value === 'Today') {
        range.value = [dayjs().startOf('day'), dayjs().endOf('day')];
      } else if (preset.value === 'ThisWeek') {
        range.value = [dayjs().startOf('week'), dayjs().endOf('week')];
      } else if (preset.value === 'ThisMonth') {
        range.value = [dayjs().startOf('month'), dayjs().endOf('month')];
      } else {
        range.value = undefined;
      }
    }

    // Match RangePicker signature: (value, dateString)
    function onRangeChange(
      value: [Dayjs, Dayjs] | [string, string] | undefined,
      _dateString: [string, string]
    ) {
      if (!value) {
        range.value = undefined;
        return;
      }

      // If first element is Dayjs, store as Dayjs tuple
      if (typeof (value[0] as any)?.isValid === 'function') {
        range.value = [value[0] as Dayjs, value[1] as Dayjs];
        preset.value = 'All';
        return;
      }

      // Otherwise store as string tuple
      range.value = [value[0] as string, value[1] as string];
    }

    // Accept CheckedType from antd and optional event, then coerce to boolean
    function onBreakdownChange(checked: boolean | string | number | null | undefined) {
      breakdown.value = Boolean(checked);
    }

    function disabledFuture(current: ConfigType | null) {
      const d = toDayjs(current);
      if (!d) return false;
      return d.isAfter(dayjs());
    }

    async function apply() {
      if (!canApply.value) return;
      loading.value = true;
      try {
        // when range.value is string tuple, convert to Dayjs if you need ISO
        if (Array.isArray(range.value) && typeof range.value[0] === 'string') {
          const s = toDayjs(range.value[0]);
          const e = toDayjs(range.value[1]);
          const iso = {
            startUtc: s ? s.toISOString() : undefined,
            endUtc: e ? e.toISOString() : undefined
          };
          emit('apply', {
            preset: preset.value === 'All' ? undefined : preset.value,
            startUtc: iso.startUtc,
            endUtc: iso.endUtc,
            breakdown: breakdown.value
          });
          return;
        }

        const iso = toIsoRangeSafe(range.value as [Dayjs, Dayjs] | undefined);
        emit('apply', {
          preset: preset.value === 'All' ? undefined : preset.value,
          startUtc: iso.startUtc,
          endUtc: iso.endUtc,
          breakdown: breakdown.value
        });
      } finally {
        loading.value = false;
      }
    }

    // init
    onPresetChange();

    return {
      preset,
      range,
      breakdown,
      loading,
      onPresetChange,
      onRangeChange,
      onBreakdownChange,
      disabledFuture,
      apply,
      canApply
    };
  }
});
</script>

<style scoped>
.filter-dashboard { gap: 12px; align-items: center; }
</style>
