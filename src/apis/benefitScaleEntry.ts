import {
  BenefitScaleEntryListDto,
  BenefitScaleEntryDto,
  CreateBenefitScaleEntryReq,
  UpdateBenefitScaleEntryReq,
} from "./types/benefitScaleEntry";
import { get, post, put, del } from "@/utils/http";

const URL = {
  base: (planId: string, benefitId: string) =>
    `/product-plans/${encodeURIComponent(planId)}/benefits/${encodeURIComponent(benefitId)}/scales`,
};

const getAll = async (planId: string, benefitId: string) =>
  get<BenefitScaleEntryListDto[]>(URL.base(planId, benefitId));

const getDetail = async (planId: string, benefitId: string, scaleId: string) =>
  get<BenefitScaleEntryDto>(`${URL.base(planId, benefitId)}/${encodeURIComponent(scaleId)}`);

const create = async (planId: string, benefitId: string, data: CreateBenefitScaleEntryReq) =>
  post<BenefitScaleEntryDto>(URL.base(planId, benefitId), data);

const update = async (planId: string, benefitId: string, scaleId: string, data: UpdateBenefitScaleEntryReq) =>
  put<void>(`${URL.base(planId, benefitId)}/${encodeURIComponent(scaleId)}`, data);

const remove = async (planId: string, benefitId: string, scaleId: string) =>
  del<void>(`${URL.base(planId, benefitId)}/${encodeURIComponent(scaleId)}`);

export const BenefitScaleEntryApi = { getAll, getDetail, create, update, remove };
