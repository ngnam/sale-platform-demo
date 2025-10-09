import { PagedResult } from "./types/common";
import {
  ProductPlanListDto,
  ProductPlanDetailDto,
  CreateProductPlanReq,
  UpdateProductPlanReq,
} from "./types/productPlan";
import { get, post, put, del } from "@/utils/http";

const URL = {
  base: "/product-plans",
};

const getAll = async (params: { page?: number; pageSize?: number; q?: string }) =>
  get<PagedResult<ProductPlanListDto>>(URL.base, params);

const getDetail = async (planId: string) =>
  get<ProductPlanDetailDto>(`${URL.base}/${encodeURIComponent(planId)}`);

const create = async (data: CreateProductPlanReq) =>
  post<ProductPlanDetailDto>(URL.base, data);

const update = async (planId: string, data: UpdateProductPlanReq) =>
  put<void>(`${URL.base}/${encodeURIComponent(planId)}`, data);

const remove = async (planId: string) =>
  del<void>(`${URL.base}/${encodeURIComponent(planId)}`);

export const ProductPlanApi = { getAll, getDetail, create, update, remove };
