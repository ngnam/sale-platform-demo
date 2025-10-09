// src/apis/dashboard.ts
import { get } from "@/utils/http";
import type {
  DashboardSummaryDto,
  DashboardSummaryQuery,
} from "./types/dashboard";

export const DashboardApi = {
  // GET /api/dashboard/summary?preset=ThisMonth&breakdown=false
  async summary(query: DashboardSummaryQuery): Promise<DashboardSummaryDto> {
    const params: Record<string, any> = {};
    if (query.preset) params.preset = query.preset;
    if (query.startUtc) params.startUtc = query.startUtc;
    if (query.endUtc) params.endUtc = query.endUtc;
    if (typeof query.breakdown !== "undefined")
      params.breakdown = query.breakdown;
    return get<DashboardSummaryDto>("/dashboard/summary", params);
  },
};
