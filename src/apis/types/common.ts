// src/apis/types/common.ts
export interface ResponseData<T> {
  code?: number;
  message?: string;
  data?: T;
}
export interface PagedResult<T> {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: T[];
}
