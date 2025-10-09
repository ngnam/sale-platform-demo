// src/api/types/rider.ts

export interface RiderMasterDto {
  riderCode: string;
  name: string;
  basis?: 'per_1000' | 'per_unit' | 'percent_of_base' | string;
}

export interface CreateRiderMasterDto {
  riderCode: string;
  name: string;
  basis?: 'per_1000' | 'per_unit' | 'percent_of_base' | string;
}

export interface UpdateRiderMasterDto {
  name: string;
  basis?: 'per_1000' | 'per_unit' | 'percent_of_base' | string;
}

export interface RiderRateDto {
  pricingVersionId: string;
  riderCode: string;
  ageMin: number;
  ageMax: number;
  ratePer1000?: number;
  ratePerUnit?: number;
  percentOfBase?: number;
}

export interface CreateRiderRateDto {
  pricingVersionId: string;
  riderCode: string;
  ageMin: number;
  ageMax: number;
  ratePer1000?: number | null;
  ratePerUnit?: number | null;
  percentOfBase?: number | null;
}

export interface UpdateRiderRateDto {
  ageMin: number;
  ageMax: number;
  ratePer1000?: number | null;
  ratePerUnit?: number | null;
  percentOfBase?: number | null;
}
