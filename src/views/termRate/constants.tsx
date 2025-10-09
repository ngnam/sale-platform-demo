// src/views/termRate/constants.tsx
import type { ColumnProps } from 'ant-design-vue/es/table';
import type { TermRateListDto } from '@/apis/types/termRate';

/**
 * Columns for TermRate table (term months based).
 * Action column rendered by component using table bodyCell slot.
 */
export const termRateColumns: ColumnProps<TermRateListDto>[] = [
  { title: 'No', dataIndex: 'index', key: 'index', width: 80 },
  { title: 'Pricing Version', dataIndex: 'pricingVersionId', key: 'pricingVersionId', width: 180 },
  { title: 'Plan Id', dataIndex: 'planId', key: 'planId', width: 160 },
  { title: 'Age', dataIndex: 'age', key: 'age', width: 90 },
  { title: 'Sex', dataIndex: 'sex', key: 'sex', width: 80 },
  { title: 'Smoker', dataIndex: 'smoker', key: 'smoker', width: 100 },
  { title: 'Term (months)', dataIndex: 'termMonths', key: 'termMonths', width: 120 },
  { title: 'Mode', dataIndex: 'mode', key: 'mode', width: 120 },
  { title: 'One Time', dataIndex: 'isOneTime', key: 'isOneTime', width: 100 },
  { title: 'Rate /1000', dataIndex: 'ratePer1000', key: 'ratePer1000', width: 200 },
  { title: 'TermYearsFactor', dataIndex: 'termYearsFactor', key: 'termYearsFactor', width: 140 },
  { title: 'Action', key: 'action', fixed: 'right', width: 160 },
];
