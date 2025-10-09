import { PlanVersionDto } from "./planVersion";
import { ProductBenefitDto } from "./productBenefit";

/** List DTO for product plans */
export interface ProductPlanListDto {
  planId: string;
  productType: string;
  name: string;
  currency: string;
  [key: string]: any;
}

/** Detail DTO for product plan including versions and benefits */
export interface ProductPlanDetailDto {
  planId: string;
  productType: string;
  name: string;
  currency: string;
  planVersions: PlanVersionDto[];
  productBenefits: ProductBenefitDto[];
}

/** DTO used to create a product plan (client -> server) */
export interface CreateProductPlanReq {
  planId: string;
  productType: string;
  name: string;
  currency?: string | null;
}

/** DTO used to update a product plan (client -> server) */
export interface UpdateProductPlanReq {
  productType: string;
  name: string;
  currency?: string | null;
}
