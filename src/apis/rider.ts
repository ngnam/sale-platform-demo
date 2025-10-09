// src/api/rider.ts
import { get, post, put, del } from "@/utils/http";
import type {
  RiderMasterDto,
  RiderRateDto,
  CreateRiderMasterDto,
  UpdateRiderMasterDto,
  CreateRiderRateDto,
  UpdateRiderRateDto,
} from "@/apis/types/rider";
import { PagedResult } from "./types/common";

const BASE = "/riders";

export const RiderApi = {
  // Rider Master
  queryMasters: (q?: string) =>
    get<RiderMasterDto[]>(`${BASE}/masters`, { params: { q } }),
  getMaster: (riderCode: string) =>
    get<RiderMasterDto>(`${BASE}/masters/${encodeURIComponent(riderCode)}`),
  createMaster: (payload: CreateRiderMasterDto) =>
    post(`${BASE}/masters`, payload),
  updateMaster: (riderCode: string, payload: UpdateRiderMasterDto) =>
    put(`${BASE}/masters/${encodeURIComponent(riderCode)}`, payload),
  deleteMaster: (riderCode: string) =>
    del(`${BASE}/masters/${encodeURIComponent(riderCode)}`),

  // Rider Rate
  queryRates: (params?: { pricingVersionId?: string; riderCode?: string, [key: string]: any }) =>
    get<PagedResult<RiderRateDto[]>>(`${BASE}/rates`, params),
  getRateByAge: (pricingVersionId: string, riderCode: string, age: number) =>
    get<RiderRateDto>(
      `${BASE}/rates/${encodeURIComponent(
        pricingVersionId
      )}/${encodeURIComponent(riderCode)}/${age}`
    ),
  createRate: (payload: CreateRiderRateDto) => post(`${BASE}/rates`, payload),
  updateRate: (
    pricingVersionId: string,
    riderCode: string,
    ageMin: number,
    ageMax: number,
    payload: UpdateRiderRateDto
  ) =>
    put(
      `${BASE}/rates/${encodeURIComponent(
        pricingVersionId
      )}/${encodeURIComponent(riderCode)}/${ageMin}/${ageMax}`,
      payload
    ),
  deleteRate: (
    pricingVersionId: string,
    riderCode: string,
    ageMin: number,
    ageMax: number
  ) =>
    del(
      `${BASE}/rates/${encodeURIComponent(
        pricingVersionId
      )}/${encodeURIComponent(riderCode)}/${ageMin}/${ageMax}`
    ),
};
