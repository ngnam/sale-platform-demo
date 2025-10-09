import { PagedResult } from "./types/common";
import {
  CreateQuoteResult,
  QuoteListDto,
  QuoteReqParams,
  QuoteDetailDto,
  CreateQuoteDto
} from "./types/quote";
import { del, get, post } from "@/utils/http";

const URL = {
  quote: "/Quotes",
};

// get all
const getAll = async (params: QuoteReqParams) =>
  get<PagedResult<QuoteListDto>>(URL.quote, params);

// get detail
const getDetail = async (id: string) =>
  get<QuoteDetailDto>(URL.quote + `/${id}`);

// create
const create = async (data: CreateQuoteDto) =>
  post<CreateQuoteResult>(URL.quote, data);

// remove
const remove = async (id: string) =>
  del<any>(URL.quote + `/${id}`);

export const QuoteApi = { getAll, getDetail, create, remove };
