import { PagedResult } from './types/common';
import { CreateTermRateReq } from './types/termRate';
import { post } from '@/utils/http';

const URL = {
  seed: '/TermRates/seed',
  seedBulk: '/TermRates/seed/bulk', // optional bulk endpoint
};

export interface SeedRow {
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

// single bulk-create call that accepts an array of CreateTermRateReq
const seed = async (rows: CreateTermRateReq[]) => post<void>(URL.seedBulk, rows);

export const TermRateSeedApi = { seed };
