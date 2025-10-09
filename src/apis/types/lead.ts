export interface LeadResult {
  leadId: string;

  // ======= Thông tin cơ bản (cá nhân) =======
  givenNames?: string;
  familyName?: string;
  fullName: string;
  gender?: string;
  dob?: string;
  otherNames?: string;
  birthCountry?: string;
  idType?: string;
  idNumber?: string;
  idIssueDate?: string;
  idExpiryDate?: string;
  idIssuePlace?: string;
  nationality?: string;
  secondaryNationality?: string;
  maritalStatus?: string;
  ethnicity?: string;
  employerName?: string;
  annualIncome?: number;
  incomeCurrency?: string;

  // ======= Thông tin liên lạc =======
  mobilePhone?: string;
  otherPhone?: string;
  email?: string;
  allowNotifySms: boolean;
  allowNotifyEmail: boolean;
  allowNotifyPhone: boolean;

  // ======= Địa chỉ =======
  permanentAddressType?: string;
  permanentAddressLine?: string;
  permanentCountry?: string;
  permanentProvince?: string;
  permanentDistrict?: string;
  permanentWard?: string;

  currentAddressType?: string;
  currentAddressLine?: string;
  currentCountry?: string;
  currentProvince?: string;
  currentDistrict?: string;
  currentWard?: string;
  isCurrentAddressSameAsPermanent?: boolean;

  // ======= Thuế / FATCA =======
  isUSTaxResident?: boolean;
  usTaxId?: string;
  orgHasUSControlPerson?: boolean;

  // ======= Tổ chức =======
  organizationName?: string;
  tradeName?: string;
  businessRegistrationNumber?: string;
  businessRegistrationIssueDate?: string;
  businessRegistrationIssuePlace?: string;
  taxNumber?: string;
  taxNumberIssueDate?: string;
  taxNumberIssuePlace?: string;
  businessActivity?: string;
  organizationPhone?: string;
  organizationEmail?: string;
  organizationFax?: string;
  organizationHeadquarterAddressLine?: string;
  organizationHeadquarterCountry?: string;
  organizationHeadquarterProvince?: string;
  organizationHeadquarterDistrict?: string;
  organizationHeadquarterWard?: string;
  organizationForeignAddress?: string;

  // ======= Người đại diện =======
  representativeGivenNames?: string;
  representativeFamilyName?: string;
  representativeFullName?: string;
  representativeDob?: string;
  representativeGender?: string;
  representativeIdType?: string;
  representativeIdNumber?: string;
  representativeIdIssueDate?: string;
  representativeIdExpiryDate?: string;
  representativeIdIssuePlace?: string;
  representativeNationality?: string;
  representativeSecondaryNationality?: string;
  representativeEmail?: string;
  representativePhone?: string;

  // ======= Metadata =======
  isOrganization: boolean;
  createdAt: string;
  updatedAt?: string;

  // mở rộng
  [key: string]: any;
}

export interface LeadReqParams {
  pageSize: number; // default: 10
  page: number; // default: 1
  [key: string]: any;
}

export interface LeadCreateReq {
  // Basic
  /** full họ và tên */
  fullName: string;
  /** tên */
  givenNames?: string;
  /** tên đệm và tên */
  familyName?: string;
  /** Giới tính */
  gender?: string;
  /** Ngày sinh (ISO string) */
  dob?: string;
  /** Tên khác (biệt danh, tên khai sinh, tên cũ...) */
  otherNames?: string;
  /** Tên công ty nơi đang làm việc */
  employerName?: string;
  /** Nơi sinh */
  birthCountry?: string;
  /** Loại giấy tờ định danh (CMND, Hộ chiếu, GPLX...) */
  idType?: string;
  /** Số giấy tờ định danh */
  idNumber?: string;
  /** Ngày cấp (ISO string) */
  idIssueDate?: string;
  /** Ngày hết hạn (ISO string) */
  idExpiryDate?: string;
  /** Nơi cấp */
  idIssuePlace?: string;
  /** Quốc tịch */
  nationality?: string;
  /** Quốc tịch thứ hai */
  secondaryNationality?: string;
  /** Tình trạng hôn nhân */
  maritalStatus?: string;
  /** Dân tộc */
  ethnicity?: string;

  // Contact
  /** Số điện thoại di động */
  mobilePhone?: string;
  /** Số điện thoại khác */
  otherPhone?: string;
  /** Địa chỉ email */
  email?: string;
  /** Cho phép nhận thông báo qua SMS */
  allowNotifySms: boolean;
  /** Cho phép nhận thông báo qua Email */
  allowNotifyEmail: boolean;
  /** Cho phép nhận thông báo qua cuộc gọi điện thoại */
  allowNotifyPhone: boolean;

  // Addresses
  /** Loại địa chỉ thường trú (nếu có) */
  permanentAddressType?: string;
  /** Địa chỉ thường trú */
  permanentAddressLine?: string;
  /** Quốc gia thường trú */
  permanentCountry?: string;
  /** Tỉnh/Thành phố thường trú */
  permanentProvince?: string;
  /** Quận/Huyện thường trú */
  permanentDistrict?: string;
  /** Phường/Xã thường trú */
  permanentWard?: string;

  /** Loại địa chỉ hiện tại (nếu có) */
  currentAddressType?: string;
  /** Địa chỉ hiện tại */
  currentAddressLine?: string;
  /** Quốc gia hiện tại */
  currentCountry?: string;
  /** Tỉnh/Thành phố hiện tại */
  currentProvince?: string;
  /** Quận/Huyện hiện tại */
  currentDistrict?: string;
  /** Phường/Xã hiện tại */
  currentWard?: string;
  /** Địa chỉ hiện tại có giống địa chỉ thường trú không */
  isCurrentAddressSameAsPermanent: boolean;

  // Other
  /** Thu nhập hàng năm */
  annualIncome?: number;
  /** Loại tiền tệ thu nhập */
  incomeCurrency?: string;
  /** Có phải là cư dân thuế Mỹ không */
  isUSTaxResident: boolean;
  /** Mã số thuế Mỹ (nếu có) */
  usTaxId?: string;

  // Organization
  /** Tổ chức có người kiểm soát là cư dân thuế Mỹ không */
  orgHasUSControlPerson: boolean;
  /** Cờ: là tổ chức hay cá nhân */
  isOrganization: boolean;
  /** Tên công ty (nếu là tổ chức) - ghi thêm cho hiển thị */
  organizationName?: string;
  /** Tên công ty viết tắt */
  tradeName?: string;
  /** Số giấy phép kinh doanh / registration */
  businessRegistrationNumber?: string;
  /** Ngày cấp giấy phép KD (ISO string) */
  businessRegistrationIssueDate?: string;
  /** Nơi cấp giấy phép KD */
  businessRegistrationIssuePlace?: string;
  /** Mã số thuế doanh nghiệp */
  taxNumber?: string;
  /** Ngày cấp mã số thuế (ISO string) */
  taxNumberIssueDate?: string;
  /** Nơi cấp mã số thuế */
  taxNumberIssuePlace?: string;
  /** Lĩnh vực hoạt động */
  businessActivity?: string;
  /** Số điện thoại công ty */
  organizationPhone?: string;
  /** Email công ty */
  organizationEmail?: string;
  /** Fax */
  organizationFax?: string;
  /** Địa chỉ trụ sở chính */
  organizationHeadquarterAddressLine?: string;
  /** Quốc gia trụ sở chính */
  organizationHeadquarterCountry?: string;
  /** Tỉnh/Thành phố trụ sở chính */
  organizationHeadquarterProvince?: string;
  /** Quận/Huyện trụ sở chính */
  organizationHeadquarterDistrict?: string;
  /** Phường/Xã trụ sở chính */
  organizationHeadquarterWard?: string;
  /** Địa chỉ nước ngoài (nếu có) */
  organizationForeignAddress?: string;

  // Representative (optional)
  /** Họ và tên người đại diện */
  representativeFullName?: string;
  /** Given names (người đại diện) */
  representativeGivenNames?: string;
  /** Family name (người đại diện) */
  representativeFamilyName?: string;
  /** Ngày sinh người đại diện (ISO string) */
  representativeDob?: string;
  /** Giới tính người đại diện */
  representativeGender?: string;
  /** Loại giấy tờ người đại diện */
  representativeIdType?: string;
  /** Số giấy tờ người đại diện */
  representativeIdNumber?: string;
  /** Ngày cấp giấy tờ người đại diện (ISO string) */
  representativeIdIssueDate?: string;
  /** Ngày hết hạn giấy tờ người đại diện (ISO string) */
  representativeIdExpiryDate?: string;
  /** Nơi cấp giấy tờ người đại diện */
  representativeIdIssuePlace?: string;
  /** Quốc tịch người đại diện */
  representativeNationality?: string;
  /** Quốc tịch thứ hai người đại diện */
  representativeSecondaryNationality?: string;
  /** Email người đại diện */
  representativeEmail?: string;
  /** Số điện thoại người đại diện */
  representativePhone?: string;

  // App creation
  createApp?: boolean;
  appOptions?: CreateAppOptionReq;
}


export interface CreateAppOptionReq {
  createQuote?: any; // map CreateQuoteDto nếu có interface riêng
  applicantSnapshot?: any;
  createdBy?: string;
}

export interface LeadUpdateReq extends LeadCreateReq {
  leadId: string;
}

export interface ImportResult {
  created: number;
  skipped: number;
  errors: string[];
}
