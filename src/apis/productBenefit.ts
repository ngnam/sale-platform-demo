import {
  ProductBenefitListDto,
  ProductBenefitDto,
  CreateProductBenefitReq,
  UpdateProductBenefitReq,
} from "./types/productBenefit";
import { get, post, put, del } from "@/utils/http";

const URL = {
  base: (planId: string) => `/product-plans/${encodeURIComponent(planId)}/benefits`,
};

const getAll = async (planId: string) =>
  get<ProductBenefitListDto[]>(URL.base(planId));

const getDetail = async (planId: string, benefitId: string) =>
  get<ProductBenefitDto>(`${URL.base(planId)}/${encodeURIComponent(benefitId)}`);

const create = async (planId: string, data: CreateProductBenefitReq) =>
  post<ProductBenefitDto>(URL.base(planId), data);

const update = async (planId: string, benefitId: string, data: UpdateProductBenefitReq) =>
  put<void>(`${URL.base(planId)}/${encodeURIComponent(benefitId)}`, data);

const remove = async (planId: string, benefitId: string) =>
  del<void>(`${URL.base(planId)}/${encodeURIComponent(benefitId)}`);

export const ProductBenefitApi = { getAll, getDetail, create, update, remove };
