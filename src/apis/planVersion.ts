import {
  PlanVersionDto,
  CreatePlanVersionReq,
  UpdatePlanVersionReq,
} from "./types/planVersion";
import { get, post, put, del } from "@/utils/http";

const URL = {
  base: (planId: string) => `/product-plans/${encodeURIComponent(planId)}/versions`,
};

const getAll = async (planId: string) =>
  get<PlanVersionDto[]>(URL.base(planId));

const getDetail = async (planId: string, pricingVersionId: string) =>
  get<PlanVersionDto>(`${URL.base(planId)}/${encodeURIComponent(pricingVersionId)}`);

const create = async (planId: string, data: CreatePlanVersionReq) =>
  post<PlanVersionDto>(URL.base(planId), data);

const update = async (planId: string, pricingVersionId: string, data: UpdatePlanVersionReq) =>
  put<void>(`${URL.base(planId)}/${encodeURIComponent(pricingVersionId)}`, data);

const remove = async (planId: string, pricingVersionId: string) =>
  del<void>(`${URL.base(planId)}/${encodeURIComponent(pricingVersionId)}`);

export const PlanVersionApi = { getAll, getDetail, create, update, remove };
