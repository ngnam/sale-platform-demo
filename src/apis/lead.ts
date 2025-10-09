import { PagedResult } from "./types/common";
import { ImportResult, LeadCreateReq, LeadReqParams, LeadResult, LeadUpdateReq } from "./types/lead";
import { del, get, post, put } from "@/utils/http";

const URL = {
  lead: "/Leads",
};

// get all
const getAll = async (params: LeadReqParams) =>
  get<PagedResult<LeadResult>>(URL.lead, params);

// get detail
const getDetail = async (id: string) => get<LeadResult>(URL.lead + `/${id}`);

// create
const create = async (data: LeadCreateReq) =>
  post<{appId?: string, lead: LeadResult}>(URL.lead, data);

// update
const update = async (id: string, data: LeadUpdateReq) =>
  put<LeadResult>(URL.lead + `/${id}`, data);

// delete
// const remove = async (id: number) =>
//   del<ResData<any>>({ url: URL.emails + `/${id}` });

// importExcel
export const importExcel = async (file: File): Promise<ImportResult> => {
  const formData = new FormData();
  formData.append('file', file);

  return post<ImportResult>(URL.lead + '/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// download Template
export const downloadTemplate = () => {
  return get<Blob>(URL.lead + '/template', {}, { responseType: 'blob' }, false);
}

// remove
const remove = async (id: string) =>
  del<any>(URL.lead + `/${id}`);

export const LeadApi = { getAll, getDetail, create, update, importExcel, remove, downloadTemplate };
