import { PagedResult } from "./types/common";
import {
  TermRateListDto,
  TermRateDetailDto,
  CreateTermRateReq,
  UpdateTermRateReq,
  TermRateQuery,
} from "./types/termRate";
import { get, post, put, del } from "@/utils/http";

const URL = {
  base: "/TermRates",
  // detail path built from composite key components
  detail: (k: {
    pricingVersionId: string;
    planId: string;
    age: number;
    sex: string;
    smoker: boolean;
    termMonths: number;
    mode: string;
  }) =>
    `${URL.base}/${encodeURIComponent(k.pricingVersionId)}/${encodeURIComponent(k.planId)}/${encodeURIComponent(
      String(k.age)
    )}/${encodeURIComponent(k.sex)}/${encodeURIComponent(String(k.smoker))}/${encodeURIComponent(
      String(k.termMonths)
    )}/${encodeURIComponent(k.mode)}`,
};

const query = async (params: TermRateQuery & { page?: number; pageSize?: number; q?: string }) =>
  get<PagedResult<TermRateListDto>>(URL.base, params);

const getDetail = async (key: {
  pricingVersionId: string;
  planId: string;
  age: number;
  sex: string;
  smoker: boolean;
  termMonths: number;
  mode: string;
}) => get<TermRateDetailDto>(URL.detail(key));

const create = async (data: CreateTermRateReq) => post<TermRateDetailDto>(URL.base, data);

const update = async (
  key: {
    pricingVersionId: string;
    planId: string;
    age: number;
    sex: string;
    smoker: boolean;
    termMonths: number;
    mode: string;
  },
  data: UpdateTermRateReq
) => put<void>(URL.detail(key), data);

const remove = async (key: {
  pricingVersionId: string;
  planId: string;
  age: number;
  sex: string;
  smoker: boolean;
  termMonths: number;
  mode: string;
}) => del<void>(URL.detail(key));

const clear = async (params: {
  pricingVersionId?: string;
  planId?: string;
}) => post<void>(URL.base + "/clear", params);

export const TermRateApi = {
  query,
  getDetail,
  create,
  update,
  remove,
  clear
};
