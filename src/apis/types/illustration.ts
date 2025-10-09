// illustration.ts
export interface CreateIllustrationReq {
  quoteId: number;
  scenarios?: string[]; // default ["BASE"] if not provided by client
  projectionMonths?: number | null; // null = use quote.termMonths
}

export interface IllustrationReqParams {
  pageSize: number; // default: 10
  page: number; // default: 1
  [key: string]: any;
}

// Danh sách minh họa (tóm tắt)
export interface IllustrationListDto {
  illuId: number;              // long -> number
  quoteId: number;
  planId: string;
  pricingVersionId: string;
  projectionMonths: number;
  projectionYears: number;
  scenarios?: string | null;
  pdfUri?: string | null;
  status: string;              // "ACTIVE" | ...
  generatedAt: string;         // DateTime -> ISO string
  generatedBy?: string | null;

  // Thông tin tóm tắt từ Quote
  sumAssured: number;
  totalPremium: number;
  insuredAge: number;
  insuredSex: string;
}

// Chi tiết minh họa
export interface IllustrationDetailDto {
  illuId: number;
  quoteId: number;
  planId: string;
  pricingVersionId: string;
  projectionMonths: number;
  projectionYears: number;
  scenarios?: string | null;
  pdfUri?: string | null;
  checksum?: string | null;
  calcTraceId?: string | null;
  generatedBy?: string | null;
  generatedAt: string;

  // Quote summary
  sumAssured: number;
  termMonths: number;
  insuredAge: number;
  insuredSex: string;
  insuredSmoker: boolean;
  totalPremium: number;

  riders: QuoteRiderDto[];
  illuYearlies: IlluYearlyDto[];
}

// Rider trong báo giá
interface QuoteRiderDto {
  riderCode: string;
  riderSaOrUnits: number;
  riderPremium: number;
}

// Dữ liệu minh họa theo năm
export interface IlluYearlyDto {
  scenario: string;        // BASE/GUAR/HIGH
  policyYear: number;
  premiumAnnual: number;
  gcv: number;
}
