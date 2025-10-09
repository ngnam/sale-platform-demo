import { PagedResult } from "./types/common";
import {
  CreateIllustrationReq,
  IllustrationReqParams,
  IllustrationDetailDto,
  IllustrationListDto
} from "./types/illustration";
import { del, get, post } from "@/utils/http";

const URL = {
  Illustration: "/Illustrations",
};

// get all
const getAll = async (params: IllustrationReqParams) =>
  get<PagedResult<IllustrationListDto>>(URL.Illustration, params);

// get detail
const getDetail = async (id: string) =>
  get<IllustrationDetailDto>(URL.Illustration + `/${id}`);

// create
const create = async (data: CreateIllustrationReq) =>
  post<any>(URL.Illustration, data);

// getPdf
const getPdf = async (id: string) =>
  get<Blob>(URL.Illustration + `/${id}/pdf`, {}, { responseType: "blob" });
  // get<Blob>(URL.lead + '/template', {}, { responseType: 'blob' }, false);


// remove
const remove = async (id: string) =>
  del<any>(URL.Illustration + `/${id}`);

export const IllustrationApi = { getAll, getDetail, create, getPdf, remove };
