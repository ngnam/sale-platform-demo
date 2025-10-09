import {
  AppsReqParams,
  AppListDto,
  CreateAppFromLeadReq,
  CreateAppResult,
} from "./types/apps";
import { get, post, del } from "@/utils/http";
import { PagedResult } from "./types/common";

const URL = {
  app: "/Apps",
};

// get all
const getAll = async (params: AppsReqParams) =>
  get<PagedResult<AppListDto>>(URL.app, params);

// get detail
const getDetail = async (id: string) => get<AppListDto>(URL.app + `/${id}`);

// create
const create = async (data: CreateAppFromLeadReq) =>
  post<CreateAppResult>(URL.app, data);

// remove
const remove = async (id: string) =>
  del<any>(URL.app + `/${id}`);


export const AppsApi = { getAll, getDetail, create, remove };
