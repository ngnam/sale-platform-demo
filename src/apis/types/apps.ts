export interface AppListDto {
  appId: string;                // Guid -> string
  status: string;
  createdAt: string;            // DateTime -> string (ISO 8601)
  updatedAt?: string | null;    // DateTime? -> optional string | null

  // Navigation: Lead summary
  lead?: LeadSummaryDto | null;
}

export interface LeadSummaryDto {
  leadId: string;               // Guid -> string
  fullName: string;             // Họ và tên
  gender?: string | null;       // Giới tính
  idNumber?: string | null;     // Số giấy tờ tùy thân
  email?: string | null;        // Email
  employerName?: string | null; // Tên công ty
  organizationName?: string | null;
  taxNumber?: string | null;    // Mã số thuế doanh nghiệp
  isOrganization: boolean;      // Loại khách hàng
  [key: string]: any;
}


export interface AppsReqParams {
  pageSize: number; // default: 10
  page: number; // default: 1
  leadId?: string;
  [key: string]: any;
}

export interface CreateAppFromLeadReq {
  leadId: string;
  createQuote?: CreateQuoteReq; // optional
  createdBy?: string;
  applicantSnapshot?: any; // object linh hoạt
}

export interface CreateQuoteReq {
  appId?: string; // Guid? => optional string
  planId: string;
  pricingVersionId: string;
  mode: string; // "MONTHLY" | "ONE_TIME"
  sumAssured: number;
  termYears?: number;
  termMonths?: number;
  insuredAge: number;
  insuredSex: string;
  insuredSmoker: boolean;
  riders?: CreateQuoteRiderReq[];
}

// Nếu bạn có CreateQuoteRiderDto thì map sang interface riêng
export interface CreateQuoteRiderReq {
  // định nghĩa các field theo CreateQuoteRiderDto
  riderCode: string;
  riderSaOrUnits: number;
  units: number;
}

export interface CreateAppResult {
  appId: string;
  leadId: string;
  quoteId?: number; // long? => optional number
  calcTraceId?: string; // string? => optional
  status: string;
  createdAt: string;
}

export interface QuoteDtoByApp {
  quoteId: number;
  planId: string;
  pricingVersionId: string;
  mode: string;
  sumAssured: number;
  termMonths: number;
  totalPremium: number;
  status: string;
  createdAt: string; // ISO date string từ backend
}
