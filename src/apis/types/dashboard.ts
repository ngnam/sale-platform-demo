// src/apis/types/dashboard.ts
export type DashboardRangePreset = 'Today' | 'ThisWeek' | 'ThisMonth' | 'All';

export interface DashboardSummaryQuery {
  preset?: DashboardRangePreset;
  startUtc?: string; // ISO string
  endUtc?: string;   // ISO string
  breakdown?: boolean;
}

export interface DashboardSummaryDto {
  totalLeads: number;
  totalApps: number;
  totalIllustrations: number;
  [key: string]: any;
}
