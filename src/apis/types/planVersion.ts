/** DTO returned by API for a plan version */
export interface PlanVersionDto {
  planId: string;
  pricingVersionId: string;
  roundingPremium?: string | null;
  roundingCashVal?: string | null;
}

/** DTO to create a new plan version (client -> server) */
export interface CreatePlanVersionReq {
  pricingVersionId: string;
  roundingPremium?: string | null;
  roundingCashVal?: string | null;
}

/** DTO to update an existing plan version (client -> server) */
export interface UpdatePlanVersionReq {
  roundingPremium?: string | null;
  roundingCashVal?: string | null;
}
