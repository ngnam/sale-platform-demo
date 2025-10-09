import {
  PricingVersionDto,
  CreatePricingVersionReq,
  UpdatePricingVersionReq,
} from "./types/pricingVersion";
import { get, post, put, del } from "@/utils/http";

const URL = {
  base: (planId: string) =>
    `/plans/${encodeURIComponent(planId)}/pricing-versions`,
};

const getAll = async (planId: string) =>
  get<PricingVersionDto[]>(URL.base(planId));

const getDetail = async (planId: string, pricingVersionId: string) =>
  get<PricingVersionDto>(
    `${URL.base(planId)}/${encodeURIComponent(pricingVersionId)}`
  );

const create = async (planId: string, data: CreatePricingVersionReq) =>
  post<PricingVersionDto>(URL.base(planId), data);

const update = async (
  planId: string,
  pricingVersionId: string,
  data: UpdatePricingVersionReq
) =>
  put<void>(
    `${URL.base(planId)}/${encodeURIComponent(pricingVersionId)}`,
    data
  );

const remove = async (planId: string, pricingVersionId: string) =>
  del<void>(`${URL.base(planId)}/${encodeURIComponent(pricingVersionId)}`);

export const PricingVersionApi = { getAll, getDetail, create, update, remove };
