export interface QuoteReqParams {
  pageSize: number; // default: 10
  page: number; // default: 1
  appId?: string;
  [key: string]: any;
}

export interface RiderDetailResult {
  riderCode?: string;
  units?: number;
  premium?: number;
  [key: string]: any;
}

export interface CreateQuoteDto {
  appId?: string | null;
  planId: string;
  pricingVersionId: string;
  mode: string;
  sumAssured: number;
  termYears?: number | null;
  termMonths?: number | null;
  insuredAge: number;
  insuredSex: string;
  insuredSmoker: boolean;
  riders?: Array<{ riderCode: string; riderSaOrUnits: number; units: number }>;
}

export interface CreateQuoteResult {
  quoteId: number;
  mode?: string;
  modeDescription?: string;
  paymentFrequency?: string;
  totalPremium?: number;
  breakdownBase?: number;
  riders?: RiderDetailResult[];
  illustrationId?: number;
  pdfUri?: string;
  [key: string]: any;
}

// Danh sách báo giá (tóm tắt)
export interface QuoteListDto {
  quoteId: number;             // long -> number
  planId: string; // Mã sản phẩm
  pricingVersionId: string; // Phiên bản định phí
  mode: string;                // "MONTHLY" | "ONE_TIME"
  sumAssured: number; // Số tiền bảo hiểm
  termMonths: number;
  totalPremium: number;
  status: string;              // "ACTIVE" | "INACTIVE"
  createdAt: string;           // DateTime -> ISO string

  // Thông tin người được bảo hiểm
  insuredAge: number; // Tuổi người được bảo hiểm
  insuredSex: string; //giới tính
  insuredSmoker: boolean; //hút thuốc
}

// Chi tiết báo giá
export interface QuoteDetailDto {
  quoteId: number;
  appId?: string | null;       // Guid? -> string | null
  planId: string;
  pricingVersionId: string;
  mode: string;
  modeDescription?: string | null;
  paymentFrequency?: string | null;

  sumAssured: number;
  termMonths: number;
  insuredAge: number;
  insuredSex: string;
  insuredSmoker: boolean;

  // Breakdown
  breakdownBase: number;
  breakdownRiders: number;
  breakdownFee: number;
  breakdownTax: number;
  totalPremium: number;

  calcTraceId?: string | null;
  status: string;
  createdBy?: string | null;
  createdAt: string;

  riders: QuoteRiderDto[];
}

// Rider trong báo giá
interface QuoteRiderDto {
  riderCode: string;
  riderSaOrUnits: number;
  riderPremium: number;
}

