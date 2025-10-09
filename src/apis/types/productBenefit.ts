import { BenefitScaleEntryDto } from "./benefitScaleEntry";

/** List DTO for product benefits */
export interface ProductBenefitListDto {
  benefitId: string;
  planId: string;
  benefitCode: string;
  benefitName: string;
  benefitType: string;
}

/** Detail DTO for a product benefit including scale entries */
export interface ProductBenefitDto {
  benefitId: string;
  planId: string;
  benefitCode: string;
  benefitName: string;
  benefitType: string;
  payableEvent: string;
  limitAmount?: number | null;
  calculationBasis: string;
  notes: string;
  createdAt: string; // ISO date string
  benefitScaleEntries: BenefitScaleEntryDto[];
}

/** DTO used to create a product benefit (client -> server) */
export interface CreateProductBenefitReq {
  benefitId: string;
  benefitCode: string;
  benefitName: string;
  benefitType: string;
  payableEvent: string;
  limitAmount?: number | null;
  calculationBasis?: string | null;
  notes?: string | null;
}

/** DTO used to update a product benefit (client -> server) */
export interface UpdateProductBenefitReq {
  benefitCode?: string | null;
  benefitName?: string | null;
  benefitType?: string | null;
  payableEvent?: string | null;
  limitAmount?: number | null;
  calculationBasis?: string | null;
  notes?: string | null;
}
