// src/api/types/termRate.ts

export interface TermRateListDto {
  pricingVersionId: string;
  planId: string;
  age: number;
  sex: string;
  smoker: boolean;
  termMonths: number;
  mode: string;
  isOneTime: boolean;
  ratePer1000: number;
  termYearsFactor: number;
}

export interface TermRateDetailDto extends TermRateListDto { }

export interface CreateTermRateReq {
  pricingVersionId: string;
  planId: string;
  age: number;
  sex: string;
  smoker: boolean;
  termMonths: number;
  mode?: string;
  isOneTime?: boolean;
  ratePer1000: number;
  termYearsFactor?: number;
}

export interface UpdateTermRateReq {
  ratePer1000?: number;
  termYearsFactor?: number;
  mode?: string;
  isOneTime?: boolean;
}

export interface TermRateQuery {
  pricingVersionId?: string;
  planId?: string;
  age?: number;
  sex?: string;
  smoker?: boolean;
  termMonths?: number;
  mode?: string;
  page?: number;
  pageSize?: number;
}
