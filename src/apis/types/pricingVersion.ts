// pricingVersion.ts
// TypeScript interfaces converted from MapLifeDemo.DTOs C# records

import { Dayjs } from "dayjs";

export type PricingVersionStatus = "DRAFT" | "REVIEW" | "APPROVED";

export interface PricingVersionDto {
  /** Khóa phiên bản định phí (PRC_2025_09) */
  pricingVersionId: string;
  /** Ngày bắt đầu hiệu lực (UTC or ISO string) */
  effectiveFrom: string;
  /** Ngày kết thúc hiệu lực (nullable) */
  effectiveTo?: string;
  /** Trạng thái phiên bản */
  status: PricingVersionStatus;
  /** Người tạo (nullable) */
  createdBy?: string | null;
  /** Thời gian tạo */
  createdAt: string;
  [key: string]: any;
}

export interface CreatePricingVersionReq {
  /** Bắt buộc: mã phiên bản */
  pricingVersionId: string;
  /** Bắt buộc: ngày bắt đầu hiệu lực */
  effectiveFrom: string;
  /** Ngày kết thúc hiệu lực (tùy chọn) */
  effectiveTo?: string;
  /** Người tạo (tùy chọn) */
  createdBy?: string;
  status?: PricingVersionStatus;
}

export interface UpdatePricingVersionReq {
  /** Bắt buộc: ngày bắt đầu hiệu lực */
  effectiveFrom: string;
  /** Ngày kết thúc hiệu lực (tùy chọn) */
  effectiveTo?: string;
  /** Bắt buộc: trạng thái mới */
  status: PricingVersionStatus;
}
