/** List DTO for benefit scale entries returned by API */
export interface BenefitScaleEntryListDto {
  scaleId: string;
  seqNo: number;
  injuryCode: string;
  payPct?: number;
  payAmount?: number;
}

/** Detail DTO for a benefit scale entry returned by API */
export interface BenefitScaleEntryDto {
  scaleId: string;
  benefitId: string;
  seqNo: number;
  injuryCode: string;
  injuryDesc: string;
  payPct?: number;
  payAmount?: number;
  side: string;
  effectiveFrom: string; // ISO date string
  effectiveTo?: string; // ISO date string or null
  notes: string;
}

/** DTO used to create a benefit scale entry (client -> server) */
export interface CreateBenefitScaleEntryReq {
  scaleId: string;
  seqNo: number;
  injuryCode: string;
  injuryDesc: string;
  payPct?: number;
  payAmount?: number;
  side: string;
  effectiveFrom: string; // ISO date string
  effectiveTo?: string; // ISO date string or null
  notes?: string;
}

/** DTO used to update a benefit scale entry (client -> server) */
export interface UpdateBenefitScaleEntryReq {
  seqNo?: number;
  injuryCode?: string;
  injuryDesc?: string;
  payPct?: number;
  payAmount?: number;
  side?: string;
  effectiveFrom?: string; // ISO date string
  effectiveTo?: string; // ISO date string
  notes?: string;
}
